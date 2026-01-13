docker-up:
	COMPOSE_PROJECT_NAME=racha docker-compose -f docker-compose.yaml up -d --build
docker-down:
	COMPOSE_PROJECT_NAME=racha docker-compose -f docker-compose.yaml down
run-db:
	docker run -d \
		--name my_postgres \
		-e POSTGRES_DB=$(DB_NAME) \
		-e POSTGRES_USER=$(DB_USER) \
		-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
		-p $(DB_PORT):5432 \
		postgres:15
docker-reload:
	@echo "Starting all services..."
	COMPOSE_PROJECT_NAME=racha docker-compose -f docker-compose.yaml down api
	COMPOSE_PROJECT_NAME=racha docker-compose -f docker-compose.yaml up -d api
	@echo "Rest container reloaded successfully."

docker-logs:
	COMPOSE_PROJECT_NAME=racha docker-compose -f docker-compose.yaml logs -f api