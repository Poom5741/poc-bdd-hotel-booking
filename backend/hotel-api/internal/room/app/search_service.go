package app

import (
	"context"
	"errors"
	"time"

	bookingdomain "github.com/yourorg/hotel-api/internal/booking/domain"
	bookingports "github.com/yourorg/hotel-api/internal/booking/ports"
	roomdomain "github.com/yourorg/hotel-api/internal/room/domain"
	roomports "github.com/yourorg/hotel-api/internal/room/ports"
)

var (
	ErrInvalidDateRange = errors.New("invalid date range")
)

type SearchService struct {
	rooms    roomports.RoomRepository
	bookings bookingports.BookingRepository
}

func NewSearchService(rooms roomports.RoomRepository, bookings bookingports.BookingRepository) *SearchService {
	return &SearchService{
		rooms:    rooms,
		bookings: bookings,
	}
}

type SearchInput struct {
	CheckIn  time.Time
	CheckOut time.Time
	Guests   int
}

func (s *SearchService) Search(ctx context.Context, input SearchInput) ([]roomdomain.Room, error) {
	if input.CheckIn.IsZero() || input.CheckOut.IsZero() || !input.CheckOut.After(input.CheckIn) {
		return nil, ErrInvalidDateRange
	}

	candidates, err := s.rooms.SearchAvailable(ctx, roomports.SearchParams{
		CheckIn:  input.CheckIn,
		CheckOut: input.CheckOut,
		Guests:   input.Guests,
	})
	if err != nil {
		return nil, err
	}

	allBookings, err := s.bookings.List(ctx)
	if err != nil {
		return nil, err
	}

	var result []roomdomain.Room
	for _, room := range candidates {
		if room.Status == "OUT_OF_ORDER" {
			continue
		}
		if hasOverlap(allBookings, room.ID, input.CheckIn, input.CheckOut) {
			continue
		}
		result = append(result, room)
	}

	return result, nil
}

func hasOverlap(bookings []bookingdomain.Booking, roomID string, from, to time.Time) bool {
	for _, b := range bookings {
		if b.RoomID != roomID {
			continue
		}
		if from.Before(b.CheckOut) && to.After(b.CheckIn) {
			return true
		}
	}
	return false
}
