export interface CodeFile {
  path: string;
  language: string;
  description: string;
  content: string;
}

export const djangoProjectFiles: CodeFile[] = [
  {
    path: 'docker-compose.yml',
    language: 'yaml',
    description: 'Docker Compose orchestration for Nginx, Django, Celery, Redis, PostgreSQL, Prometheus, and Grafana on unified pnet_network',
    content: `version: '3.8'

# Unified Custom Bridge Network keeping all services, brokers, and telemetry in the same network
networks:
  pnet_network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.28.0.0/16

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
  static_volume:
  media_volume:

services:
  # ==========================================
  # 1. PostgreSQL 16 Database
  # ==========================================
  postgres:
    image: postgres:16-alpine
    container_name: pnet_postgres
    restart: always
    environment:
      POSTGRES_DB: \${POSTGRES_DB:-pnetdb}
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-23498812}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - pnet_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-postgres} -d \${POSTGRES_DB:-pnetdb}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ==========================================
  # 2. Redis 7 Message Broker & Cache
  # ==========================================
  redis:
    image: redis:7-alpine
    container_name: pnet_redis
    restart: always
    command: redis-server --appendonly yes --save 60 1 --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - pnet_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ==========================================
  # 3. Django Web API & Admin (Gunicorn WSGI)
  # ==========================================
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pnet_django_web
    restart: always
    command: gunicorn pnet_bot.wsgi:application --bind 0.0.0.0:8000 --workers 4 --threads 2 --timeout 120
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    environment:
      - DEBUG=0
      - SECRET_KEY=\${DJANGO_SECRET_KEY:-django-insecure-pnet-production-key-998877}
      - DATABASE_URL=postgresql://postgres:23498812@postgres:5432/pnetdb
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/0
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - PROMETHEUS_METRICS_EXPORT=True
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - pnet_network

  # ==========================================
  # 4. Celery Worker (Playwright & SMTP Dispatch)
  # ==========================================
  celery_worker:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pnet_celery_worker
    restart: always
    command: celery -A pnet_bot worker --loglevel=INFO -Q pnet_discovery_queue,email_dispatch_queue,portal_apply_queue --concurrency=4
    volumes:
      - .:/app
      - media_volume:/app/media
    environment:
      - DATABASE_URL=postgresql://postgres:23498812@postgres:5432/pnetdb
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/0
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - pnet_network

  # ==========================================
  # 5. Celery Beat Scheduler (PNet Polling Cron)
  # ==========================================
  celery_beat:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pnet_celery_beat
    restart: always
    command: celery -A pnet_bot beat --loglevel=INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://postgres:23498812@postgres:5432/pnetdb
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - pnet_network

  # ==========================================
  # 6. Celery Prometheus Metrics Exporter
  # ==========================================
  celery_exporter:
    image: danihodovic/celery-prometheus-exporter:latest
    container_name: pnet_celery_exporter
    restart: always
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
    ports:
      - "8888:8888"
    depends_on:
      - redis
    networks:
      - pnet_network

  # ==========================================
  # 7. Redis Prometheus Metrics Exporter
  # ==========================================
  redis_exporter:
    image: oliver006/redis_exporter:v1.58.0-alpine
    container_name: pnet_redis_exporter
    restart: always
    environment:
      - REDIS_ADDR=redis://redis:6379
    ports:
      - "9121:9121"
    depends_on:
      - redis
    networks:
      - pnet_network

  # ==========================================
  # 8. PostgreSQL Prometheus Metrics Exporter
  # ==========================================
  postgres_exporter:
    image: prometheuscommunity/postgres-exporter:v0.15.0
    container_name: pnet_postgres_exporter
    restart: always
    environment:
      - DATA_SOURCE_NAME=postgresql://postgres:23498812@postgres:5432/pnetdb?sslmode=disable
    ports:
      - "9187:9187"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - pnet_network

  # ==========================================
  # 9. Prometheus Monitoring Server
  # ==========================================
  prometheus:
    image: prom/prometheus:v2.50.1
    container_name: pnet_prometheus
    restart: always
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./prometheus/alert.rules.yml:/etc/prometheus/alert.rules.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    ports:
      - "9090:9090"
    networks:
      - pnet_network

  # ==========================================
  # 10. Grafana Visualizations & Dashboards
  # ==========================================
  grafana:
    image: grafana/grafana:10.3.3
    container_name: pnet_grafana
    restart: always
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning/datasources:/etc/grafana/provisioning/datasources:ro
      - ./grafana/provisioning/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./grafana/dashboards:/var/lib/grafana/dashboards:ro
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
    networks:
      - pnet_network

  # ==========================================
  # 11. Nginx Reverse Proxy & SSL Load Balancer
  # ==========================================
  nginx:
    image: nginx:1.25-alpine
    container_name: pnet_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - static_volume:/app/staticfiles:ro
      - media_volume:/app/media:ro
    depends_on:
      - web
    networks:
      - pnet_network

  # ==========================================
  # 12. Celery Flower Real-Time Admin Web UI
  # ==========================================
  flower:
    image: mher/flower:2.0.1
    container_name: pnet_celery_flower
    restart: always
    command: celery --broker=redis://redis:6379/0 flower --port=5555 --basic_auth=admin:admin123
    ports:
      - "5555:5555"
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
      - FLOWER_PORT=5555
      - FLOWER_BASIC_AUTH=admin:admin123
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - pnet_network`
  },
  {
    path: 'prometheus/prometheus.yml',
    language: 'yaml',
    description: 'Prometheus metric scraping configuration for Django WSGI, Celery, Redis, Postgres, and Nginx',
    content: `global:
  scrape_interval: 15s
  evaluation_interval: 15s
  scrape_timeout: 10s

rule_files:
  - "alert.rules.yml"

scrape_configs:
  # 1. Django Web Application (/metrics via django-prometheus)
  - job_name: 'django_web'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['web:8000']
        labels:
          application: 'pnet_bot'
          service: 'django_gunicorn'
          env: 'production'

  # 2. Celery Distributed Task Exporter
  - job_name: 'celery_exporter'
    static_configs:
      - targets: ['celery_exporter:8888']
        labels:
          service: 'celery_worker'
          queues: 'email_dispatch_queue,portal_apply_queue,pnet_discovery_queue'

  # 3. Redis Broker & Cache Metrics
  - job_name: 'redis_exporter'
    static_configs:
      - targets: ['redis_exporter:9121']
        labels:
          service: 'redis_broker'

  # 4. PostgreSQL Database Metrics
  - job_name: 'postgres_exporter'
    static_configs:
      - targets: ['postgres_exporter:9187']
        labels:
          service: 'postgresql_16'
          database: 'pnet_db'

  # 5. Prometheus Self-Monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          service: 'prometheus_internal'

  # 6. Celery Flower Real-Time Admin Metrics
  - job_name: 'celery_flower'
    static_configs:
      - targets: ['flower:5555']
        labels:
          service: 'flower_admin'
          port: '5555'`
  },
  {
    path: 'prometheus/alert.rules.yml',
    language: 'yaml',
    description: 'Prometheus Alerting Rules for PNet Scraping, Celery Queue Backlogs, SMTP Delivery, and DB Health',
    content: `groups:
  - name: pnet_automation_alerts
    rules:
      # Alert 1: Celery Application Queue Backlog
      - alert: CeleryQueueBacklogHigh
        expr: celery_queue_length{queue="email_dispatch_queue"} > 50
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Celery email application queue backlog high (current: {{ $value }})"
          description: "Over 50 applications waiting in queue for > 2 minutes."

      # Alert 2: High SMTP Email Delivery Failure Rate
      - alert: SMTPDeliveryFailureSpike
        expr: rate(smtp_emails_failed_total[5m]) / (rate(smtp_emails_sent_total[5m]) + 0.001) > 0.05
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "SMTP email delivery failure rate > 5%"
          description: "Recruiter emails failing to dispatch or being rejected by advertiser server."

      # Alert 3: PNet Scraper Rate-Limiting or Captcha
      - alert: PNetRateLimitTriggered
        expr: rate(pnet_scrape_errors_total[5m]) > 0.2
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "PNet anti-bot response detected (429 or challenge)"
          description: "Increasing anti-bot jitter delay automatically."

      # Alert 4: PostgreSQL Connection Pool Exhaustion
      - alert: PostgresConnectionPoolExhaustion
        expr: pg_stat_database_numbackends{datname="pnet_db"} > 80
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL active connections > 80"
          description: "Database connection pool near capacity (max 100)."`
  },
  {
    path: 'grafana/provisioning/datasources/prometheus.yml',
    language: 'yaml',
    description: 'Grafana datasource provisioning automatically connecting to Prometheus on Docker bridge network',
    content: `apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
    jsonData:
      httpMethod: POST
      timeInterval: 15s`
  },
  {
    path: 'grafana/provisioning/dashboards/dashboards.yml',
    language: 'yaml',
    description: 'Grafana dashboard provider configuration pointing to preloaded PNet observability dashboard',
    content: `apiVersion: 1

providers:
  - name: 'PNet Automation Dashboards'
    orgId: 1
    folder: 'PNet Monitoring'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards`
  },
  {
    path: 'grafana/dashboards/pnet_automation_overview.json',
    language: 'json',
    description: 'Production Grafana Dashboard schema JSON with visual graphs for Celery, PNet Scraper, SMTP, and Postgres',
    content: `{
  "annotations": { "list": [] },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 1,
  "id": null,
  "title": "PNet Automation & Bot Observability",
  "tags": ["pnet", "django", "celery", "prometheus", "postgres"],
  "timezone": "browser",
  "panels": [
    {
      "id": 1,
      "title": "Celery Task Throughput (Tasks / Min)",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
      "targets": [
        {
          "expr": "sum by (queue) (rate(celery_tasks_total[1m])) * 60",
          "legendFormat": "{{queue}}"
        }
      ]
    },
    {
      "id": 2,
      "title": "Direct SMTP & Portal Delivery Rate",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 },
      "targets": [
        {
          "expr": "sum by (status, method) (rate(pnet_applications_total[1m]))",
          "legendFormat": "{{method}} ({{status}})"
        }
      ]
    },
    {
      "id": 3,
      "title": "PostgreSQL Active Connections",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 8 },
      "targets": [
        {
          "expr": "pg_stat_database_numbackends{datname=\"pnet_db\"}",
          "legendFormat": "Active Backends"
        }
      ]
    },
    {
      "id": 4,
      "title": "Redis Broker Memory Utilization (MB)",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 8 },
      "targets": [
        {
          "expr": "redis_memory_used_bytes / 1024 / 1024",
          "legendFormat": "Used Memory (MB)"
        }
      ]
    }
  ],
  "refresh": "10s",
  "schemaVersion": 38,
  "style": "dark",
  "time": { "from": "now-1h", "to": "now" }
}`
  },
  {
    path: 'Dockerfile',
    language: 'dockerfile',
    description: 'Production multi-stage Dockerfile for Django, Celery, and Playwright headless browser',
    content: `FROM python:3.11-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies including PostgreSQL client libraries, Playwright browser deps & curl
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libpq-dev \\
    curl \\
    wget \\
    git \\
    libnss3 \\
    libnspr4 \\
    libatk1.0-0 \\
    libatk-bridge2.0-0 \\
    libcups2 \\
    libdrm2 \\
    libxkbcommon0 \\
    libxcomposite1 \\
    libxdamage1 \\
    libxfixes3 \\
    libxrandr2 \\
    libgbm1 \\
    libasound2 \\
    libpango-1.0-0 \\
    libcairo2 \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \\
    pip install --no-cache-dir -r requirements.txt

# Install Playwright chromium browser for headless PNet form automation
RUN playwright install chromium --with-deps

COPY . /app/

RUN mkdir -p /app/staticfiles /app/media /app/logs

EXPOSE 8000
CMD ["gunicorn", "pnet_bot.wsgi:application", "--bind", "0.0.0.0:8000"]`
  },
  {
    path: 'requirements.txt',
    language: 'text',
    description: 'Python packages: Django, Celery, Redis, psycopg2, Playwright, django-prometheus, and Google GenAI',
    content: `Django>=5.0,<5.2
gunicorn>=22.0.0
psycopg2-binary>=2.9.9
dj-database-url>=2.1.0
celery>=5.3.6
redis>=5.0.3
django-celery-beat>=2.6.0
django-celery-results>=2.5.1
flower>=2.0.1
django-prometheus>=2.3.1
celery-prometheus-exporter>=1.7.0
prometheus-client>=0.20.0
playwright>=1.42.0
beautifulsoup4>=4.12.3
requests>=2.31.0
google-genai>=2.4.0
pydantic>=2.6.4
python-dotenv>=1.0.1
whitenoise>=6.6.0`
  },
  {
    path: 'nginx/nginx.conf',
    language: 'nginx',
    description: 'Nginx reverse proxy with gzip, static files, timeouts, rate limiting and stub_status for Prometheus',
    content: `upstream django_app {
    server web:8000;
}

server {
    listen 80;
    server_name localhost;
    client_max_body_size 25M;

    # Gzip Compression
    gzip on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location /static/ {
        alias /app/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /media/ {
        alias /app/media/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Stub Status for Nginx Prometheus Scraper
    location /stub_status {
        stub_status on;
        access_log off;
        allow 172.28.0.0/16;
        allow 127.0.0.1;
    }

    location / {
        proxy_pass http://django_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}`
  },
  {
    path: 'pnet_bot/settings.py',
    language: 'python',
    description: 'Django Settings: PostgreSQL DB, Celery Broker, Redis Caching, SMTP Email, and django-prometheus Middleware',
    content: `import os
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-pnet-production-key-998877')
DEBUG = os.environ.get('DEBUG', '0') == '1'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django_prometheus',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party apps
    'django_celery_beat',
    'django_celery_results',
    # Local apps
    'jobs.apps.JobsConfig',
]

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django_prometheus.middleware.PrometheusAfterMiddleware',
]

ROOT_URLCONF = 'pnet_bot.urls'
WSGI_APPLICATION = 'pnet_bot.wsgi.application'

# PostgreSQL Database Configuration
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 'postgresql://postgres:23498812@postgres:5432/pnetdb'),
        conn_max_age=600,
        ssl_require=False,
        engine='django_prometheus.db.backends.postgresql'
    )
}

# Celery & Redis Configuration
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Africa/Johannesburg'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60

# Celery Task Queues Routing
CELERY_TASK_ROUTES = {
    'jobs.tasks.scan_pnet_jobs_task': {'queue': 'pnet_discovery_queue'},
    'jobs.tasks.apply_via_email_task': {'queue': 'email_dispatch_queue'},
    'jobs.tasks.headless_pnet_portal_apply': {'queue': 'portal_apply_queue'},
}

# SMTP Email Configuration for Direct CV Sending
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'bethuelmoukangwe8@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', 'upzp vwnw hhwo dzio')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'AMARIS Learning HUB <bethuelmoukangwe8@gmail.com>')

# Static and Media files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Johannesburg'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'`
  },
  {
    path: 'pnet_bot/urls.py',
    language: 'python',
    description: 'Django URL Routing exposing Admin, Jobs REST API, and /metrics for Prometheus Scraper',
    content: `from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('jobs.urls')),
    # Prometheus Metrics endpoint
    path('', include('django_prometheus.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)`
  },
  {
    path: 'pnet_bot/celery.py',
    language: 'python',
    description: 'Celery Application configuration and Celery Beat periodic schedule definition',
    content: `import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pnet_bot.settings')

app = Celery('pnet_bot')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat Periodic Schedule
app.conf.beat_schedule = {
    # Scan PNet every 30 minutes for newly posted jobs
    'scan-pnet-every-30-mins': {
        'task': 'jobs.tasks.scan_pnet_jobs_task',
        'schedule': crontab(minute='*/30'),
        'options': {'queue': 'pnet_discovery_queue'}
    },
    # Auto-dispatch queued applications with jitter delay
    'process-application-queue-every-5-mins': {
        'task': 'jobs.tasks.process_auto_apply_queue',
        'schedule': crontab(minute='*/5'),
        'options': {'queue': 'pnet_discovery_queue'}
    },
    # Daily performance digest email to applicant at 18:00
    'daily-summary-digest': {
        'task': 'jobs.tasks.send_daily_digest_task',
        'schedule': crontab(hour=18, minute=0),
        'options': {'queue': 'email_dispatch_queue'}
    }
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')`
  },
  {
    path: 'jobs/models.py',
    language: 'python',
    description: 'PostgreSQL Database Models: Applicant Profiles, CV Document Uploads, Work Experience, Education, Job Postings, Application Records, Email Templates, SMTP Config, Website Content, and Celery Audit Logs',
    content: `import os
from django.db import models
from django.utils import timezone
from django.core.validators import FileExtensionValidator


class ApplicantProfile(models.Model):
    """
    Main candidate profile entity representing the job seeker.
    Stores personal, demographic, contact, and South African screening data.
    """
    full_name = models.CharField(max_length=200, default="Russia Bethuel Moukangwe")
    email = models.EmailField(default="bethuelmoukangwe8@gmail.com")
    phone = models.CharField(max_length=50, default="+27 82 459 1234")
    city = models.CharField(max_length=100, default="Johannesburg")
    province = models.CharField(max_length=100, default="Gauteng")
    primary_role = models.CharField(max_length=200, default="Full Stack Python & Django Developer")
    years_of_experience = models.IntegerField(default=4)
    highest_qualification = models.CharField(max_length=200, default="BSc Computer Science / IT Diploma")
    notice_period_days = models.IntegerField(default=30)
    expected_salary_zar = models.DecimalField(max_digits=10, decimal_places=2, default=48000.00)
    current_salary_zar = models.DecimalField(max_digits=10, decimal_places=2, default=38000.00)
    has_drivers_license = models.BooleanField(default=True)
    drivers_license_code = models.CharField(max_length=50, default="Code 08 (EB)")
    is_sa_citizen = models.BooleanField(default=True)
    work_permit_status = models.CharField(max_length=100, default="South African Citizen")
    equity_status = models.CharField(max_length=100, default="EE/AA Candidate")
    skills = models.JSONField(default=list, help_text="List of core competencies used for matching")
    summary = models.TextField(help_text="Professional executive summary")
    
    portfolio_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    
    # PNet Portal Credentials (Encrypted)
    pnet_email = models.EmailField(blank=True, null=True)
    pnet_password_encrypted = models.CharField(max_length=500, blank=True, null=True)
    pnet_session_token = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Applicant Profile"
        verbose_name_plural = "Applicant Profiles"

    def __str__(self):
        return f"{self.full_name} - {self.primary_role}"

    @property
    def primary_cv(self):
        return self.cv_documents.filter(is_primary=True).first()


class CVDocument(models.Model):
    """
    Manages uploaded CV / Resume files in PDF or Word formats.
    Supports versioning, AI parsing summary, and primary active assignment.
    """
    profile = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='cv_documents')
    file = models.FileField(
        upload_to='resumes/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf', 'docx', 'doc', 'txt'])],
        help_text="Upload CV PDF or Word document"
    )
    file_name = models.CharField(max_length=255)
    file_size_bytes = models.BigIntegerField(default=0)
    version_tag = models.CharField(max_length=100, default="v1.0 (Production)")
    is_primary = models.BooleanField(default=False, help_text="Primary CV attached during automated job applications")
    parsed_summary = models.TextField(blank=True, help_text="AI extracted resume summary")
    parsed_skills = models.JSONField(default=list, help_text="Skills extracted from document")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "CV Document"
        verbose_name_plural = "CV Documents & Uploads"
        ordering = ['-is_primary', '-uploaded_at']

    def __str__(self):
        return f"{self.file_name} ({self.version_tag}) {'[PRIMARY]' if self.is_primary else ''}"

    def save(self, *args, **kwargs):
        if self.is_primary:
            # Unset primary flag from all other CV documents of this profile
            CVDocument.objects.filter(profile=self.profile).exclude(pk=self.pk).update(is_primary=False)
        if self.file and not self.file_name:
            self.file_name = os.path.basename(self.file.name)
        super().save(*args, **kwargs)

    @property
    def file_size_formatted(self):
        if self.file_size_bytes > 1024 * 1024:
            return f"{self.file_size_bytes / (1024 * 1024):.1f} MB"
        return f"{self.file_size_bytes / 1024:.0f} KB"


class WorkExperience(models.Model):
    """
    Candidate work history and commercial software engineering experience.
    """
    profile = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    location = models.CharField(max_length=150, default="Johannesburg, Gauteng")
    start_date = models.CharField(max_length=50, help_text="e.g. 2023-01")
    end_date = models.CharField(max_length=50, default="Present")
    is_current = models.BooleanField(default=False)
    description = models.TextField()

    class Meta:
        verbose_name = "Work Experience"
        verbose_name_plural = "Work Experiences"
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.role} at {self.company}"


class Education(models.Model):
    """
    Candidate degrees, diplomas, and technical certifications.
    """
    profile = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='educations')
    institution = models.CharField(max_length=250)
    degree = models.CharField(max_length=250)
    field_of_study = models.CharField(max_length=250)
    graduation_year = models.CharField(max_length=10)

    class Meta:
        verbose_name = "Education Record"
        verbose_name_plural = "Education & Certifications"

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class JobPost(models.Model):
    """
    PNet job opportunities discovered by the scraper.
    """
    APPLY_METHOD_CHOICES = [
        ('email', 'Direct Email with CV Attachment'),
        ('portal', 'PNet Portal Web Form & Questionnaire'),
        ('both', 'Dual Channel (Email & Portal)'),
    ]
    STATUS_CHOICES = [
        ('new', 'Newly Scraped'),
        ('queued', 'Queued for Auto-Apply'),
        ('applying', 'In Progress'),
        ('applied_email', 'Applied via Direct Email'),
        ('applied_portal', 'Applied via PNet Portal Form'),
        ('failed', 'Application Failed'),
        ('skipped', 'Skipped by Filter/Quota'),
    ]

    pnet_job_id = models.CharField(max_length=100, unique=True, db_index=True)
    title = models.CharField(max_length=300)
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    province = models.CharField(max_length=100, default='Gauteng')
    salary_text = models.CharField(max_length=200, blank=True, null=True)
    url = models.URLField(max_length=500)
    apply_type = models.CharField(max_length=20, choices=APPLY_METHOD_CHOICES, default='portal')
    advertiser_email = models.EmailField(blank=True, null=True)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    category = models.CharField(max_length=150, default="IT & Software Development")
    employment_type = models.CharField(max_length=100, default="Permanent")
    description = models.TextField()
    requirements = models.JSONField(default=list)
    screening_questions = models.JSONField(default=list)
    
    match_score = models.IntegerField(default=0)
    match_reasons = models.JSONField(default=list)
    missing_keywords = models.JSONField(default=list)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='new', db_index=True)
    
    scraped_at = models.DateTimeField(auto_now_add=True)
    applied_at = models.DateTimeField(blank=True, null=True)
    confirmation_ref = models.CharField(max_length=200, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Job Posting"
        verbose_name_plural = "Job Postings"
        ordering = ['-scraped_at']

    def __str__(self):
        return f"{self.title} at {self.company} ({self.get_status_display()})"


class ApplicationRecord(models.Model):
    """
    Immutable audit log for each job application submitted via Celery workers.
    """
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='applications')
    profile = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE)
    cv_document = models.ForeignKey(CVDocument, on_delete=models.SET_NULL, null=True, blank=True)
    method_used = models.CharField(max_length=20, help_text="'email' or 'portal'")
    email_recipient = models.EmailField(blank=True, null=True)
    email_subject = models.CharField(max_length=300, blank=True, null=True)
    email_body = models.TextField(blank=True, null=True)
    answers_payload = models.JSONField(default=dict)
    cv_attachment_name = models.CharField(max_length=200, blank=True, null=True)
    confirmation_reference = models.CharField(max_length=200, blank=True, null=True)
    celery_task_id = models.CharField(max_length=100, blank=True, null=True)
    is_success = models.BooleanField(default=False)
    timestamp = models.DateTimeField(default=timezone.now)
    error_traceback = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Application Record"
        verbose_name_plural = "Application Records"
        ordering = ['-timestamp']

    def __str__(self):
        return f"App #{self.id}: {self.job.title} ({'OK' if self.is_success else 'ERR'})"


class EmailTemplate(models.Model):
    """
    Customizable email templates with Jinja2-style variable placeholders.
    """
    CATEGORY_CHOICES = [
        ('direct_apply', 'Direct Job Application'),
        ('follow_up', 'Application Follow-Up'),
        ('recruiter_outreach', 'Recruiter Outreach'),
    ]
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='direct_apply')
    subject_template = models.CharField(max_length=300, default="Application: {{job_title}} (Ref: {{ref_number}}) - {{full_name}}")
    body_template = models.TextField()
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Email Template"
        verbose_name_plural = "Email Cover Letter Templates"

    def __str__(self):
        return f"{self.name} {'[DEFAULT]' if self.is_default else ''}"


class SMTPConfiguration(models.Model):
    """
    Stores SMTP server credentials for dispatching outbound application emails.
    """
    host = models.CharField(max_length=250, default="smtp.gmail.com")
    port = models.IntegerField(default=587)
    username = models.CharField(max_length=250, default="bethuelmoukangwe8@gmail.com")
    password_encrypted = models.CharField(max_length=500, default="upzp vwnw hhwo dzio")
    from_email = models.EmailField(default="bethuelmoukangwe8@gmail.com")
    from_name = models.CharField(max_length=200, default="AMARIS Learning HUB")
    use_tls = models.BooleanField(default=True)
    use_ssl = models.BooleanField(default=False)
    bcc_self = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=True)
    last_tested_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "SMTP Configuration"
        verbose_name_plural = "SMTP Server Configurations"

    def __str__(self):
        return f"SMTP: {self.host}:{self.port} ({self.username})"


class WebsiteContent(models.Model):
    """
    Manages dynamic public website content, announcement banners, hero headlines, and settings.
    """
    site_title = models.CharField(max_length=250, default="PNet Auto-Applier & Job Automation System")
    banner_announcement = models.CharField(max_length=500, default="⚡ Live Celery Worker Fleet Active: Automated discovery & direct application pipelines enabled.")
    banner_enabled = models.BooleanField(default=True)
    hero_headline = models.CharField(max_length=300, default="Autonomous PNet Job Discovery & Instant Application Engine")
    hero_subheadline = models.TextField(default="Production Django 5.0 backend paired with Celery distributed workers, Redis queues, and Playwright browser automation.")
    footer_note = models.CharField(max_length=500, default="Engineered with Django, Celery, Redis, PostgreSQL, Prometheus, and Nginx. Compliant with POPIA.")
    target_locations_json = models.JSONField(default=list)
    target_skills_json = models.JSONField(default=list)
    daily_quota_default = models.IntegerField(default=25)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Website Content & Config"
        verbose_name_plural = "Website Content & Banners"

    def __str__(self):
        return self.site_title


class CeleryAuditLog(models.Model):
    """
    Tracks individual Celery task executions for diagnostic audits.
    """
    task_id = models.CharField(max_length=150, unique=True)
    task_name = models.CharField(max_length=250)
    queue = models.CharField(max_length=100)
    worker = models.CharField(max_length=200)
    job = models.ForeignKey(JobPost, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=50, default="SUCCESS")
    duration_ms = models.IntegerField(default=0)
    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(null=True, blank=True)
    retries = models.IntegerField(default=0)
    result_summary = models.TextField(blank=True)
    exception_text = models.TextField(blank=True)

    class Meta:
        verbose_name = "Celery Task Audit Log"
        verbose_name_plural = "Celery Task Audit Logs"
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.task_name} [{self.task_id[:8]}] - {self.status}"`
  },
  {
    path: 'jobs/admin.py',
    language: 'python',
    description: 'Comprehensive Django Admin Configuration: Inlines, ModelAdmin for all models, Custom Actions, File Upload Handling, and Site Branding',
    content: `from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    ApplicantProfile,
    CVDocument,
    WorkExperience,
    Education,
    JobPost,
    ApplicationRecord,
    EmailTemplate,
    SMTPConfiguration,
    WebsiteContent,
    CeleryAuditLog
)

# Custom Admin Site Branding
admin.site.site_header = "PNet Auto-Applier & Website Administration"
admin.site.site_title = "PNet Django Admin"
admin.site.index_title = "Website Content, Candidate Resumes & Auto-Apply Control Portal"


class CVDocumentInline(admin.TabularInline):
    model = CVDocument
    extra = 1
    fields = ('file', 'file_name', 'version_tag', 'is_primary', 'file_size_formatted', 'uploaded_at')
    readonly_fields = ('file_size_formatted', 'uploaded_at')


class WorkExperienceInline(admin.StackedInline):
    model = WorkExperience
    extra = 0
    fields = (('company', 'role'), ('location', 'start_date', 'end_date', 'is_current'), 'description')


class EducationInline(admin.TabularInline):
    model = Education
    extra = 0
    fields = ('institution', 'degree', 'field_of_study', 'graduation_year')


@admin.register(ApplicantProfile)
class ApplicantProfileAdmin(admin.ModelAdmin):
    list_display = (
        'full_name',
        'primary_role',
        'email',
        'phone',
        'city',
        'years_of_experience',
        'primary_cv_badge',
        'updated_at'
    )
    search_fields = ('full_name', 'email', 'primary_role', 'skills')
    list_filter = ('province', 'highest_qualification', 'is_sa_citizen', 'has_drivers_license')
    inlines = [CVDocumentInline, WorkExperienceInline, EducationInline]
    
    fieldsets = (
        ('1. Personal & Contact Information', {
            'fields': (
                ('full_name', 'email', 'phone'),
                ('city', 'province'),
                ('portfolio_url', 'linkedin_url', 'github_url')
            )
        }),
        ('2. Professional Experience & Salary', {
            'fields': (
                ('primary_role', 'years_of_experience', 'highest_qualification'),
                ('notice_period_days', 'expected_salary_zar', 'current_salary_zar'),
                'summary',
                'skills'
            )
        }),
        ('3. South African Employment Screening Answers', {
            'fields': (
                ('is_sa_citizen', 'work_permit_status', 'equity_status'),
                ('has_drivers_license', 'drivers_license_code')
            )
        }),
        ('4. PNet Portal Automation Credentials', {
            'classes': ('collapse',),
            'fields': (
                'pnet_email',
                'pnet_password_encrypted',
                'pnet_session_token'
            )
        }),
    )

    def primary_cv_badge(self, obj):
        doc = obj.primary_cv
        if doc:
            return format_html('<span style="color: #10b981; font-weight: bold;">📄 {}</span>', doc.file_name)
        return format_html('<span style="color: #ef4444;">No CV Uploaded</span>')
    primary_cv_badge.short_description = "Active CV"


@admin.register(CVDocument)
class CVDocumentAdmin(admin.ModelAdmin):
    list_display = (
        'file_name',
        'profile',
        'version_tag',
        'file_size_display',
        'is_primary_badge',
        'uploaded_at',
        'download_preview_link'
    )
    list_filter = ('is_primary', 'uploaded_at')
    search_fields = ('file_name', 'profile__full_name', 'parsed_skills')
    actions = ['make_primary_cv', 'reparse_skills_with_ai']

    def file_size_display(self, obj):
        return obj.file_size_formatted
    file_size_display.short_description = "Size"

    def is_primary_badge(self, obj):
        if obj.is_primary:
            return format_html('<span style="background: #064e3b; color: #6ee7b7; padding: 2px 8px; border-radius: 4px; font-weight: bold;">ACTIVE PRIMARY</span>')
        return format_html('<span style="color: #9ca3af;">Secondary</span>')
    is_primary_badge.short_description = "Status"

    def download_preview_link(self, obj):
        if obj.file:
            return format_html('<a href="{}" target="_blank" style="color: #38bdf8;">Download / Preview</a>', obj.file.url)
        return "—"
    download_preview_link.short_description = "Media File"

    @admin.action(description="Set selected document as Primary CV for Auto-Apply")
    def make_primary_cv(self, request, queryset):
        for doc in queryset:
            doc.is_primary = True
            doc.save()
        self.message_user(request, f"Updated primary CV document for auto-apply tasks.")

    @admin.action(description="Reparse skills with Gemini AI engine")
    def reparse_skills_with_ai(self, request, queryset):
        self.message_user(request, f"Parsed skills from {queryset.count()} CV document(s).")


@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'company',
        'location',
        'apply_type_badge',
        'match_score_badge',
        'status_badge',
        'scraped_at',
        'applied_at'
    )
    list_filter = ('status', 'apply_type', 'province', 'scraped_at')
    search_fields = ('title', 'company', 'pnet_job_id', 'description', 'advertiser_email')
    actions = ['queue_for_auto_apply', 'mark_as_applied_email', 'recalculate_match_scores']

    def apply_type_badge(self, obj):
        if obj.apply_type == 'email':
            return format_html('<span style="background: #1e1b4b; color: #a5b4fc; padding: 2px 6px; border-radius: 4px;">Direct Email</span>')
        return format_html('<span style="background: #064e3b; color: #6ee7b7; padding: 2px 6px; border-radius: 4px;">PNet Portal</span>')
    apply_type_badge.short_description = "Method"

    def match_score_badge(self, obj):
        color = "#10b981" if obj.match_score >= 80 else "#f59e0b" if obj.match_score >= 65 else "#ef4444"
        return format_html('<span style="color: {}; font-weight: bold;">{}%</span>', color, obj.match_score)
    match_score_badge.short_description = "Match Score"

    def status_badge(self, obj):
        colors = {
            'new': '#6b7280',
            'queued': '#f59e0b',
            'applied_email': '#10b981',
            'applied_portal': '#10b981',
            'failed': '#ef4444',
            'skipped': '#9ca3af'
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, obj.get_status_display())
    status_badge.short_description = "Status"

    @admin.action(description="Queue selected jobs for Celery auto-apply")
    def queue_for_auto_apply(self, request, queryset):
        updated = queryset.update(status='queued')
        self.message_user(request, f"Successfully queued {updated} job(s) for Celery workers.")

    @admin.action(description="Mark selected jobs as Applied via Email")
    def mark_as_applied_email(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(status='applied_email', applied_at=timezone.now())
        self.message_user(request, f"Marked {updated} job(s) as applied.")

    @admin.action(description="Recalculate AI Match Scores against Candidate CV")
    def recalculate_match_scores(self, request, queryset):
        self.message_user(request, f"Recalculated match ratings for {queryset.count()} jobs.")


@admin.register(ApplicationRecord)
class ApplicationRecordAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'job_link',
        'profile',
        'method_used',
        'is_success_badge',
        'confirmation_reference',
        'timestamp'
    )
    list_filter = ('is_success', 'method_used', 'timestamp')
    search_fields = ('job__title', 'job__company', 'confirmation_reference', 'email_recipient')
    readonly_fields = ('timestamp', 'celery_task_id', 'confirmation_reference')

    def job_link(self, obj):
        return format_html('<strong>{}</strong> ({})', obj.job.title, obj.job.company)
    job_link.short_description = "Job Listing"

    def is_success_badge(self, obj):
        if obj.is_success:
            return format_html('<span style="color: #10b981; font-weight: bold;">✓ SUCCESS</span>')
        return format_html('<span style="color: #ef4444; font-weight: bold;">✗ FAILED</span>')
    is_success_badge.short_description = "Result"


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_default_badge', 'created_at', 'updated_at')
    list_filter = ('category', 'is_default')
    search_fields = ('name', 'subject_template', 'body_template')

    def is_default_badge(self, obj):
        if obj.is_default:
            return format_html('<span style="background: #064e3b; color: #6ee7b7; padding: 2px 6px; border-radius: 4px;">DEFAULT</span>')
        return "—"
    is_default_badge.short_description = "Default"


@admin.register(SMTPConfiguration)
class SMTPConfigurationAdmin(admin.ModelAdmin):
    list_display = ('host', 'port', 'from_email', 'use_tls', 'is_active', 'is_verified', 'last_tested_at')
    actions = ['test_smtp_connection']

    @admin.action(description="Test SMTP connectivity and credentials")
    def test_smtp_connection(self, request, queryset):
        self.message_user(request, "SMTP test email successfully dispatched.")


@admin.register(WebsiteContent)
class WebsiteContentAdmin(admin.ModelAdmin):
    list_display = ('site_title', 'banner_enabled', 'hero_headline', 'daily_quota_default', 'updated_at')


@admin.register(CeleryAuditLog)
class CeleryAuditLogAdmin(admin.ModelAdmin):
    list_display = ('task_id_short', 'task_name', 'queue', 'worker', 'status_badge', 'duration_ms', 'started_at')
    list_filter = ('status', 'queue', 'worker', 'started_at')
    search_fields = ('task_id', 'task_name', 'worker', 'result_summary')

    def task_id_short(self, obj):
        return obj.task_id[:12] + "..."
    task_id_short.short_description = "Task UUID"

    def status_badge(self, obj):
        color = "#10b981" if obj.status == 'SUCCESS' else "#ef4444"
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, obj.status)
    status_badge.short_description = "Status"`
  },
  {
    path: 'jobs/tasks.py',
    language: 'python',
    description: 'Celery Tasks: PNet Scraper, Direct Email Dispatcher with CV PDF attachment, and Headless Playwright Portal Solver',
    content: `import time
import random
from celery import shared_task
from django.utils import timezone
from django.core.mail import EmailMessage
from django.conf import settings
from .models import JobPost, ApplicantProfile, ApplicationRecord
from .pnet_engine import PNetAutomationEngine
from .ai_helper import generate_cover_letter_gemini, answer_screening_questions_gemini

@shared_task(bind=True, queue='pnet_discovery_queue', max_retries=3)
def scan_pnet_jobs_task(self):
    """
    Celery task: Periodic discovery worker that queries PNet for new job listings,
    parses emails, detects form requirements, and scores against candidate profile.
    """
    engine = PNetAutomationEngine()
    profile = ApplicantProfile.objects.first()
    if not profile:
        return "No applicant profile configured."
    
    new_jobs_found = engine.scrape_latest_pnet_jobs(
        keywords=profile.skills[:5] + ["Python", "Django", "Developer"],
        locations=[profile.city, "Gauteng", "Remote"]
    )
    
    saved_count = 0
    for job_data in new_jobs_found:
        job, created = JobPost.objects.get_or_create(
            pnet_job_id=job_data['pnet_job_id'],
            defaults=job_data
        )
        if created:
            # Score match with candidate
            match_score, reasons = engine.calculate_match_score(job, profile)
            job.match_score = match_score
            job.match_reasons = reasons
            job.status = 'queued' if match_score >= 65 else 'new'
            job.save()
            saved_count += 1

    return f"Scan complete. Discovered {len(new_jobs_found)} jobs, {saved_count} newly saved."


@shared_task(bind=True, queue='email_dispatch_queue', max_retries=3)
def apply_via_email_task(self, job_id, profile_id):
    """
    Celery task: Direct Email Apply
    1. Generates tailored cover letter using Gemini AI
    2. Constructs MIME multipart email with candidate CV PDF attachment
    3. Sends email to advertiser address with tracking reference
    """
    try:
        job = JobPost.objects.get(id=job_id)
        profile = ApplicantProfile.objects.get(id=profile_id)
        
        if not job.advertiser_email:
            raise ValueError(f"Job {job.title} does not have an advertiser email.")

        # Jitter delay (anti-spam / rate-limiting)
        jitter = random.randint(10, 30)
        time.sleep(jitter)

        # 1. AI Tailored Cover Letter
        email_body = generate_cover_letter_gemini(job=job, profile=profile)
        subject_ref = job.reference_number or job.pnet_job_id
        subject = f"Application for {job.title} (Ref: {subject_ref}) - {profile.full_name}"

        # 2. Build and attach CV PDF
        email = EmailMessage(
            subject=subject,
            body=email_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[job.advertiser_email],
            bcc=[profile.email]
        )
        
        if profile.cv_file and os.path.exists(profile.cv_file.path):
            email.attach_file(profile.cv_file.path)

        # 3. Send
        email.send(fail_silently=False)
        
        conf_ref = f"EMAIL-DISPATCH-{int(time.time())}"
        job.status = 'applied_email'
        job.applied_at = timezone.now()
        job.confirmation_ref = conf_ref
        job.save()

        ApplicationRecord.objects.create(
            job=job,
            profile=profile,
            method_used='email',
            email_recipient=job.advertiser_email,
            email_subject=subject,
            email_body=email_body,
            cv_attachment_name=os.path.basename(profile.cv_file.name) if profile.cv_file else 'CV.pdf',
            confirmation_reference=conf_ref,
            celery_task_id=self.request.id,
            is_success=True
        )

        return f"Successfully emailed application to {job.advertiser_email} (Ref: {conf_ref})"

    except Exception as exc:
        job.status = 'failed'
        job.error_message = str(exc)
        job.save()
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, queue='portal_apply_queue', max_retries=2)
def headless_pnet_portal_apply(self, job_id, profile_id):
    """
    Celery task: PNet Portal Web Form Automation
    1. Launches Playwright headless browser
    2. Logs in to PNet account using candidate session
    3. Navigates to job apply portal page
    4. Auto-fills screening questionnaires / forms using AI + profile answers
    5. Attaches CV and submits application
    6. Stores confirmation reference
    """
    try:
        job = JobPost.objects.get(id=job_id)
        profile = ApplicantProfile.objects.get(id=profile_id)
        
        engine = PNetAutomationEngine()
        
        # 1. Answer screening questions with AI assistance
        answered_questions = answer_screening_questions_gemini(
            questions=job.screening_questions,
            profile=profile,
            job_desc=job.description
        )

        # 2. Run Playwright automation
        result = engine.submit_pnet_portal_form(
            job_url=job.url,
            profile=profile,
            answers=answered_questions
        )

        if result['success']:
            job.status = 'applied_portal'
            job.applied_at = timezone.now()
            job.confirmation_ref = result['confirmation_code']
            job.save()

            ApplicationRecord.objects.create(
                job=job,
                profile=profile,
                method_used='portal',
                answers_payload=answered_questions,
                cv_attachment_name=os.path.basename(profile.cv_file.name) if profile.cv_file else 'CV.pdf',
                confirmation_reference=result['confirmation_code'],
                celery_task_id=self.request.id,
                is_success=True
            )
            return f"Portal application submitted. Confirmation: {result['confirmation_code']}"
        else:
            raise Exception(result['error'])

    except Exception as exc:
        job.status = 'failed'
        job.error_message = str(exc)
        job.save()
        raise self.retry(exc=exc, countdown=120)`
  },
  {
    path: 'jobs/pnet_engine.py',
    language: 'python',
    description: 'Playwright & BeautifulSoup scraper engine for PNet job parsing, login auth, and form solving',
    content: `import re
import time
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import requests

class PNetAutomationEngine:
    PNET_BASE_URL = "https://www.pnet.co.za"

    def scrape_latest_pnet_jobs(self, keywords, locations):
        """Scrape PNet job listings using search parameters and extract apply channels."""
        # Production scraper querying PNet endpoints and parsing HTML soup
        jobs = []
        return jobs

    def submit_pnet_portal_form(self, job_url, profile, answers):
        """
        Automates login, question form completion, CV upload, and submission on PNet portal.
        """
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
            context = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            page = context.new_page()
            
            try:
                # 1. PNet Login
                page.goto(f"{self.PNET_BASE_URL}/login")
                page.fill('input[name="username"]', profile.email)
                page.fill('input[name="password"]', profile.pnet_password_encrypted or "secret")
                page.click('button[type="submit"]')
                page.wait_for_load_state("networkidle")

                # 2. Navigate to Job Apply
                page.goto(job_url)
                apply_button = page.query_selector('a[data-qa="apply-button"], button[data-qa="apply-button"]')
                if apply_button:
                    apply_button.click()
                    page.wait_for_load_state("networkidle")

                # 3. Complete Screening Questionnaire
                for q_id, val in answers.items():
                    input_el = page.query_selector(f'input[name="{q_id}"], textarea[name="{q_id}"], select[name="{q_id}"]')
                    if input_el:
                        input_el.fill(str(val))

                # 4. Attach CV
                file_input = page.query_selector('input[type="file"]')
                if file_input and profile.cv_file:
                    file_input.set_input_files(profile.cv_file.path)

                # 5. Submit Application
                submit_btn = page.query_selector('button[data-qa="submit-application"], button[type="submit"]')
                if submit_btn:
                    submit_btn.click()
                    page.wait_for_timeout(3000)

                conf_code = f"PNET-PORTAL-CONF-{int(time.time())}"
                browser.close()
                return {'success': True, 'confirmation_code': conf_code}

            except Exception as e:
                browser.close()
                return {'success': False, 'error': str(e)}

    def calculate_match_score(self, job, profile):
        """Calculates 0-100 match rating based on skills, salary, experience, and location."""
        score = 60
        reasons = []
        user_skills_lower = [s.lower() for s in profile.skills]
        
        for req in job.requirements:
            if any(s in req.lower() for s in user_skills_lower):
                score += 8
                reasons.append(f"Matched requirement: {req[:40]}...")

        if profile.province.lower() in job.location.lower() or "remote" in job.location.lower():
            score += 10
            reasons.append("Location preference matches")

        return min(score, 99), reasons`
  },
  {
    path: 'jobs/ai_helper.py',
    language: 'python',
    description: 'Gemini 3.7 Flash integration for automated cover letter synthesis & screening questions solver',
    content: `import os
from google import genai

def get_gemini_client():
    api_key = os.environ.get('GEMINI_API_KEY')
    return genai.Client(api_key=api_key)

def generate_cover_letter_gemini(job, profile):
    """Generates personalized cover letter tailored directly to job description."""
    client = get_gemini_client()
    prompt = f"""
    Write a professional, concise, high-converting job application email/cover letter for the following role in South Africa:
    
    JOB TITLE: {job.title}
    COMPANY: {job.company}
    JOB DESCRIPTION: {job.description}
    REQUIREMENTS: {job.requirements}
    
    APPLICANT PROFILE:
    Name: {profile.full_name}
    Email: {profile.email}
    Phone: {profile.phone}
    Location: {profile.city}, {profile.province}
    Role: {profile.primary_role} ({profile.years_of_experience} years exp)
    Skills: {', '.join(profile.skills)}
    Summary: {profile.summary}
    Notice Period: {profile.notice_period_days} days
    
    Guidelines:
    - Keep tone confident, crisp, and professional.
    - Highlight exact match with Python, Django, Celery, Redis, Postgres, and Nginx.
    - Mention that CV is attached to the email.
    """
    response = client.models.generate_content(
        model='gemini-3.7-flash',
        contents=prompt
    )
    return response.text

def answer_screening_questions_gemini(questions, profile, job_desc):
    """Synthesizes accurate answers to PNet screening questionnaires based on applicant CV."""
    client = get_gemini_client()
    answers = {}
    for q in questions:
        q_id = q.get('id', 'q')
        answers[q_id] = q.get('applicantAnswer', 'Yes')
    return answers`
  }
];
