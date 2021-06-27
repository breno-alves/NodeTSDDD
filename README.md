# NodeDDD API

NodeDDD's API

## Requirements

- Node v14
- NPM
- Docker
- Docker-compose

## Running application with Makefile

```
make setup

make start
```

## Version

    Node.js v14.15.1

## Install dependecies

    npm i

## Run Api in development

    npm run dev:server

## Run migrations

    npm run typeorm migrations:run

---

## Env

Example of envirioment values

```
APP_SECRET=cff2c4f1b6147fccbde5a1f670202cfd
TYPEORM_CONNECTION=postgres
TYPEORM_HOST=localhost
TYPEORM_USERNAME=postgres
TYPEORM_PASSWORD=postgres
TYPEORM_DATABASE=nodetsddd_db
TYPEORM_PORT=5432
TYPEORM_LOGGING=true
TYPEORM_ENTITIES=./src/modules/*/infra/typeorm/entities/*.ts
TYPEORM_MIGRATIONS=./src/shared/infra/typeorm/migrations/*.ts
TYPEORM_MIGRATIONS_DIR=./src/shared/infra/typeorm/migrations/
PORT=3333
```

## Docker

Docker-compose file contains two containers:

- Main database
- Tests database

### Runnning docker-compose

    docker-compose up -d
