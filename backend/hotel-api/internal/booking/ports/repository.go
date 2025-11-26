package ports

import (
	"context"

	"github.com/yourorg/hotel-api/internal/booking/domain"
)

type BookingRepository interface {
	FindByUser(ctx context.Context, userID string) ([]domain.Booking, error)
	Create(ctx context.Context, booking domain.Booking) error
}
