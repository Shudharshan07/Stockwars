package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"stockwars/engine"
	"strings"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

type GameManager struct {
	games map[string]*engine.Game
	mu    sync.RWMutex
}

func NewGameManager() *GameManager {
	return &GameManager{
		games: make(map[string]*engine.Game),
	}
}

func (gm *GameManager) StartGame(id string) (*engine.Game, bool) {
	gm.mu.Lock()
	defer gm.mu.Unlock()

	if game, exists := gm.games[id]; exists {
		return game, false
	}

	game := engine.NewGame()
	gm.games[id] = game

	go game.Start()
	return game, true
}

func (gm *GameManager) GetGame(id string) (*engine.Game, bool) {
	gm.mu.RLock()
	defer gm.mu.RUnlock()

	game, ok := gm.games[id]
	return game, ok
}

func (gm *GameManager) RemoveGame(id string) {
	gm.mu.Lock()
	defer gm.mu.Unlock()

	delete(gm.games, id)
}

func (gm *GameManager) ConsumeWarStream(ctx context.Context, rdb *redis.Client, warCode string, game *engine.Game) {
	streamKey := fmt.Sprintf("war:%s:orders", warCode)
	groupName := "matching-engine-group"

	hostname, _ := os.Hostname()
	consumerName := fmt.Sprintf("engine-%s-%d", hostname, os.Getpid())

	err := rdb.XGroupCreateMkStream(ctx, streamKey, groupName, "0").Err()

	if err != nil && !strings.Contains(err.Error(), "BUSYGROUP") {
		log.Println("Error creating group:", err)
	}

	for {
		entries, err := rdb.XReadGroup(ctx, &redis.XReadGroupArgs{
			Group:    groupName,
			Consumer: consumerName,
			Streams:  []string{streamKey, ">"},
			Count:    10,
			Block:    0,
		}).Result()

		if err != nil {
			if ctx.Err() != nil {
				return
			}
			continue
		}

		for _, stream := range entries {
			for _, msg := range stream.Messages {
				order := engine.ParseOrderFromMap(msg.Values)
				if order != nil {
					game.Input <- order
				}
				rdb.XAck(ctx, streamKey, groupName, msg.ID)
			}
		}
	}
}

func (gm *GameManager) ProcessIncomingOrder(ctx context.Context, rdb *redis.Client, warCode string, userId string, req engine.Order) {
	if game, ok := gm.GetGame(warCode); ok {
		game.Input <- &engine.Order{
			PlayerID:  userId,
			Type:      req.Type,
			Quantity:  req.Quantity,
			Price:     req.Price,
			Timestamp: time.Now(),
		}
	}

	go func() {
		streamKey := fmt.Sprintf("war:%s:orders", warCode)
		rdb.XAdd(ctx, &redis.XAddArgs{
			Stream: streamKey,
			Values: map[string]interface{}{
				"player_id": userId,
				"type":      int(req.Type),
				"quantity":  req.Quantity,
				"price":     req.Price,
			},
		})
	}()
}
