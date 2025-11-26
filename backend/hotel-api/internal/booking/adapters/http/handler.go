package http

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	bookingapp "github.com/yourorg/hotel-api/internal/booking/app"
)

type Handler struct {
	svc *bookingapp.Service
}

func NewHandler(svc *bookingapp.Service) *Handler {
	return &Handler{svc: svc}
}

type createRequestDTO struct {
	UserID   string `json:"userId"`
	RoomID   string `json:"roomId"`
	CheckIn  string `json:"checkIn"`
	CheckOut string `json:"checkOut"`
	Guests   int    `json:"guests"`
}

type bookingDTO struct {
	ID       string `json:"id"`
	RoomID   string `json:"roomId"`
	UserID   string `json:"userId,omitempty"`
	CheckIn  string `json:"checkIn"`
	CheckOut string `json:"checkOut"`
	Status   string `json:"status"`
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if strings.HasSuffix(r.URL.Path, "/cancel") {
		h.handleCancel(w, r)
		return
	}
	if r.Method == http.MethodPost {
		h.handleCreate(w, r)
		return
	}
	if r.Method == http.MethodGet {
		h.handleList(w, r)
		return
	}
	w.WriteHeader(http.StatusMethodNotAllowed)
}

func (h *Handler) handleCreate(w http.ResponseWriter, r *http.Request) {
	var req createRequestDTO
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	checkIn, err := time.Parse("2006-01-02", req.CheckIn)
	if err != nil {
		http.Error(w, "invalid checkIn", http.StatusBadRequest)
		return
	}
	checkOut, err := time.Parse("2006-01-02", req.CheckOut)
	if err != nil {
		http.Error(w, "invalid checkOut", http.StatusBadRequest)
		return
	}

	resp, err := h.svc.Create(r.Context(), bookingapp.CreateRequest{
		UserID:   req.UserID,
		RoomID:   req.RoomID,
		CheckIn:  checkIn,
		CheckOut: checkOut,
		Guests:   req.Guests,
	})
	if err != nil {
		status := http.StatusInternalServerError
		switch err {
		case bookingapp.ErrInvalidDateRange, bookingapp.ErrRoomUnavailable, bookingapp.ErrGuestsExceedRoom, bookingapp.ErrRoomNotFound:
			status = http.StatusBadRequest
		}
		http.Error(w, err.Error(), status)
		return
	}

	writeJSON(w, bookingDTO{
		ID:       resp.ID,
		RoomID:   resp.RoomID,
		CheckIn:  resp.CheckIn.Format("2006-01-02"),
		CheckOut: resp.CheckOut.Format("2006-01-02"),
		Status:   resp.Status,
	})
}

func (h *Handler) handleList(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId")
	if userID == "" {
		http.Error(w, "userId required", http.StatusBadRequest)
		return
	}

	bookings, err := h.svc.ListByUser(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var dtos []bookingDTO
	for _, b := range bookings {
		dtos = append(dtos, bookingDTO{
			ID:       b.ID,
			RoomID:   b.RoomID,
			UserID:   b.UserID,
			CheckIn:  b.CheckIn.Format("2006-01-02"),
			CheckOut: b.CheckOut.Format("2006-01-02"),
			Status:   b.Status,
		})
	}

	writeJSON(w, map[string]any{"bookings": dtos})
}

func (h *Handler) handleCancel(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 {
		http.Error(w, "invalid path", http.StatusBadRequest)
		return
	}
	id := parts[len(parts)-2]
	if id == "" {
		http.Error(w, "invalid booking id", http.StatusBadRequest)
		return
	}

	if err := h.svc.Cancel(r.Context(), id); err != nil {
		status := http.StatusInternalServerError
		switch err {
		case bookingapp.ErrBookingNotFound:
			status = http.StatusNotFound
		case bookingapp.ErrCannotCancelPast:
			status = http.StatusBadRequest
		}
		http.Error(w, err.Error(), status)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func writeJSON(w http.ResponseWriter, payload any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payload)
}
