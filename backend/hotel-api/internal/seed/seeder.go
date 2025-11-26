package seed

import (
	"context"
	"log"
	"time"

	authdomain "github.com/yourorg/hotel-api/internal/auth/domain"
	bookingdomain "github.com/yourorg/hotel-api/internal/booking/domain"
	roomdomain "github.com/yourorg/hotel-api/internal/room/domain"
)

type userWriter interface {
	SaveUser(ctx context.Context, user authdomain.User) error
}

type roomWriter interface {
	SaveRoom(ctx context.Context, room roomdomain.Room) error
}

type bookingWriter interface {
	SaveBooking(ctx context.Context, booking bookingdomain.Booking) error
}

type Seeder struct {
	users    userWriter
	rooms    roomWriter
	bookings bookingWriter
	nowFn    func() time.Time
}

func NewSeeder(users userWriter, rooms roomWriter, bookings bookingWriter) *Seeder {
	return &Seeder{
		users:    users,
		rooms:    rooms,
		bookings: bookings,
		nowFn:    time.Now,
	}
}

func Run(ctx context.Context) error {
	mem := newInMemoryStore()
	seeder := NewSeeder(mem, mem, mem)
	return seeder.Seed(ctx)
}

func (s *Seeder) Seed(ctx context.Context) error {
	now := s.nowFn()

	admin := authdomain.User{
		ID:           "user-admin-1",
		Email:        "admin@stayflex.test",
		PasswordHash: "hashed-admin123",
		Role:         "admin",
	}

	guests := []authdomain.User{
		{
			ID:           "user-guest-1",
			Email:        "guest1@stayflex.test",
			PasswordHash: "hashed-password123",
			Role:         "guest",
		},
		{
			ID:           "user-guest-2",
			Email:        "guest2@stayflex.test",
			PasswordHash: "hashed-password456",
			Role:         "guest",
		},
	}

	rooms := []roomdomain.Room{
		{ID: "room-101", Name: "Standard 101", Type: "Standard", Capacity: 2, BasePrice: 120, Status: "available"},
		{ID: "room-201", Name: "Deluxe 201", Type: "Deluxe", Capacity: 3, BasePrice: 180, Status: "available"},
		{ID: "room-301", Name: "Suite 301", Type: "Suite", Capacity: 4, BasePrice: 250, Status: "available"},
	}

	bookings := []bookingdomain.Booking{
		{
			ID:        "booking-1",
			UserID:    "user-guest-1",
			RoomID:    "room-101",
			CheckIn:   time.Date(2025, 12, 1, 15, 0, 0, 0, time.UTC),
			CheckOut:  time.Date(2025, 12, 5, 11, 0, 0, 0, time.UTC),
			Status:    "confirmed",
			CreatedAt: now,
		},
		{
			ID:        "booking-2",
			UserID:    "user-guest-2",
			RoomID:    "room-201",
			CheckIn:   time.Date(2025, 12, 10, 15, 0, 0, 0, time.UTC),
			CheckOut:  time.Date(2025, 12, 12, 11, 0, 0, 0, time.UTC),
			Status:    "confirmed",
			CreatedAt: now,
		},
	}

	if err := s.users.SaveUser(ctx, admin); err != nil {
		return err
	}

	for _, guest := range guests {
		if err := s.users.SaveUser(ctx, guest); err != nil {
			return err
		}
	}

	for _, room := range rooms {
		if err := s.rooms.SaveRoom(ctx, room); err != nil {
			return err
		}
	}

	for _, booking := range bookings {
		if err := s.bookings.SaveBooking(ctx, booking); err != nil {
			return err
		}
	}

	log.Printf("seeded users=%d rooms=%d bookings=%d", 1+len(guests), len(rooms), len(bookings))
	return nil
}
