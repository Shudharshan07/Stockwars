package engine

import (
	"time"

	"github.com/google/btree"
)

type OrderType int

const Buy OrderType = 0
const Sell OrderType = 1

type Order struct {
	PlayerID  string    `json:"player_id"`
	Type      OrderType `json:"type"`
	Quantity  int       `json:"quantity"`
	Price     float64   `json:"price"`
	Timestamp time.Time `json:"timestamp"`
}

type Trade struct {
	BuyerId  string  `json:"buyer_id"`
	SellerId string  `json:"seller_id"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}

type LeaderboardEntry struct {
	Username string  `json:"username"`
	Wealth   float64 `json:"wealth"`
}

type WSMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

type OrderBook struct {
	BuyOrders  *btree.BTree
	SellOrders *btree.BTree
}

func NewOrderBook() *OrderBook {
	return &OrderBook{
		BuyOrders:  btree.New(32),
		SellOrders: btree.New(32),
	}
}

func (o *OrderBook) AddOrder(order *Order) {
	if order.Type == Buy {
		o.BuyOrders.ReplaceOrInsert(BuyOrder{order})
	} else {
		o.SellOrders.ReplaceOrInsert(SellOrder{order})
	}
}

func (o *OrderBook) Process(order *Order) []Trade {
	if order.Quantity <= 0 {
		return nil
	}

	trades := []Trade{}

	if order.Type == Buy {
		for o.SellOrders.Len() > 0 && order.Quantity > 0 {
			item := o.SellOrders.Min()
			if item == nil {
				break
			}

			bestAsk := item.(SellOrder).Order

			if order.Price < bestAsk.Price {
				break
			}

			minQuantity := min(order.Quantity, bestAsk.Quantity)

			order.Quantity -= minQuantity
			bestAsk.Quantity -= minQuantity

			trades = append(trades, Trade{
				BuyerId:  order.PlayerID,
				SellerId: bestAsk.PlayerID,
				Quantity: minQuantity,
				Price:    bestAsk.Price,
			})

			o.SellOrders.Delete(SellOrder{bestAsk})

			if bestAsk.Quantity > 0 {
				o.SellOrders.ReplaceOrInsert(SellOrder{bestAsk})
			}
		}

		if order.Quantity > 0 {
			o.BuyOrders.ReplaceOrInsert(BuyOrder{order})
		}

	} else {
		for o.BuyOrders.Len() > 0 && order.Quantity > 0 {
			item := o.BuyOrders.Max()
			if item == nil {
				break
			}

			bestBit := item.(BuyOrder).Order

			if order.PlayerID == bestBit.PlayerID {
				break
			}

			if bestBit.Price < order.Price {
				break
			}

			minQuantity := min(order.Quantity, bestBit.Quantity)

			order.Quantity -= minQuantity
			bestBit.Quantity -= minQuantity

			trades = append(trades, Trade{
				BuyerId:  bestBit.PlayerID,
				SellerId: order.PlayerID,
				Quantity: minQuantity,
				Price:    bestBit.Price,
			})

			o.BuyOrders.Delete(BuyOrder{bestBit})

			if bestBit.Quantity > 0 {
				o.BuyOrders.ReplaceOrInsert(BuyOrder{bestBit})
			}
		}

		if order.Quantity > 0 {
			o.SellOrders.ReplaceOrInsert(SellOrder{order})
		}
	}

	return trades
}
