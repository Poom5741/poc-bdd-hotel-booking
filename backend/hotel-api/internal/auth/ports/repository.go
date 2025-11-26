package ports

import (
	"context"

	"github.com/yourorg/hotel-api/internal/auth/domain"
)

type UserRepository interface {
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
}
