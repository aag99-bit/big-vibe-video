# Project Deployment Information: Big Vibe Video

## 📝 Description

**Big Vibe Video** is a modern Todo list application built with **Vue 3**, **Vite**, and **Tailwind CSS**. It provides a clean, responsive interface for managing tasks efficiently.

### Key Functionalities:

- Task creation and management with persistent storage.
- Modern, responsive UI using Tailwind CSS.
- Fast build and reload times powered by Vite.
- Automated SSL certificates via Let's Encrypt.

---

## 🚀 Architecture & Development

### Local Development

- **Structure:** The project is divided into `apps/backend` and `apps/frontend`.
- **Runtime:** Local development is done using **native JS execution** (Node.js for backend, Vite for frontend).
- **Docker:** ⛔ **DO NOT run Docker locally.**
- **Database:** Uses SQLite for local storage. The database directory (`apps/backend/data/`) must be included in `.gitignore`.

### Production Deployment

- **Deployment:** A single Docker image is built containing both the compiled frontend and the backend server.
- **Routing (Nginx):**
  - `/api/*` → Proxied to the Backend server (port 3001).
  - `/` and all other paths → Served as static Frontend files (port 3000).
- **Database:** SQLite is used. The database directory is connected as a **Docker volume** in `docker-compose.yml` to ensure data persistence across restarts.

### Server Infrastructure

- **Server IP:** `109.238.92.111`
- **Domain:** [https://bigvibetest.hopto.org](https://bigvibetest.hopto.org)
- **Port:** Listening on port 80/443 (handled by Nginx Proxy on the host).

---

## 🛠 How to Update the Project

To deploy a new version of the project from your local machine to the server, follow these steps:

### 1. Run the deployment script

Execute the script from the root of the project:

```bash
./deploy.sh
```
