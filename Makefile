# Start application
start:
	npm run dev:server

# Run integration tests
check:
	npm run test:integration

# Run migration
migration:
	npm run typeorm migrations:run

# Initial setup
setup:
	npm i
	docker-compose up -d