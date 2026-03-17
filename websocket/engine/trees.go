package engine

import "github.com/google/btree"

type SellOrder struct {
	*Order
}

func (m SellOrder) Less(n btree.Item) bool {
	val := n.(SellOrder)
	if m.Price == val.Price {
		return m.Timestamp.Before(val.Timestamp)
	}

	return m.Price < val.Price
}

type BuyOrder struct {
	*Order
}

func (m BuyOrder) Less(n btree.Item) bool {
	val := n.(BuyOrder)

	if m.Price == val.Price {
		return m.Timestamp.Before(val.Timestamp)
	}

	return m.Price > val.Price
}
