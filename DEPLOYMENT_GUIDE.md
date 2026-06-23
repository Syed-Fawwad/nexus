# Nexus - Deployment Guide

## Quick Start (Development)

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your credentials
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# PORT=5000
# NODE_ENV=development
# CLIENT_URL=http://localhost:3000

# 5. Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd Nexus

# 2. Install dependencies
npm install

# 3. Create .env file (optional - has defaults)
cp .env.example .env

# 4. Edit .env if needed
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000

# 5. Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## Production Deployment

### Option 1: Heroku + Vercel (Recommended for MVP)

#### Backend on Heroku

```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
heroku login

# 3. Create Heroku app
cd backend
heroku create nexus-backend

# 4. Add MongoDB addon (or use MongoDB Atlas)
heroku addons:create mongolab:sandbox
# OR set your MongoDB Atlas URI:
heroku config:set MONGODB_URI="mongodb+srv://..."

# 5. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-production-secret-256-bits"
heroku config:set CLIENT_URL="https://your-frontend-domain.vercel.app"

# 6. Deploy
git push heroku main

# 7. Verify deployment
heroku logs --tail
heroku open
```

#### Frontend on Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from frontend directory
cd Nexus
vercel

# 4. Set environment variables in Vercel dashboard
# VITE_API_URL=https://nexus-backend.herokuapp.com/api
# VITE_SOCKET_URL=https://nexus-backend.herokuapp.com

# 5. Deploy to production
vercel --prod
```

---

### Option 2: Railway (All-in-One)

#### Backend Deployment

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
cd backend
railway init

# 4. Add MongoDB plugin in Railway dashboard
# Or link external MongoDB Atlas

# 5. Set environment variables in Railway dashboard
# NODE_ENV=production
# JWT_SECRET=your-secret
# CLIENT_URL=https://your-frontend.railway.app
# MONGODB_URI=railway-provided-or-atlas

# 6. Deploy
railway up
```

#### Frontend Deployment

```bash
# 1. Create new Railway project
cd Nexus
railway init

# 2. Set environment variables in Railway dashboard
# VITE_API_URL=https://your-backend.railway.app/api
# VITE_SOCKET_URL=https://your-backend.railway.app

# 3. Deploy
railway up
```

---

### Option 3: DigitalOcean (Full Control)

#### Backend Setup

```bash
# 1. Create Ubuntu droplet (Min: 1GB RAM)
# 2. SSH into server
ssh root@your-server-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PM2
npm install -g pm2

# 5. Clone repository
git clone https://github.com/yourusername/nexus.git
cd nexus/backend

# 6. Install dependencies
npm install --production

# 7. Create .env file
nano .env
# Add production environment variables

# 8. Start with PM2
pm2 start npm --name "nexus-backend" -- start
pm2 save
pm2 startup

# 9. Install Nginx
sudo apt install nginx

# 10. Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/nexus

# Add configuration:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 11. Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/nexus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 12. Install SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### Frontend Setup

```bash
# 1. Build locally with production URLs
cd Nexus
npm install
npm run build

