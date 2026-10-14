# WMS System (Warehouse Management System)

A professional, full-stack Warehouse Management System designed with a monolithic Go/React architecture and a modern, industrial black-and-orange UI. Built for reliability, high performance, and ease of deployment on warehouse hardware.

---

## 🏗️ Architecture & Tech Stack

The application follows a **monolithic deployment pattern inside a single Docker container**:
* **Backend**: Go (`net/http`, `pgxpool`) — Acts as both the REST API server and the static file server for the frontend.
* **Frontend**: React + TypeScript (Vite, Tailwind CSS, Lucide React) — A modern Single Page Application (SPA).
* **Database**: PostgreSQL 18-alpine — Running in a dedicated container with persistent storage via Docker volumes.

---

## 📁 Project Structure

```text
wms-system/
├── cmd/
│   └── main.go              # Backend entrypoint, routing, and REST API handlers
├── internal/
│   └── database/
│       └── db.go            # Database connection pool configuration
├── web/                     # Frontend source code
│   ├── src/
│   │   ├── App.tsx          # Main dashboard UI component
│   │   └── index.css        # Tailwind CSS global styles
│   └── package.json         # Frontend dependencies and scripts
├── Dockerfile               # Multi-stage build (Node.js build -> Go build -> Alpine runtime)
├── docker-compose.yml       # Container orchestration (App + PostgreSQL)
├── init.sql                 # Initial database schema and tables
└── README.md                # Project documentation
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
* [Docker & Docker Compose](https://www.docker.com/) installed on your machine.
* *Note:* If you have a local PostgreSQL instance running on the default port `5432`, the project's external database port is mapped to **`5433`** to avoid conflicts.

### Running the Application

1. Clone the repository and navigate to the project root:
   ```bash
   cd wms-system
   ```

2. Build and start the containers in detached mode:
   ```bash
   docker compose up -d --build
   ```

3. Open your browser and navigate to:
   * **Web UI**: [http://localhost:8080](http://localhost:8080)

---

## 🔌 Database Connection (DBeaver / External Clients)

To inspect the database structure or view raw data:
* **Host**: `localhost`
* **Port**: `5433`
* **Database**: `wms_db`
* **User**: `postgres`
* **Password**: `secret`

---

## 🛠️ Development Workflow

1. Make frontend changes inside `web/src/`.
2. Make backend changes inside `cmd/`.
3. Rebuild and restart the container stack:
   ```bash
   docker compose down
   docker compose up -d --build
   ```