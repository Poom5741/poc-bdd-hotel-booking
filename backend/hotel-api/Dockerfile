FROM golang:1.22 AS builder

WORKDIR /app
COPY backend/hotel-api/go.mod backend/hotel-api/go.sum ./backend/hotel-api/
RUN cd backend/hotel-api && go mod download

COPY backend/hotel-api ./backend/hotel-api
WORKDIR /app/backend/hotel-api
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/hotel-api ./cmd/hotel-api

FROM gcr.io/distroless/base-debian12
COPY --from=builder /bin/hotel-api /bin/hotel-api
EXPOSE 8080
ENTRYPOINT ["/bin/hotel-api"]
