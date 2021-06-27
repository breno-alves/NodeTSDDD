# Start application
start:
	npm run dev:server

# Run integration tests
check:
	npm run test:integration

# Initial setup
setup:
	npm i
	docker-compose up -d