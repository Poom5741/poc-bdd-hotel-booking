package http

import (
	"net/http"
	"strings"
	"time"

	bookingapp "github.com/yourorg/hotel-api/internal/booking/app"
)

type AdminHandler struct {
	svc *bookingapp.Service
}

func NewAdminHandler(svc *bookingapp.Service) *AdminHandler {
	return &AdminHandler{svc: svc}
}

type listFilters struct {
	From *time.Time
	To   *time.Time
}

func (h *AdminHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(r.URL.Path, "/")

	if strings.HasSuffix(path, "/check-in") {
		h.handleCheckIn(w, r)
		return
	}
	if strings.HasSuffix(path, "/check-out") {
		h.handleCheckOut(w, r)
		return
	}

	if r.Method == http.MethodGet {
		h.handleList(w, r)
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}

func (h *AdminHandler) handleList(w http.ResponseWriter, r *http.Request) {
	filters, err := parseFilters(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	bookings, err := h.svc.List(r.Context(), bookingapp.ListFilters{From: filters.From, To: filters.To})
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

func (h *AdminHandler) handleCheckIn(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	id := parseBookingID(r.URL.Path)
	if id == "" {
		http.Error(w, "invalid booking id", http.StatusBadRequest)
		return
	}

	actionTime := parseActionDate(r.URL.Query().Get("actionDate"))

	booking, err := h.svc.CheckIn(r.Context(), id, actionTime)
	if err != nil {
		status := http.StatusInternalServerError
		switch err {
		case bookingapp.ErrBookingNotFound:
			status = http.StatusNotFound
		case bookingapp.ErrTooEarlyCheckIn:
			status = http.StatusBadRequest
		}
		http.Error(w, err.Error(), status)
		return
	}

	writeJSON(w, bookingDTO{
		ID:       booking.ID,
		RoomID:   booking.RoomID,
		UserID:   booking.UserID,
		CheckIn:  booking.CheckIn.Format("2006-01-02"),
		CheckOut: booking.CheckOut.Format("2006-01-02"),
		Status:   booking.Status,
	})
}

func (h *AdminHandler) handleCheckOut(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	id := parseBookingID(r.URL.Path)
	if id == "" {
		http.Error(w, "invalid booking id", http.StatusBadRequest)
		return
	}

	actionTime := parseActionDate(r.URL.Query().Get("actionDate"))

	booking, err := h.svc.CheckOut(r.Context(), id, actionTime)
	if err != nil {
		status := http.StatusInternalServerError
		switch err {
		case bookingapp.ErrBookingNotFound:
			status = http.StatusNotFound
		case bookingapp.ErrTooEarlyCheckOut:
			status = http.StatusBadRequest
		}
		http.Error(w, err.Error(), status)
		return
	}

	writeJSON(w, bookingDTO{
		ID:       booking.ID,
		RoomID:   booking.RoomID,
		UserID:   booking.UserID,
		CheckIn:  booking.CheckIn.Format("2006-01-02"),
		CheckOut: booking.CheckOut.Format("2006-01-02"),
		Status:   booking.Status,
	})
}

func parseFilters(r *http.Request) (listFilters, error) {
	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	var filters listFilters
	if fromStr != "" {
		from, err := time.Parse("2006-01-02", fromStr)
		if err != nil {
			return filters, err
		}
		filters.From = &from
	}
	if toStr != "" {
		to, err := time.Parse("2006-01-02", toStr)
		if err != nil {
			return filters, err
		}
		filters.To = &to
	}
	return filters, nil
}

func parseBookingID(path string) string {
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) < 4 {
		return ""
	}
	return parts[len(parts)-2]
}

func parseActionDate(value string) time.Time {
	if value == "" {
		return time.Time{}
	}
	if t, err := time.Parse("2006-01-02", value); err == nil {
		return t
	}
	return time.Time{}
}
