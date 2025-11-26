COMPOSE ?= docker compose
API_IMAGE ?= stayflex/hotel-api:local
E2E_IMAGE ?= stayflex/e2e:local
BASE_URL ?= http://host.docker.internal:3000

.PHONY: build-api run-api seed-api build-e2e e2e compose-up compose-e2e

build-api:
	@docker build -t $(API_IMAGE) -f backend/hotel-api/Dockerfile .

run-api: build-api
	@docker run --rm -p 8080:8080 $(API_IMAGE)

seed-api: build-api
	@docker run --rm $(API_IMAGE) seed

build-e2e:
	@docker build -t $(E2E_IMAGE) -f tests/e2e/Dockerfile .

e2e: build-e2e
	@docker run --rm -e BASE_URL=$(BASE_URL) --network host $(E2E_IMAGE)

compose-up:
	$(COMPOSE) up --build hotel-api

compose-e2e:
	BASE_URL=$(BASE_URL) $(COMPOSE) run --rm e2e
