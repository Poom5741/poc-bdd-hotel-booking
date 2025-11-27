package main

import (
	"context"
	"log"
	"net/http"
	"os"

	authhttp "github.com/yourorg/hotel-api/internal/auth/adapters/http"
	authapp "github.com/yourorg/hotel-api/internal/auth/app"
	bookinghttp "github.com/yourorg/hotel-api/internal/booking/adapters/http"
	bookingapp "github.com/yourorg/hotel-api/internal/booking/app"
	roomhttp "github.com/yourorg/hotel-api/internal/room/adapters/http"
	roomapp "github.com/yourorg/hotel-api/internal/room/app"
	"github.com/yourorg/hotel-api/internal/seed"
)

func main() {
	ctx := context.Background()
	store := seed.NewInMemoryStore()
	seeder := seed.NewSeeder(store, store, store)

	if len(os.Args) > 1 && os.Args[1] == "seed" {
		if err := seeder.Seed(ctx); err != nil {
			log.Fatalf("seed failed: %v", err)
		}
		log.Println("seed completed")
		return
	}

	if err := seeder.Seed(ctx); err != nil {
		log.Fatalf("seed failed: %v", err)
	}

	authSvc := authapp.NewService(store, authapp.PlainPasswordChecker{}, authapp.NewStaticTokenIssuer("hotel-api"))
	roomSearchSvc := roomapp.NewSearchService(store, store)
	bookingSvc := bookingapp.NewService(store, store)
	adminRoomSvc := roomapp.NewAdminService(store, store)
	adminBookingHandler := bookinghttp.NewAdminHandler(bookingSvc)

	mux := http.NewServeMux()
	mux.Handle("/api/auth/login", authhttp.NewLoginHandler(authSvc))
	mux.Handle("/api/admin/auth/login", authhttp.NewLoginHandler(authSvc))
	mux.Handle("/api/guest/rooms/search", roomhttp.NewSearchHandler(roomSearchSvc))
	mux.Handle("/api/admin/rooms", roomhttp.NewAdminHandler(adminRoomSvc))
	mux.Handle("/api/admin/rooms/", roomhttp.NewAdminHandler(adminRoomSvc))
	mux.Handle("/api/guest/bookings", bookinghttp.NewHandler(bookingSvc))
	mux.Handle("/api/guest/bookings/", bookinghttp.NewHandler(bookingSvc))
	mux.Handle("/api/admin/bookings", adminBookingHandler)
	mux.Handle("/api/admin/bookings/", adminBookingHandler)

	addr := ":" + envOrDefault("PORT", "8080")
	server := &http.Server{
		Addr:    addr,
		Handler: withCORS(mux),
	}

	log.Printf("hotel-api listening on %s", addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Reflect origin to support credentials and avoid wildcard with cookies
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
