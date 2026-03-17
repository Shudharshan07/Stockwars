package engine

import (
	"fmt"
	"testing"
	"time"
)

func TestEngine(t *testing.T) {
	game := NewGame()

	go game.Start()

	testOrders := []*Order{
		// 1. Add a Sell order at 105
		{PlayerID: "Player_A", Type: Sell, Quantity: 10, Price: 105.0, Timestamp: time.Now()},
		// 2. Add a Buy order at 100 (No match yet, spread is 100-105)
		{PlayerID: "Player_B", Type: Buy, Quantity: 5, Price: 100.0, Timestamp: time.Now().Add(time.Millisecond)},
		// 3. Player_C Buys at 105 (Should fully match Player_A)
		{PlayerID: "Player_C", Type: Buy, Quantity: 10, Price: 105.0, Timestamp: time.Now().Add(2 * time.Millisecond)},
		// 4. Player_D Sells at 98 (Should partially match Player_B's 5 units at 100)
		{PlayerID: "Player_D", Type: Sell, Quantity: 10, Price: 98.0, Timestamp: time.Now().Add(3 * time.Millisecond)},
	}

	fmt.Println("Sending test orders...")
	for _, ord := range testOrders {
		game.Input <- ord
	}

	time.Sleep(time.Second)
	fmt.Println("Test complete.")
}

func TestEdgeCases(t *testing.T) {
	g := NewGame()
	go g.Start() // FIX: Use 'go' to prevent blocking

	now := time.Now()

	// --- Case A: Zero or Negative Quantity ---
	// Engine should ideally ignore these or handle gracefully
	fmt.Println("--- Testing Invalid Quantities ---")
	g.Input <- &Order{PlayerID: "Bad_Actor", Type: Buy, Quantity: 0, Price: 100.0, Timestamp: now}
	g.Input <- &Order{PlayerID: "Bad_Actor", Type: Buy, Quantity: -10, Price: 100.0, Timestamp: now}

	// --- Case B: Self-Matching (Wash Trading) ---
	// In many games/exchanges, a player shouldn't match with themselves.
	fmt.Println("--- Testing Self-Matching ---")
	g.Input <- &Order{PlayerID: "Player_1", Type: Sell, Quantity: 10, Price: 50.0, Timestamp: now}
	g.Input <- &Order{PlayerID: "Player_1", Type: Buy, Quantity: 10, Price: 50.0, Timestamp: now.Add(time.Second)}

	// --- Case C: Extreme Price Spreads ---
	// Testing very high/low prices to ensure float comparison doesn't fail
	fmt.Println("--- Testing Price Extremes ---")
	g.Input <- &Order{PlayerID: "Cheap_Buyer", Type: Buy, Quantity: 1, Price: 0.00001, Timestamp: now}
	g.Input <- &Order{PlayerID: "Expensive_Seller", Type: Sell, Quantity: 1, Price: 999999.9, Timestamp: now}

	// --- Case D: Immediate Fill or Kill (Implicit) ---
	// Testing a buy order that is priced significantly higher than the best ask
	fmt.Println("--- Testing High-Price Market Sweep ---")
	g.Input <- &Order{PlayerID: "Resting_Sell", Type: Sell, Quantity: 5, Price: 10.0, Timestamp: now}
	g.Input <- &Order{PlayerID: "Aggressive_Buy", Type: Buy, Quantity: 5, Price: 20.0, Timestamp: now.Add(time.Second)}

	time.Sleep(500 * time.Millisecond)
}
