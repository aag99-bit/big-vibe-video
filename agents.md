# Project Deployment Information: Big Vibe Video

## 📝 Description
**Big Vibe Video** is a modern Todo list application built with **Vue 3**, **Vite**, and **Tailwind CSS**. It provides a clean, responsive interface for managing tasks efficiently.

### Key Functionalities:
- Task creation and management.
- Modern, responsive UI using Tailwind CSS.
- Fast build and reload times powered by Vite.
- Automated SSL certificates via Let's Encrypt.

---

## 🚀 Deployment Details

### Server Infrastructure
- **Server IP:** `109.238.92.111`
- **Domain:** [https://bigvibetest.hopto.org](https://bigvibetest.hopto.org)
- **Port:** Listening on port 80/443 (handled by Nginx Proxy)

### Architecture
The project is deployed using a Dockerized architecture:
1. **Nginx Proxy & ACME Companion:** Located at `/opt/nginx-proxy` on the server. It handles incoming requests and automatically manages SSL certificates for the domain.
2. **Application Container:** The app is built into a lightweight Nginx image and runs as a Docker container, connected to the `proxy-net` network.

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
