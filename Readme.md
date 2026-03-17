# StockWars

StockWars is a real-time multiplayer stock trading simulation. Players compete in time-limited "wars" where they execute buy and sell orders against each other through a live order matching engine. Trades are matched in real time, and a leaderboard tracks each player's wealth throughout the competition.

---

## Architecture Overview

The project is split into three services:

```
frontend/       React + TypeScript UI
stockwars/      Spring Boot REST API (auth, war management)
websocket/      Go WebSocket service (order matching engine)
```

**Communication flow:**

- The frontend communicates with the Spring Boot backend over HTTP for authentication and war management.
- Once inside a war, the frontend connects to the Go WebSocket service for real-time order submission and trade updates.
- The Spring Boot backend and Go service communicate through Redis Streams. When a war is created, a `WAR_START` event is published to the `global:war_events` stream. The Go service consumes this stream and spins up an in-memory order book for that war.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lightweight Charts |
| Backend | Java 17, Spring Boot 3.5, Spring Security, Spring Data JPA |
| WebSocket Engine | Go 1.25, Gorilla WebSocket |
| Database | MySQL 8.0 |
| Cache / Messaging | Redis (streams, sorted sets, hashes) |
| Monitoring | Prometheus, Grafana |
| API Docs | SpringDoc OpenAPI (Swagger UI) |

---

## Prerequisites

- Java 17+
- Maven
- Go 1.25+
- Node.js 18+
- Docker and Docker Compose (for infrastructure)

---

## Getting Started

### 1. Start Infrastructure

From the `stockwars/` directory, start MySQL, Redis, Prometheus, and Grafana:

```bash
cd stockwars
docker-compose up -d
```

This starts:
- MySQL on port `3306`
- Redis on port `6379`
- Prometheus on port `9090`
- Grafana on port `3000`

---

### 2. Backend (Spring Boot)

Copy the example env file and fill in your values:

```bash
cd stockwars
cp .env.example .env
```

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `SPRING_DATASOURCE_URL` | MySQL JDBC connection URL |
| `SPRING_DATASOURCE_USERNAME` | MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | MySQL password |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |
| `REDIS_PASSWORD` | Redis password |
| `AUTH_FRONTEND_URL` | Frontend origin URL for CORS |

Run the backend:

```bash
mvn spring-boot:run
```

The API runs on port `8080`. Actuator and Prometheus metrics are exposed on port `8081`.

Swagger UI is available at: `http://localhost:8080/swagger-ui`

---

### 3. WebSocket Service (Go)

```bash
cd websocket
cp .env.example .env
```

| Variable | Description |
|---|---|
| `JWT_SECRET` | Must match the backend JWT secret |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |
| `REDIS_PASS` | Redis password |
| `SERVER_PORT` | Port the WebSocket server listens on |

Run the service:

```bash
go run main.go gameManager.go jwt.go
```

---

### 4. Frontend

```bash
cd frontend
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:8080`) |
| `VITE_WS_URL` | WebSocket service URL (e.g. `ws://localhost:8082`) |

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and receive access + refresh tokens |
| POST | `/api/v1/auth/refresh` | Refresh the access token |
| POST | `/api/v1/auth/logout` | Logout and invalidate the refresh token |

Access tokens expire after 5 minutes. Refresh tokens are valid for 7 days and are stored in an HTTP-only cookie.

### Wars

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/wars/create_war` | Create a new war with a config payload |
| POST | `/api/v1/wars/join_war/{war_code}` | Join an existing war by code |
| DELETE | `/api/v1/wars/delete_war/{war_id}` | Delete a war (creator only) |

### WebSocket

Connect to the trading engine:

```
ws://<host>:<port>/ws?token=<JWT>&warCode=<warCode>
```

Once connected, clients can submit orders and receive real-time trade and leaderboard updates.

---

## Order Matching Engine

The Go service runs an in-memory order book per war using a B-tree structure for efficient price-time priority matching. Each war gets its own `Game` instance with:

- A buy order tree (max-heap by price)
- A sell order tree (min-heap by price)
- A buffered input channel for incoming orders
- A fan-out mechanism that broadcasts matched trades to all connected subscribers in that war

Orders are consumed from a Redis stream (`war:<warCode>:orders`) and fed into the engine. Matched trades are written back to Redis and broadcast over WebSocket to all participants.

---

## Monitoring

With the Docker Compose stack running:

- Prometheus scrapes metrics from the Spring Boot actuator endpoint at `http://host.docker.internal:8081/actuator/prometheus`
- Grafana is available at `http://localhost:3000` (default credentials: `admin` / `admin`)

---

## Building for Production

**Frontend:**

```bash
cd frontend
npm run build
```

Output is in `frontend/dist/`.

**Backend:**

```bash
cd stockwars
mvn clean package
java -jar target/stockwars-*.jar
```

**WebSocket service:**

```bash
cd websocket
go build -o stockwars-ws .
./stockwars-ws
```
