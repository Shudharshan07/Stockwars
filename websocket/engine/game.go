package engine

import (
	"sync"
)

type Game struct {
	Orderbook   *OrderBook
	Input       chan *Order
	Output      chan Trade
	StopSignal  chan struct{}
	mu          sync.RWMutex
	Subscribers map[string]chan Trade
	subMu       sync.RWMutex
}

func NewGame() *Game {
	return &Game{
		Orderbook:   NewOrderBook(),
		Input:       make(chan *Order, 10000),
		Output:      make(chan Trade, 1000),
		StopSignal:  make(chan struct{}),
		Subscribers: make(map[string]chan Trade),
	}
}

func (g *Game) Start() {
	for {
		select {
		case order := <-g.Input:
			g.mu.Lock()
			trades := g.Orderbook.Process(order)
			g.mu.Unlock()
			for _, trade := range trades {
				g.Output <- trade
				g.subMu.RLock()

				for _, subChan := range g.Subscribers {
					select {
					case subChan <- trade:
					default:
					}
				}
				g.subMu.RUnlock()
			}

		case <-g.StopSignal:
			close(g.Output)
			return

		}
	}
}

func (g *Game) AddSubscriber(userId string, tradeChannel chan Trade) {
	g.subMu.Lock()
	defer g.subMu.Unlock()

	g.Subscribers[userId] = tradeChannel
}

func (g *Game) RemoveSubscriber(userId string) {
	g.subMu.Lock()
	defer g.subMu.Unlock()

	delete(g.Subscribers, userId)
}
