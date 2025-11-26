package http

import (
	"context"
	"encoding/json"
	nethttp "net/http"

	"github.com/yourorg/hotel-api/internal/auth/app"
)

type loginHandler struct {
	svc *app.Service
}

func NewLoginHandler(svc *app.Service) nethttp.Handler {
	return &loginHandler{svc: svc}
}

type loginRequestDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginResponseDTO struct {
	Token string `json:"token"`
	Role  string `json:"role"`
	Email string `json:"email"`
}

func (h *loginHandler) ServeHTTP(w nethttp.ResponseWriter, r *nethttp.Request) {
	if r.Method != nethttp.MethodPost {
		w.WriteHeader(nethttp.StatusMethodNotAllowed)
		return
	}

	var req loginRequestDTO
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		nethttp.Error(w, "invalid body", nethttp.StatusBadRequest)
		return
	}

	ctx := r.Context()
	resp, err := h.svc.Login(ctx, app.LoginRequest{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		status := nethttp.StatusInternalServerError
		if err == app.ErrInvalidCredentials {
			status = nethttp.StatusUnauthorized
		}
		nethttp.Error(w, err.Error(), status)
		return
	}

	writeJSON(ctx, w, loginResponseDTO{
		Token: resp.Token,
		Role:  resp.User.Role,
		Email: resp.User.Email,
	})
}

func writeJSON(ctx context.Context, w nethttp.ResponseWriter, payload any) {
	_ = ctx
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payload)
}
