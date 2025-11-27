package app

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	bookingports "github.com/yourorg/hotel-api/internal/booking/ports"
	roomdomain "github.com/yourorg/hotel-api/internal/room/domain"
	roomports "github.com/yourorg/hotel-api/internal/room/ports"
)

var (
	ErrRoomHasFutureBookings = errors.New("cannot delete room with future bookings")
	ErrRoomNotFound          = errors.New("room not found")
	ErrInvalidRoomStatus     = errors.New("invalid room status")
)

type AdminService struct {
	rooms    roomports.RoomRepository
	bookings bookingports.BookingRepository
	nowFn    func() time.Time
}

func NewAdminService(rooms roomports.RoomRepository, bookings bookingports.BookingRepository) *AdminService {
	return &AdminService{
		rooms:    rooms,
		bookings: bookings,
		nowFn:    time.Now,
	}
}

type RoomResponse struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	Capacity  int     `json:"capacity"`
	BasePrice float64 `json:"basePrice"`
	Status    string  `json:"status"`
}

type CreateRoomRequest struct {
	ID        string
	Name      string
	Type      string
	Capacity  int
	BasePrice float64
	Status    string
}

func (s *AdminService) List(ctx context.Context) ([]RoomResponse, error) {
	rooms, err := s.rooms.ListRooms(ctx)
	if err != nil {
		return nil, err
	}
	return mapRooms(rooms), nil
}

func (s *AdminService) Create(ctx context.Context, req CreateRoomRequest) (*RoomResponse, error) {
	if req.Name == "" || req.Type == "" || req.Capacity <= 0 || req.BasePrice <= 0 {
		return nil, errors.New("invalid room data")
	}

	status := normalizeStatus(req.Status)
	if status == "" {
		status = "available"
	}

	id := req.ID
	if id == "" {
		id = fmt.Sprintf("room-%d", s.nowFn().UnixNano())
	}

	newRoom := roomdomain.Room{
		ID:        id,
		Name:      req.Name,
		Type:      req.Type,
		Capacity:  req.Capacity,
		BasePrice: req.BasePrice,
		Status:    status,
	}

	if err := s.rooms.SaveRoom(ctx, newRoom); err != nil {
		return nil, err
	}

	resp := mapRooms([]roomdomain.Room{newRoom})
	return &resp[0], nil
}

func (s *AdminService) UpdateStatus(ctx context.Context, id string, status string) (*RoomResponse, error) {
	if id == "" {
		return nil, ErrRoomNotFound
	}
	normalized := normalizeStatus(status)
	if normalized == "" {
		return nil, ErrInvalidRoomStatus
	}
	existing, err := s.rooms.FindRoomByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if existing == nil {
		return nil, ErrRoomNotFound
	}

	if err := s.rooms.UpdateRoomStatus(ctx, id, normalized); err != nil {
		return nil, err
	}
	existing.Status = normalized
	resp := mapRooms([]roomdomain.Room{*existing})
	return &resp[0], nil
}

func (s *AdminService) Delete(ctx context.Context, id string) error {
	if id == "" {
		return ErrRoomNotFound
	}

	now := s.nowFn()
	bookings, err := s.bookings.List(ctx)
	if err != nil {
		return err
	}
	for _, b := range bookings {
		if b.RoomID == id && b.CheckOut.After(now) {
			return ErrRoomHasFutureBookings
		}
	}

	return s.rooms.DeleteRoom(ctx, id)
}

func mapRooms(rooms []roomdomain.Room) []RoomResponse {
	var result []RoomResponse
	for _, r := range rooms {
		result = append(result, RoomResponse{
			ID:        r.ID,
			Name:      r.Name,
			Type:      r.Type,
			Capacity:  r.Capacity,
			BasePrice: r.BasePrice,
			Status:    normalizeStatus(r.Status),
		})
	}
	return result
}

func normalizeStatus(s string) string {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "", "available":
		return "available"
	case "out_of_order", "out-of-order", "outoforder":
		return "out_of_order"
	default:
		return ""
	}
}