# 2. Upload dist folder to server
scp -r dist/* root@your-server-ip:/var/www/nexus

# 3. Configure Nginx for frontend
sudo nano /etc/nginx/sites-available/nexus-frontend

# Add configuration:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/nexus;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# 4. Enable and restart
sudo ln -s /etc/nginx/sites-available/nexus-frontend /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# 5. Install SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### Option 4: AWS (Scalable Production)

#### Backend on AWS Elastic Beanstalk

```bash
# 1. Install AWS CLI and EB CLI
pip install awsebcli

# 2. Configure AWS credentials
aws configure

# 3. Initialize Elastic Beanstalk
cd backend
eb init

# 4. Create environment
eb create nexus-backend-prod

# 5. Set environment variables
eb setenv NODE_ENV=production JWT_SECRET=your-secret MONGODB_URI=your-uri CLIENT_URL=your-frontend-url

# 6. Deploy
eb deploy

# 7. Open application
eb open
```

#### Frontend on AWS S3 + CloudFront

```bash
# 1. Build production bundle
cd Nexus
npm run build

# 2. Create S3 bucket
aws s3 mb s3://nexus-frontend

# 3. Enable static website hosting
aws s3 website s3://nexus-frontend --index-document index.html

# 4. Upload build files
aws s3 sync dist/ s3://nexus-frontend

# 5. Create CloudFront distribution (via AWS Console)
# - Origin: S3 bucket
# - Enable HTTPS
# - Configure custom domain

# 6. Update DNS records
# Point your domain to CloudFront distribution
```

---

## Environment Variables Reference

### Backend (.env)

```env
# Server Configuration
PORT=5000                          # Server port
NODE_ENV=production                # production | development

# Database
MONGODB_URI=mongodb+srv://...      # MongoDB connection string

# Security
JWT_SECRET=your-256-bit-secret     # JWT signing secret (use strong random string)

# CORS
CLIENT_URL=https://yourdomain.com  # Frontend URL for CORS
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com/api    # Backend API URL
VITE_SOCKET_URL=https://api.yourdomain.com     # Socket.IO URL
```

---

## Post-Deployment Verification

### Backend Health Check

```bash
# Check server health
curl https://your-backend-url/api/health

# Expected response:
{
  "server": "running",
  "database": "connected",
  "uptime": 123456,
  "timestamp": "2026-06-21T12:00:00.000Z"
}
```

### Test Authentication

```bash
# Test registration
curl -X POST https://your-backend-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "entrepreneur"
  }'

# Test login
curl -X POST https://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Frontend Verification

1. Open frontend URL in browser
2. Check browser console for errors
3. Test login flow
4. Test real-time chat
5. Test meeting creation
6. Verify Socket.IO connection

---

## Monitoring Setup

### Backend Monitoring with PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name nexus-backend

# Monitor
pm2 monit

# View logs
pm2 logs nexus-backend

# Setup startup script
pm2 startup
pm2 save
```

### Error Tracking with Sentry

```bash
# Install Sentry SDK
npm install @sentry/node

# Add to server.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### Uptime Monitoring

- **UptimeRobot**: Free tier for basic uptime monitoring
- **Pingdom**: Advanced monitoring with alerts
- **New Relic**: Full APM solution

---

## Backup Strategy

### MongoDB Atlas Automated Backups

1. Enable continuous backups in Atlas dashboard
2. Set retention period (7-35 days)
3. Schedule point-in-time restores

### Manual Backup

```bash
# Backup MongoDB
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Restore MongoDB
mongorestore --uri="mongodb+srv://..." /backup/20260621
```

---

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (AWS ALB, Nginx)
- Deploy multiple backend instances
- Use Redis for session management
- Implement sticky sessions for Socket.IO

### Database Optimization

- Add indexes on frequently queried fields
- Implement query result caching
- Use MongoDB Atlas auto-scaling
- Consider read replicas for heavy read workloads

### CDN for Frontend

- Cloudflare (Free tier available)
- AWS CloudFront
- Vercel Edge Network (automatic)

---

## Troubleshooting

### Common Issues

#### Socket.IO Connection Failed

**Problem:** Frontend can't connect to Socket.IO

**Solution:**
1. Check CORS configuration in backend
2. Verify VITE_SOCKET_URL is correct
3. Ensure Socket.IO server is running
4. Check firewall/security group settings

#### JWT Token Invalid

**Problem:** Authentication fails after deployment

**Solution:**
1. Verify JWT_SECRET matches across deployments
2. Clear localStorage in browser
3. Check token expiration settings
4. Verify axios headers are set correctly

#### Database Connection Error

**Problem:** MongoDB connection fails

**Solution:**
1. Check MONGODB_URI is correct
2. Verify MongoDB Atlas IP whitelist includes your server
3. Check database user permissions
4. Test connection string locally first

#### CORS Errors

**Problem:** API requests blocked by CORS

**Solution:**
1. Update CLIENT_URL environment variable
2. Verify CORS middleware configuration
3. Check if protocol (http/https) matches
4. Ensure no trailing slashes in URLs

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (256 bits minimum)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Enable MongoDB authentication
- [ ] Remove .env files from git
- [ ] Set secure HTTP headers (Helmet.js)
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

---

## Performance Optimization

### Backend

```javascript
// Add compression
import compression from 'compression';
app.use(compression());

// Add caching headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});
```

### Frontend

```bash
# Analyze bundle size
npm run build -- --mode analyze

# Optimize images before deployment
# Use modern formats (WebP, AVIF)
# Lazy load images and components
```

---

## Maintenance Tasks

### Weekly
- Review error logs
- Check server resource usage
- Verify backup completion
- Update dependencies (if needed)

### Monthly
- Security patches
- Database optimization
- Performance review
- User feedback analysis

### Quarterly
- Major dependency updates
- Security audit
- Load testing
- Disaster recovery test

---

## Support Resources

### Documentation
- Express.js: https://expressjs.com
- React: https://react.dev
- MongoDB: https://docs.mongodb.com
- Socket.IO: https://socket.io/docs

### Community
- Stack Overflow
- GitHub Issues
- Discord/Slack communities

### Professional Support
- MongoDB Atlas Support
- Vercel Support
- Heroku Support
- AWS Support (paid tiers)

---

## Rollback Procedure

### Quick Rollback (Heroku)

```bash
# View releases
heroku releases

# Rollback to previous version
heroku rollback v123
```

### Manual Rollback

```bash
# Backend
git revert HEAD
git push heroku main

# Frontend
vercel rollback
```

---

## Success Metrics

Track these KPIs post-deployment:
- User registration rate
- Daily/Monthly active users
- Message delivery latency
- API response times
- Error rates
- User retention
- Feature adoption rates

---

**Need Help?**
- Check logs first: `heroku logs --tail` or `pm2 logs`
- Review error messages carefully
- Search documentation
- Ask in developer communities
- Contact hosting provider support

