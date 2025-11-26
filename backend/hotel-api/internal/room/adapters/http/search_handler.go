package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	roomapp "github.com/yourorg/hotel-api/internal/room/app"
)

type searchHandler struct {
	svc *roomapp.SearchService
}

func NewSearchHandler(svc *roomapp.SearchService) http.Handler {
	return &searchHandler{svc: svc}
}

type searchResponseDTO struct {
	Rooms []roomDTO `json:"rooms"`
}

type roomDTO struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	Capacity  int     `json:"capacity"`
	BasePrice float64 `json:"basePrice"`
	Status    string  `json:"status"`
}

func (h *searchHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	checkInStr := r.URL.Query().Get("checkIn")
	checkOutStr := r.URL.Query().Get("checkOut")
	guestsStr := r.URL.Query().Get("guests")

	checkIn, err := time.Parse("2006-01-02", checkInStr)
	if err != nil {
		http.Error(w, "invalid checkIn", http.StatusBadRequest)
		return
	}
	checkOut, err := time.Parse("2006-01-02", checkOutStr)
	if err != nil {
		http.Error(w, "invalid checkOut", http.StatusBadRequest)
		return
	}
	guests := 0
	if guestsStr != "" {
		guests, err = strconv.Atoi(guestsStr)
		if err != nil {
			http.Error(w, "invalid guests", http.StatusBadRequest)
			return
		}
	}

	rooms, err := h.svc.Search(r.Context(), roomapp.SearchInput{
		CheckIn:  checkIn,
		CheckOut: checkOut,
		Guests:   guests,
	})
	if err != nil {
		status := http.StatusInternalServerError
		if err == roomapp.ErrInvalidDateRange {
			status = http.StatusBadRequest
		}
		http.Error(w, err.Error(), status)
		return
	}

	resp := searchResponseDTO{
		Rooms: make([]roomDTO, 0, len(rooms)),
	}
	for _, room := range rooms {
		resp.Rooms = append(resp.Rooms, roomDTO{
			ID:        room.ID,
			Name:      room.Name,
			Type:      room.Type,
			Capacity:  room.Capacity,
			BasePrice: room.BasePrice,
			Status:    room.Status,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}
