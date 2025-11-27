package app

import (
	"context"
	"errors"
	"fmt"
	"time"

	bookingdomain "github.com/yourorg/hotel-api/internal/booking/domain"
	bookingports "github.com/yourorg/hotel-api/internal/booking/ports"
	roomports "github.com/yourorg/hotel-api/internal/room/ports"
)

var (
	ErrInvalidDateRange = errors.New("invalid date range")
	ErrRoomUnavailable  = errors.New("room is not available for the selected dates")
	ErrCannotCancelPast = errors.New("cannot cancel past bookings")
	ErrBookingNotFound  = errors.New("booking not found")
	ErrGuestsExceedRoom = errors.New("guests exceed room capacity")
	ErrRoomNotFound     = errors.New("room not found")
	ErrTooEarlyCheckIn  = errors.New("cannot check in before the check-in date")
	ErrTooEarlyCheckOut = errors.New("cannot check out before the check-out date")
)

type Service struct {
	bookings bookingports.BookingRepository
	rooms    roomports.RoomRepository
	nowFn    func() time.Time
}

func NewService(bookings bookingports.BookingRepository, rooms roomports.RoomRepository) *Service {
	return &Service{
		bookings: bookings,
		rooms:    rooms,
		nowFn:    time.Now,
	}
}

type CreateRequest struct {
	UserID   string
	RoomID   string
	CheckIn  time.Time
	CheckOut time.Time
	Guests   int
}

type CreateResponse struct {
	ID       string
	RoomID   string
	CheckIn  time.Time
	CheckOut time.Time
	Status   string
}

type ListFilters struct {
	From *time.Time
	To   *time.Time
}

func (s *Service) Create(ctx context.Context, req CreateRequest) (*CreateResponse, error) {
	if req.CheckIn.IsZero() || req.CheckOut.IsZero() || !req.CheckOut.After(req.CheckIn) {
		return nil, ErrInvalidDateRange
	}

	rooms, err := s.rooms.SearchAvailable(ctx, roomports.SearchParams{
		CheckIn:  req.CheckIn,
		CheckOut: req.CheckOut,
		Guests:   req.Guests,
	})
	if err != nil {
		return nil, err
	}

	var roomFound bool
	for _, r := range rooms {
		if r.ID == req.RoomID {
			roomFound = true
			if req.Guests > 0 && r.Capacity < req.Guests {
				return nil, ErrGuestsExceedRoom
			}
			break
		}
	}
	if !roomFound {
		return nil, ErrRoomNotFound
	}

	allBookings, err := s.bookings.List(ctx)
	if err != nil {
		return nil, err
	}
	for _, b := range allBookings {
		if b.RoomID == req.RoomID && overlaps(req.CheckIn, req.CheckOut, b.CheckIn, b.CheckOut) {
			return nil, ErrRoomUnavailable
		}
	}

	id := fmt.Sprintf("booking-%d", s.nowFn().UnixNano())
	newBooking := bookingdomain.Booking{
		ID:        id,
		UserID:    req.UserID,
		RoomID:    req.RoomID,
		CheckIn:   req.CheckIn,
		CheckOut:  req.CheckOut,
		Status:    "confirmed",
		CreatedAt: s.nowFn(),
	}

	if err := s.bookings.Create(ctx, newBooking); err != nil {
		return nil, err
	}

	return &CreateResponse{
		ID:       id,
		RoomID:   req.RoomID,
		CheckIn:  req.CheckIn,
		CheckOut: req.CheckOut,
		Status:   newBooking.Status,
	}, nil
}

func (s *Service) ListByUser(ctx context.Context, userID string) ([]bookingdomain.Booking, error) {
	return s.bookings.FindByUser(ctx, userID)
}

func (s *Service) List(ctx context.Context, filters ListFilters) ([]bookingdomain.Booking, error) {
	bookings, err := s.bookings.List(ctx)
	if err != nil {
		return nil, err
	}

	var result []bookingdomain.Booking
	for _, b := range bookings {
		checkInDate := startOfDay(b.CheckIn)
		checkOutDate := startOfDay(b.CheckOut)

		if filters.From != nil && checkInDate.Before(startOfDay(*filters.From)) {
			continue
		}
		if filters.To != nil && checkOutDate.After(endOfDay(*filters.To)) {
			continue
		}
		result = append(result, b)
	}

	return result, nil
}

func (s *Service) Cancel(ctx context.Context, bookingID string) error {
	b, err := s.bookings.FindByID(ctx, bookingID)
	if err != nil {
		return err
	}
	if b == nil {
		return ErrBookingNotFound
	}

	now := s.nowFn()
	if b.CheckIn.Before(now) {
		return ErrCannotCancelPast
	}

	b.Status = "cancelled"
	return s.bookings.Update(ctx, *b)
}

func (s *Service) CheckIn(ctx context.Context, bookingID string, actionTime time.Time) (*bookingdomain.Booking, error) {
	booking, err := s.bookings.FindByID(ctx, bookingID)
	if err != nil {
		return nil, err
	}
	if booking == nil {
		return nil, ErrBookingNotFound
	}

	if actionTime.IsZero() {
		actionTime = s.nowFn()
	}

	if beforeDate(actionTime, booking.CheckIn) {
		return nil, ErrTooEarlyCheckIn
	}

	booking.Status = "Checked-in"
	if err := s.bookings.Update(ctx, *booking); err != nil {
		return nil, err
	}
	return booking, nil
}

func (s *Service) CheckOut(ctx context.Context, bookingID string, actionTime time.Time) (*bookingdomain.Booking, error) {
	booking, err := s.bookings.FindByID(ctx, bookingID)
	if err != nil {
		return nil, err
	}
	if booking == nil {
		return nil, ErrBookingNotFound
	}

	if actionTime.IsZero() {
		actionTime = s.nowFn()
	}

	if beforeDate(actionTime, booking.CheckOut) {
		return nil, ErrTooEarlyCheckOut
	}

	booking.Status = "Checked-out"
	if err := s.bookings.Update(ctx, *booking); err != nil {
		return nil, err
	}
	return booking, nil
}

func overlaps(startA, endA, startB, endB time.Time) bool {
	return startA.Before(endB) && endA.After(startB)
}

func startOfDay(t time.Time) time.Time {
	y, m, d := t.Date()
	return time.Date(y, m, d, 0, 0, 0, 0, t.Location())
}

func endOfDay(t time.Time) time.Time {
	y, m, d := t.Date()
	return time.Date(y, m, d, 23, 59, 59, int(time.Second-time.Nanosecond), t.Location())
}

func beforeDate(a, b time.Time) bool {
	return startOfDay(a).Before(startOfDay(b))
}
