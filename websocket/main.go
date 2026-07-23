package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"stockwars/engine"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var manager *GameManager = NewGameManager()

const MaxUserPendingTrades = 100

func ListenForNewWars(ctx context.Context, rdb *redis.Client) {
	stream := "global:war_events"
	group := "war_events-group"

	hostname, _ := os.Hostname()
	consumerName := fmt.Sprintf("event-%s-%d", hostname, os.Getpid())

	err := rdb.XGroupCreateMkStream(ctx, stream, group, "0").Err()
	if err != nil && !strings.Contains(err.Error(), "BUSYGROUP") {
		log.Println("Error creating group:", err)
	}

	for {
		streams, err := rdb.XReadGroup(ctx, &redis.XReadGroupArgs{
			Group:    group,
			Consumer: consumerName,
			Streams:  []string{stream, ">"},
			Count:    10,
			Block:    0,
		}).Result()

		if err != nil {
			log.Println("an error")
			continue
		}

		for _, s := range streams {
			for _, msg := range s.Messages {
				warCode := msg.Values["warCode"].(string)
				manager.StartGame(warCode)
				if game, ok := manager.GetGame(warCode); ok {
					go manager.ConsumeWarStream(ctx, rdb, warCode, game)
				}
				rdb.XAck(ctx, stream, group, msg.ID)
			}
		}
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// for now we are skipping orgins
		return true
	},
}

func validateRequest(r *http.Request) (string, string, error) {
	token := r.URL.Query().Get("token")
	warCode := r.URL.Query().Get("warCode")

	if token == "" || warCode == "" {
		return "", "", fmt.Errorf("missing credentials")
	}

	userId, err := ValidateJWT(token)
	return userId, warCode, err
}

func handler(rdb *redis.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, warCode, err := validateRequest(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		game, ok := manager.GetGame(warCode)
		if !ok {
			http.Error(w, "War not found", http.StatusNotFound)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}
		defer conn.Close()

		messageChan := make(chan engine.Trade, MaxUserPendingTrades)
		game.AddSubscriber(userId, messageChan)
		// conn.WriteJSON(engine.WSMessage{
		// 	Type: "LEADERBOARD_UPDATE",
		// 	Data: engine.LeaderboardEntry{
		// 		Username: userId,
		// 		Wealth:  0,
		// 	},
		// })
		defer game.RemoveSubscriber(userId)

		go func() {
			for {
				var req engine.Order
				if err := conn.ReadJSON(&req); err != nil {
					game.RemoveSubscriber(userId)
					log.Printf("User %s disconnected", userId)
					return
				}

				go func(o engine.Order) {
					streamKey := fmt.Sprintf("war:%s:orders", warCode)
					rdb.XAdd(r.Context(), &redis.XAddArgs{
						Stream: streamKey,
						Values: map[string]interface{}{
							"player_id": userId,
							"type":      o.Type,
							"quantity":  o.Quantity,
							"price":     o.Price,
						},
					})
				}(req)

				orderType := engine.Buy
				if req.Type == 1 {
					orderType = engine.Sell
				}

				game.Input <- &engine.Order{
					PlayerID:  userId,
					Type:      orderType,
					Quantity:  req.Quantity,
					Price:     req.Price,
					Timestamp: time.Now(),
				}
			}
		}()

		leaderboardKey := fmt.Sprintf("war:%s:leaderboard", warCode)
		users, err := rdb.ZRevRangeWithScores(r.Context(), leaderboardKey, 0, -1).Result()
		if err == nil {
			log.Println(len(users), "users found initially")
			entries := make([]engine.LeaderboardEntry, len(users))
			for i, u := range users {
				entries[i] = engine.LeaderboardEntry{
					Username: u.Member.(string),
					Wealth:   u.Score,
				}
			}
			conn.WriteJSON(engine.WSMessage{
				Type: "INITIAL_USERS",
				Data: entries,
			})
		}

		for trade := range messageChan {
			// Wrap trade in standard message format
			msg := engine.WSMessage{
				Type: "TRADE",
				Data: trade,
			}
			if err := conn.WriteJSON(msg); err != nil {
				break
			}
		}
	}
}

func SyncExistingWars(ctx context.Context, rdb *redis.Client) {
	keys, err := rdb.Keys(ctx, "war:*:meta").Result()
	if err != nil {
		log.Printf("Error scanning Redis for existing wars: %v", err)
		return
	}

	log.Printf("Found %d existing wars in Redis. Synchronizing...", len(keys))

	for _, key := range keys {
		parts := strings.Split(key, ":")
		if len(parts) < 2 {
			continue
		}
		warCode := parts[1]

		if _, exists := manager.GetGame(warCode); !exists {
			log.Printf("Starting engine for existing war: %s", warCode)
			manager.StartGame(warCode)

			// Start consuming the Redis Stream for this specific game
			if game, ok := manager.GetGame(warCode); ok {
				go manager.ConsumeWarStream(ctx, rdb, warCode, game)
			}
		}
	}
}

func main() {
	_, err := LoadEnv()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	REDIS_HOST := os.Getenv("REDIS_HOST")
	REDIS_PORT := os.Getenv("REDIS_PORT")
	REDIS_PASS := os.Getenv("REDIS_PASS")

	rdb := redis.NewClient(&redis.Options{
		Addr:     REDIS_HOST + ":" + REDIS_PORT,
		Password: REDIS_PASS,
	})

	SyncExistingWars(ctx, rdb)
	go ListenForNewWars(ctx, rdb)

	SERVER_PORT := os.Getenv("SERVER_PORT")

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", handler(rdb))
	server := &http.Server{
		Addr:    ":" + SERVER_PORT,
		Handler: mux,
	}

	go func() {
		log.Println("server running on :" + SERVER_PORT)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	<-ctx.Done()
	log.Println("shutting down")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	server.Shutdown(shutdownCtx)
}
