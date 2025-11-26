package app

import (
	"context"
	"errors"

	"github.com/yourorg/hotel-api/internal/auth/domain"
	"github.com/yourorg/hotel-api/internal/auth/ports"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
)

type PasswordChecker interface {
	Verify(hashed, plain string) bool
}

type TokenIssuer interface {
	Issue(ctx context.Context, user domain.User) (string, error)
}

type Service struct {
	users   ports.UserRepository
	checker PasswordChecker
	issuer  TokenIssuer
}

func NewService(users ports.UserRepository, checker PasswordChecker, issuer TokenIssuer) *Service {
	return &Service{
		users:   users,
		checker: checker,
		issuer:  issuer,
	}
}

type LoginRequest struct {
	Email    string
	Password string
}

type LoginResponse struct {
	Token string
	User  domain.User
}

func (s *Service) Login(ctx context.Context, req LoginRequest) (*LoginResponse, error) {
	user, err := s.users.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrInvalidCredentials
	}

	if !s.checker.Verify(user.PasswordHash, req.Password) {
		return nil, ErrInvalidCredentials
	}

	token, err := s.issuer.Issue(ctx, *user)
	if err != nil {
		return nil, err
	}

	return &LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}
