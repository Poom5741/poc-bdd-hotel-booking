package domain

// User represents an authenticated account in the system.
type User struct {
	ID           string
	Email        string
	PasswordHash string
	Role         string
}
