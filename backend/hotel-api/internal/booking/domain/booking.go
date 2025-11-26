package domain

import "time"

// Booking represents a reservation made by a user for a room.
type Booking struct {
	ID        string
	UserID    string
	RoomID    string
	CheckIn   time.Time
	CheckOut  time.Time
	Status    string
	CreatedAt time.Time
}
