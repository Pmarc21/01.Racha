docker-up:
	docker-compose up -d --build
docker-down:
	docker-compose down
run-db:
	docker run -d \
		--name my_postgres \
		-e POSTGRES_DB=$(DB_NAME) \
		-e POSTGRES_USER=$(DB_USER) \
		-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
		-p $(DB_PORT):5432 \
		postgres:15
