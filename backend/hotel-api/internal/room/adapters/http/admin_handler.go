package http

import (
	"encoding/json"
	"net/http"
	"strings"

	roomapp "github.com/yourorg/hotel-api/internal/room/app"
)

type AdminHandler struct {
	svc *roomapp.AdminService
}

func NewAdminHandler(svc *roomapp.AdminService) *AdminHandler {
	return &AdminHandler{svc: svc}
}

type createRoomDTO struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	Capacity  int     `json:"capacity"`
	BasePrice float64 `json:"basePrice"`
	Status    string  `json:"status"`
}

type updateStatusDTO struct {
	Status string `json:"status"`
}

func (h *AdminHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

	// /api/admin/rooms
	if len(parts) == 3 {
		switch r.Method {
		case http.MethodGet:
			h.handleList(w, r)
			return
		case http.MethodPost:
			h.handleCreate(w, r)
			return
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
	}

	// /api/admin/rooms/{id}
	if len(parts) == 4 {
		id := parts[3]
		switch r.Method {
		case http.MethodPatch:
			h.handleUpdateStatus(w, r, id)
			return
		case http.MethodDelete:
			h.handleDelete(w, r, id)
			return
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
	}

	w.WriteHeader(http.StatusNotFound)
}

func (h *AdminHandler) handleList(w http.ResponseWriter, r *http.Request) {
	rooms, err := h.svc.List(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, map[string]any{"rooms": rooms})
}

func (h *AdminHandler) handleCreate(w http.ResponseWriter, r *http.Request) {
	var dto createRoomDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	room, err := h.svc.Create(r.Context(), roomapp.CreateRoomRequest{
		ID:        dto.ID,
		Name:      dto.Name,
		Type:      dto.Type,
		Capacity:  dto.Capacity,
		BasePrice: dto.BasePrice,
		Status:    dto.Status,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	writeJSON(w, room)
}

func (h *AdminHandler) handleUpdateStatus(w http.ResponseWriter, r *http.Request, id string) {
	var dto updateStatusDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	room, err := h.svc.UpdateStatus(r.Context(), id, dto.Status)
	if err != nil {
		status := http.StatusBadRequest
		if err == roomapp.ErrRoomNotFound {
			status = http.StatusNotFound
		}
		http.Error(w, err.Error(), status)
		return
	}

	writeJSON(w, room)
}

func (h *AdminHandler) handleDelete(w http.ResponseWriter, r *http.Request, id string) {
	err := h.svc.Delete(r.Context(), id)
	if err != nil {
		status := http.StatusInternalServerError
		if err == roomapp.ErrRoomHasFutureBookings {
			status = http.StatusBadRequest
		}
		if err == roomapp.ErrRoomNotFound {
			status = http.StatusNotFound
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
