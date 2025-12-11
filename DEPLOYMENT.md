# Deployment Guide - Carphatian AI Marketplace

**Built by Carphatian** | Production-Ready Deployment Instructions

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [GitHub Secrets Configuration](#github-secrets-configuration)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before deploying, ensure you have:

- **Ubuntu VPS** with at least 2GB RAM, 2 CPU cores, 20GB storage
- **Docker** and **Docker Compose** installed
- **Nginx** installed (for reverse proxy)
- **Domain name** pointed to your server (e.g., chat.carphatian.ro)
- **Let's Encrypt SSL** certificate configured
- **Git** installed on the server

### Required Accounts & API Keys

1. **Supabase** - PostgreSQL database with pgvector
2. **Stripe** - Payment processing (Connect account)
3. **OpenAI** - AI model access (GPT-4o)
4. **Groq** - Free AI alternative (Llama 3)
5. **Anthropic** - Claude fallback (optional)
6. **Upstash Redis** - Caching and rate limiting
7. **SendGrid** - Email notifications
8. **Sentry** - Error tracking
9. **PostHog** - Analytics

---

## Local Development

### 1. Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/yourusername/chat-carphatian.git
cd chat-carphatian
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your API keys:

```bash
nano .env.local
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Docker Deployment

### 1. Build Docker Images

```bash
# Build Next.js frontend
docker build -t carphatian-nextjs .

# Build FastAPI backend (when implemented)
docker build -f Dockerfile.fastapi -t carphatian-fastapi .
```

### 2. Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### 3. Access Services

- **Next.js Frontend**: http://localhost:3000
- **FastAPI Backend**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MinIO Console**: http://localhost:9001

---

## Production Deployment

### Step 1: Prepare VPS

SSH into your production server:

```bash
ssh ubuntu@chat.carphatian.ro
```

Install Docker and Docker Compose:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/yourusername/chat-carphatian.git
cd chat-carphatian
```

### Step 3: Configure Production Environment

Create production environment file:

```bash
cp .env.example .env.production
nano .env.production
```

Fill in all production values (see `.env.example` for reference)

### Step 4: Configure Nginx

Copy the Nginx configuration:

```bash
sudo cp docker/nginx.conf /etc/nginx/sites-available/chat.carphatian.ro
sudo ln -s /etc/nginx/sites-available/chat.carphatian.ro /etc/nginx/sites-enabled/
```

Test Nginx configuration:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Obtain SSL Certificate

Use Certbot for Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d chat.carphatian.ro
```

### Step 6: Deploy with Docker Compose

```bash
# Pull latest code
git pull origin main

# Build and start containers
docker-compose up -d --build

# Verify containers are running
docker-compose ps

# Check logs
docker-compose logs -f nextjs
```

### Step 7: Verify Deployment

Visit your domain: https://chat.carphatian.ro

Check health endpoints:
- Frontend: https://chat.carphatian.ro/health
- API: https://chat.carphatian.ro/api/health

---

## GitHub Secrets Configuration

To enable automatic deployments via GitHub Actions, configure these secrets in your GitHub repository:

Go to: **Repository → Settings → Secrets and variables → Actions**

### Required Secrets

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | `eyJ...` |
| `NEXT_PUBLIC_APP_URL` | Production URL | `https://chat.carphatian.ro` |
| `VPS_HOST` | Server IP or hostname | `123.45.67.89` |
| `VPS_USER` | SSH username | `ubuntu` |
| `SSH_PRIVATE_KEY` | SSH private key for deployment | See below |

### Generate SSH Key for Deployment

On your local machine:

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_deploy.pub ubuntu@chat.carphatian.ro

# Copy private key content to GitHub Secret
cat ~/.ssh/github_deploy
# Paste the entire output into GitHub Secret: SSH_PRIVATE_KEY
```

---

## SSL Certificate Setup

### Automatic Renewal

Certbot automatically renews certificates. Verify the renewal timer:

```bash
sudo systemctl status certbot.timer
```

Test renewal manually:

```bash
sudo certbot renew --dry-run
```

### Manual SSL Configuration

If using custom certificates, update `docker/nginx.conf`:

```nginx
ssl_certificate /etc/letsencrypt/live/chat.carphatian.ro/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/chat.carphatian.ro/privkey.pem;
```

---

## Monitoring & Maintenance

### View Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nextjs
docker-compose logs -f fastapi
docker-compose logs -f postgres
```

### Restart Services

```bash
# Restart specific service
docker-compose restart nextjs

# Restart all services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

### Database Backup

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U carphatian carphatian_ai_marketplace > backup.sql

# Restore PostgreSQL
docker-compose exec -T postgres psql -U carphatian carphatian_ai_marketplace < backup.sql
```

### Update Application

```bash
cd /home/ubuntu/chat-carphatian

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Clean up old images
docker system prune -f
```

### Health Checks

Monitor application health:

```bash
# Check container status
docker-compose ps

# Check resource usage
docker stats

# Check disk space
df -h
```

### Security Updates

Keep system packages updated:

```bash
sudo apt update
sudo apt upgrade -y
```

Update Docker images regularly:

```bash
cd /home/ubuntu/chat-carphatian
docker-compose pull
docker-compose up -d
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs nextjs

# Verify environment variables
docker-compose config

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test database connection
docker-compose exec postgres psql -U carphatian -d carphatian_ai_marketplace -c "SELECT version();"
```

### Nginx Errors

```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

---

## Performance Optimization

### Enable Caching

Redis is already configured for caching. Monitor cache hit rate:

```bash
docker-compose exec redis redis-cli INFO stats | grep hit
```

### Monitor Resource Usage

```bash
# Container resource usage
docker stats

# System resource usage
htop
```

### Scale Services

If traffic increases, scale workers:

```bash
# Scale Next.js to 3 instances
docker-compose up -d --scale nextjs=3
```

---

## Rollback Procedure

If deployment fails, rollback to previous version:

```bash
cd /home/ubuntu/chat-carphatian

# Revert to previous Git commit
git log --oneline -n 5  # Find commit hash
git reset --hard <commit-hash>

# Restart containers with previous version
docker-compose down
docker-compose up -d --build
```

---

## Next Steps

After successful deployment:

1. **Configure monitoring**: Set up Sentry and PostHog dashboards
2. **Enable backups**: Schedule automated database backups
3. **Test payments**: Verify Stripe integration in production mode
4. **Load testing**: Use tools like k6 or Apache Bench
5. **CDN setup**: Configure Cloudflare for static assets

---

**Built by Carphatian** 🚀

For support, visit: https://carphatian.ro
