package ports

import (
	"context"

	"github.com/yourorg/hotel-api/internal/booking/domain"
)

type BookingRepository interface {
	FindByUser(ctx context.Context, userID string) ([]domain.Booking, error)
	Create(ctx context.Context, booking domain.Booking) error
	List(ctx context.Context) ([]domain.Booking, error)
	FindByID(ctx context.Context, id string) (*domain.Booking, error)
	Update(ctx context.Context, booking domain.Booking) error
}
