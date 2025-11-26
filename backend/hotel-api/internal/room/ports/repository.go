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
}
