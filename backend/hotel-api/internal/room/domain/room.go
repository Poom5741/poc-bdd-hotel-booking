package domain

// Room represents a room type or unit that can be booked.
type Room struct {
	ID        string
	Name      string
	Type      string
	Capacity  int
	BasePrice float64
	Status    string
}
