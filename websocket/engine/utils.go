package engine

import (
	"strconv"
	"time"
)

func ParseOrderFromMap(values map[string]any) *Order {
	if values == nil {
		return nil
	}

	order := &Order{}

	if v, ok := values["player_id"].(string); ok {
		order.PlayerID = v
	} else {
		return nil
	}

	// for now , for testing
	if t, ok := values["type"].(string); ok {
		if t == "sell" || t == "1" {
			order.Type = Sell
		} else {
			order.Type = Buy
		}
	} else {
		return nil
	}

	// Quantity
	switch v := values["quantity"].(type) {
	case int64:
		order.Quantity = int(v)
	case string:
		q, err := strconv.Atoi(v)
		if err != nil {
			return nil
		}
		order.Quantity = q
	default:
		return nil
	}

	// Price
	switch v := values["price"].(type) {
	case float64:
		order.Price = v
	case string:
		p, err := strconv.ParseFloat(v, 64)
		if err != nil {
			return nil
		}
		order.Price = p
	case int64:
		order.Price = float64(v)
	default:
		return nil
	}

	// Timestamp
	switch v := values["timestamp"].(type) {
	case string:
		t, err := time.Parse(time.RFC3339, v)
		if err != nil {
			return nil
		}
		order.Timestamp = t
	case int64:
		order.Timestamp = time.Unix(v, 0)
	default:
		order.Timestamp = time.Now()
	}

	return order
}
