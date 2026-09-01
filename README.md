# PNet Auto-Applier & Job Automation System

An enterprise-grade autonomous job discovery, screening question solver, and dual-document application dispatch engine tailored for South African tech talent (Python/Django, Data Engineering, and Cloud).

Built with a full-stack architecture combining a **React 19 & TypeScript frontend**, an **Express/Vite middle layer**, and a complete **Django 5.0 + Celery + Redis + PostgreSQL + Playwright** backend architecture.

---

## 🚀 Key Features

- **Autonomous PNet Job Discovery**: Real-time aggregation of active South African job postings with salary, location, tech stack, and ref number extraction.
- **Smart Dual-Document Application Payload**: Automatically packages and uploads both candidate **CV (`Russia_Bethuel_Moukangwe_CV.pdf`)** and **ExploreAI Data Engineering Certificate** to every application.
- **Automated Screening Question Solver**: AI-driven questionnaire solver tailored with South African work authorization (Citizen/EE), notice periods, and Code 08 driver's licensing defaults.
- **Multi-Channel Dispatch Engine**:
  - **Direct SMTP MIME Delivery**: Authenticated TLS dispatch via `smtp.gmail.com:587` with custom subject lines and automated multipart attachment handling.
  - **Headless Portal Automation**: Playwright browser automation simulating human application workflows and file uploads.
- **Django Super Admin & Architecture Center**: Complete production-ready Django project blueprints (`settings.py`, `models.py`, `tasks.py`, `admin.py`, `serializers.py`, and `docker-compose.yml`) for local or cloud deployment.
- **Real-Time Worker Fleet Dashboard**: Visual monitoring of Celery worker queues, task throughput, broker latencies, and execution logs.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion
- **Backend / API**: Node.js, Express, Vite
- **Full Python Stack Specs**: Django 5.0+, Celery, Redis, PostgreSQL, Playwright, Gunicorn, Nginx
- **Email Protocol**: SMTP / TLS (Gmail App Password integration)

---

## 📦 Quick Start (Development)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/BETHUELTHIPE/PNet-Auto-Applier.git
   cd PNet-Auto-Applier
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and set your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=bethuelmoukangwe8@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM_NAME=AMARIS Learning HUB
   SMTP_FROM_EMAIL=bethuelmoukangwe8@gmail.com
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🐳 Running the Production Django + Celery Stack

For a fully isolated Docker environment:

```bash
docker-compose up -d --build
```

This launches:
- **Django API & Admin**: `http://localhost:8000`
- **Celery Worker & Celery Beat**: Background task queue & scheduled cron jobs
- **Redis Broker**: Port `6379`
- **PostgreSQL Database**: Port `5432`
- **Prometheus & Grafana**: Port `9090` / `3001`

---

## 📄 License & Compliance

Designed in compliance with South African labor regulations and POPIA data protection principles.
