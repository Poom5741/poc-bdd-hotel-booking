package main

import (
	"context"
	"log"
	"os"

	"github.com/yourorg/hotel-api/internal/seed"
)

func main() {
	ctx := context.Background()

	if len(os.Args) > 1 && os.Args[1] == "seed" {
		if err := seed.Run(ctx); err != nil {
			log.Fatalf("seed failed: %v", err)
		}
		log.Println("seed completed")
		return
	}

	// Placeholder for HTTP server bootstrap.
	log.Println("hotel-api starting (HTTP server not implemented yet)")
	<-ctx.Done()
}
