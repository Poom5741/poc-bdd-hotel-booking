package main

import (
	"context"
	"log"
	"net/http"
	"os"

	authhttp "github.com/yourorg/hotel-api/internal/auth/adapters/http"
	authapp "github.com/yourorg/hotel-api/internal/auth/app"
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

	mux := http.NewServeMux()
	mux.Handle("/api/auth/login", authhttp.NewLoginHandler(authSvc))

	addr := ":" + envOrDefault("PORT", "8080")
	server := &http.Server{
		Addr:    addr,
		Handler: mux,
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
