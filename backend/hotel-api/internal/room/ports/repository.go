package ports

import (
	"context"
	"time"

	"github.com/yourorg/hotel-api/internal/room/domain"
)

type SearchParams struct {
	CheckIn  time.Time
	CheckOut time.Time
	Guests   int
}

type RoomRepository interface {
	SearchAvailable(ctx context.Context, params SearchParams) ([]domain.Room, error)
	ListRooms(ctx context.Context) ([]domain.Room, error)
	SaveRoom(ctx context.Context, room domain.Room) error
	UpdateRoomStatus(ctx context.Context, id string, status string) error
	DeleteRoom(ctx context.Context, id string) error
	FindRoomByID(ctx context.Context, id string) (*domain.Room, error)
}
