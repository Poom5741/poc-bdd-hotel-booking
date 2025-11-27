package seed

import (
	"context"
	"errors"
	"time"

	authdomain "github.com/yourorg/hotel-api/internal/auth/domain"
	authports "github.com/yourorg/hotel-api/internal/auth/ports"
	bookingdomain "github.com/yourorg/hotel-api/internal/booking/domain"
	bookingports "github.com/yourorg/hotel-api/internal/booking/ports"
	roomdomain "github.com/yourorg/hotel-api/internal/room/domain"
	roomports "github.com/yourorg/hotel-api/internal/room/ports"
)

type InMemoryStore struct {
	users    map[string]authdomain.User
	rooms    map[string]roomdomain.Room
	bookings map[string]bookingdomain.Booking
}

var _ authports.UserRepository = (*InMemoryStore)(nil)
var _ roomports.RoomRepository = (*InMemoryStore)(nil)
var _ bookingports.BookingRepository = (*InMemoryStore)(nil)

func NewInMemoryStore() *InMemoryStore {
	return &InMemoryStore{
		users:    make(map[string]authdomain.User),
		rooms:    make(map[string]roomdomain.Room),
		bookings: make(map[string]bookingdomain.Booking),
	}
}

func (s *InMemoryStore) SaveUser(ctx context.Context, user authdomain.User) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}
	if user.Email == "" {
		return errors.New("user email required")
	}
	s.users[user.ID] = user
	return nil
}

func (s *InMemoryStore) FindByEmail(ctx context.Context, email string) (*authdomain.User, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}
	for _, u := range s.users {
		if u.Email == email {
			userCopy := u
			return &userCopy, nil
		}
	}
	return nil, nil
}

func (s *InMemoryStore) SaveRoom(ctx context.Context, room roomdomain.Room) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}
	if room.ID == "" {
		return errors.New("room id required")
	}
	s.rooms[room.ID] = room
	return nil
}

// UpdateRoomStatus implements roomports.RoomRepository.
func (s *InMemoryStore) UpdateRoomStatus(ctx context.Context, id string, status string) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}
	room, ok := s.rooms[id]
	if !ok {
		return errors.New("room not found")
	}
	room.Status = status
	s.rooms[id] = room
	return nil
}

// DeleteRoom implements roomports.RoomRepository.
func (s *InMemoryStore) DeleteRoom(ctx context.Context, id string) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}
	if _, ok := s.rooms[id]; !ok {
		return errors.New("room not found")
	}
	delete(s.rooms, id)
	return nil
}

// ListRooms implements roomports.RoomRepository.
func (s *InMemoryStore) ListRooms(ctx context.Context) ([]roomdomain.Room, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	var result []roomdomain.Room
	for _, r := range s.rooms {
		result = append(result, r)
	}
	return result, nil
}

// FindRoomByID implements roomports.RoomRepository.
func (s *InMemoryStore) FindRoomByID(ctx context.Context, id string) (*roomdomain.Room, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	if r, ok := s.rooms[id]; ok {
		roomCopy := r
		return &roomCopy, nil
	}
	return nil, nil
}

func (s *InMemoryStore) SearchAvailable(ctx context.Context, params roomports.SearchParams) ([]roomdomain.Room, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	var result []roomdomain.Room
	for _, r := range s.rooms {
		if params.Guests > 0 && r.Capacity < params.Guests {
			continue
		}
		if r.Status != "" && r.Status != "available" {
			continue
		}
		result = append(result, r)
	}
	return result, nil
}

func (s *InMemoryStore) SaveBooking(ctx context.Context, booking bookingdomain.Booking) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}
	if booking.ID == "" {
		return errors.New("booking id required")
	}
	if booking.CreatedAt.IsZero() {
		booking.CreatedAt = time.Now()
	}
	s.bookings[booking.ID] = booking
	return nil
}

// Create implements bookingports.BookingRepository.
func (s *InMemoryStore) Create(ctx context.Context, booking bookingdomain.Booking) error {
	return s.SaveBooking(ctx, booking)
}

func (s *InMemoryStore) Update(ctx context.Context, booking bookingdomain.Booking) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}
	if booking.ID == "" {
		return errors.New("booking id required")
	}
	s.bookings[booking.ID] = booking
	return nil
}

func (s *InMemoryStore) FindByUser(ctx context.Context, userID string) ([]bookingdomain.Booking, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	var result []bookingdomain.Booking
	for _, b := range s.bookings {
		if b.UserID == userID {
			result = append(result, b)
		}
	}
	return result, nil
}

func (s *InMemoryStore) List(ctx context.Context) ([]bookingdomain.Booking, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	var bookings []bookingdomain.Booking
	for _, b := range s.bookings {
		bookings = append(bookings, b)
	}
	return bookings, nil
}

func (s *InMemoryStore) FindByID(ctx context.Context, id string) (*bookingdomain.Booking, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	if b, ok := s.bookings[id]; ok {
		booking := b
		return &booking, nil
	}
	return nil, nil
}
