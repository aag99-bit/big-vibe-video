# Project Deployment Information: Big Vibe Video

## 📝 Description
**Big Vibe Video** is a modern Todo list application built with **Vue 3**, **Vite**, and **Tailwind CSS**. It provides a clean, responsive interface for managing tasks efficiently.

### Key Functionalities:
- Task creation and management.
- Modern, responsive UI using Tailwind CSS.
- Fast build and reload times powered by Vite.
- Automated SSL certificates via Let's Encrypt.

---

## 🚀 Architecture & Development

### Local Development
- **Structure:** The project is divided into `apps/backend` and `apps/frontend`.
- **Runtime:** Local development is done using **native JS execution** (Node.js, Vite).
- **Docker:** **DO NOT run Docker locally.**
- **Database:** Uses SQLite for local storage. The database file must be included in `.gitignore`.

### Production Deployment
- **Deployment:** A single Docker image is built containing both backend and frontend.
- **Routing:**
    - `/api/*` $\rightarrow$ Backend server.
    - `/` and all other paths $\rightarrow$ Frontend (served as static files).
- **Database:** SQLite is used. The database directory/file is connected as a **Docker volume** in `docker-compose.yml` to ensure data persistence.

### Server Infrastructure
- **Server IP:** `109.238.92.111`
- **Domain:** [https://bigvibetest.hopto.org](https://bigvibetest.hopto.org)
- **Port:** Listening on port 80/443 (handled by Nginx Proxy)

---

## 🛠 How to Update the Project

To deploy a new version of the project from your local machine to the server, follow these steps:

### 1. Push changes to the server
You can use the deployment script provided in the root of the project:
```bash
# Run the deploy script from the project root
./deploy.sh
```
*(Note: If the script is not yet created, you can manually upload the source files via SFTP/SCP to `/app/big-vibe-video`)*.

### 2. Rebuild and Restart the Container
Once the files are on the server, execute the following commands:

```bash
# Navigate to the project directory
cd /app/big-vibe-video

# Rebuild the image and restart the service in detached mode
docker-compose up -d --build
```

### 3. Verify the Update
Check the container status:
```bash
docker ps
```
Visit [https://bigvibetest.hopto.org](https://bigvibetest.hopto.org) to verify the changes are live.


---

## 🛠 How to Update the Project

To deploy a new version of the project from your local machine to the server, follow these steps:

### 1. Push changes to the server
You can use the deployment script provided in the root of the project:
```bash
# Run the deploy script from the project root
./deploy.sh
```
*(Note: If the script is not yet created, you can manually upload the source files via SFTP/SCP to `/app/big-vibe-video`)*.

### 2. Rebuild and Restart the Container
Once the files are on the server, execute the following commands:

```bash
# Navigate to the project directory
cd /app/big-vibe-video

# Rebuild the image and restart the service in detached mode
docker-compose up -d --build
```

### 3. Verify the Update
Check the container status:
```bash
docker ps
```
Visit [https://bigvibetest.hopto.org](https://bigvibetest.hopto.org) to verify the changes are live.
