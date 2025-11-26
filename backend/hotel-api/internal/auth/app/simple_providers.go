package app

import (
	"context"
	"fmt"
	"time"

	"github.com/yourorg/hotel-api/internal/auth/domain"
)

type PlainPasswordChecker struct{}

func (PlainPasswordChecker) Verify(hashed, plain string) bool {
	return hashed == hashPassword(plain)
}

func hashPassword(plain string) string {
	// Placeholder hash for demo only.
	return "hashed-" + plain
}

type StaticTokenIssuer struct {
	issuer string
}

func NewStaticTokenIssuer(issuer string) StaticTokenIssuer {
	return StaticTokenIssuer{issuer: issuer}
}

func (i StaticTokenIssuer) Issue(ctx context.Context, user domain.User) (string, error) {
	_ = ctx
	return fmt.Sprintf("token-%s-%d", user.ID, time.Now().Unix()), nil
}

func HashForSeed(plain string) string {
	return hashPassword(plain)
}
