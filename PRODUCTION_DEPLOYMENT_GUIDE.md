# NEXUS - PRODUCTION DEPLOYMENT GUIDE

**Version:** 1.0  
**Status:** Production Ready  
**Deployment Time:** 2-4 hours

---

## QUICK START DEPLOYMENT

### Prerequisites Checklist
- [ ] MongoDB Atlas account created
- [ ] Heroku/Vercel/Railway account created  
- [ ] Domain name (optional but recommended)
- [ ] Git repository ready
- [ ] All verification tests passed (96.4%)

---

## DEPLOYMENT OPTIONS

### Option 1: Free Tier (Testing/Demo)
- **Backend:** Heroku Free Tier
- **Frontend:** Vercel Free Tier
- **Database:** MongoDB Atlas M0 (Free)
- **Cost:** $0/month
- **Limitations:** Sleep after 30min inactivity, 512MB RAM

### Option 2: Production Ready
- **Backend:** Heroku Standard or DigitalOcean $24/mo
- **Frontend:** Vercel Pro $20/mo
- **Database:** MongoDB Atlas M10 $57/mo
- **Cost:** ~$100/month
- **Benefits:** No sleep, better performance, 24/7 uptime

---

## STEP 1: DATABASE SETUP (15 minutes)

### 1.1 Create MongoDB Atlas Cluster

```bash
# Go to https://cloud.mongodb.com
# Click "Build a Database"
# Choose M0 Free Tier (or M10 for production)
# Select cloud provider: AWS
# Select region: Closest to your users
# Cluster name: nexus-production
```

### 1.2 Create Database User

```
Username: nexus_app
Password: [Click "Autogenerate Secure Password" and save it]
Database privileges: Atlas admin
```

### 1.3 Configure Network Access

```
# Click "Network Access" → "Add IP Address"
# Option 1 (Testing): "Allow access from anywhere" (0.0.0.0/0)
# Option 2 (Production): Add specific server IPs
```

### 1.4 Get Connection String

```
# Click "Connect" → "Connect your application"
# Driver: Node.js
# Version: 5.5 or later
# Copy connection string:
mongodb+srv://nexus_app:<password>@nexus-production.xxxxx.mongodb.net/?retryWrites=true&w=majority

# Replace <password> with actual password
```

---

## STEP 2: BACKEND DEPLOYMENT (45 minutes)

### 2.1 Prepare Environment Variables

Create `backend/.env.production`:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://nexus_app:YOUR_PASSWORD@nexus-production.xxxxx.mongodb.net/nexus?retryWrites=true&w=majority
JWT_SECRET=generate-a-super-long-random-string-at-least-64-characters-use-password-generator
CLIENT_URL=https://your-app-name.vercel.app
```

**Generate JWT Secret:**
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Use online generator
# Visit: https://randomkeygen.com
# Use "Fort Knox Password" (256-bit)
```

### 2.2 Deploy to Heroku

```bash
# Install Heroku CLI
# Windows: Download from heroku.com/cli
# Mac: brew tap heroku/brew && brew install heroku
# Linux: curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
cd backend
heroku create nexus-backend-yourname

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="mongodb+srv://nexus_app:PASSWORD@cluster.mongodb.net/nexus"
heroku config:set JWT_SECRET="your-64-character-random-secret"
heroku config:set CLIENT_URL="https://your-frontend.vercel.app"

# Initialize git if not already
git init
git add .
git commit -m "Initial commit"

# Deploy
git push heroku main

# Check logs
heroku logs --tail

# Open app
heroku open
```

**Expected output:**
```
Server running in production mode on port XXXX
MongoDB Connected: nexus-production.xxxxx.mongodb.net
[Socket.IO] Real-time chat server ready
```

### 2.3 Alternative: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up

# Set environment variables in Railway dashboard
# Go to railway.app → your project → Variables
# Add: NODE_ENV, MONGODB_URI, JWT_SECRET, CLIENT_URL

# Get deployment URL
railway domain
```

### 2.4 Test Backend Deployment

```bash
# Test health endpoint
curl https://your-backend.herokuapp.com/api/health

# Expected response:
{
  "server": "running",
  "database": "connected"
}

# Test registration
curl -X POST https://your-backend.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "role": "entrepreneur"
  }'

# Should return user object with JWT token
```

---

## STEP 3: FRONTEND DEPLOYMENT (30 minutes)

### 3.1 Update API Configuration

Edit `Nexus/src/services/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend.herokuapp.com/api';
```

Or create `Nexus/.env.production`:

```env
VITE_API_URL=https://your-backend.herokuapp.com/api
```

### 3.2 Build Frontend

```bash
cd Nexus
npm install
npm run build

# Build output will be in: Nexus/dist/
# Verify build succeeded (no errors)
```

### 3.3 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd Nexus
vercel --prod

# Set environment variable
# Go to vercel.com → your project → Settings → Environment Variables
# Add: VITE_API_URL = https://your-backend.herokuapp.com/api
# Redeploy after adding env var: vercel --prod
```

### 3.4 Alternative: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Configure environment variables
# Go to netlify.com → your site → Site settings → Environment variables
# Add: VITE_API_URL
```

### 3.5 Get Your Frontend URL

```
Vercel: https://nexus-xxxxx.vercel.app
Netlify: https://xxxxx.netlify.app
```

---

## STEP 4: CONFIGURE CORS (5 minutes)

### 4.1 Update Backend CORS Settings

After frontend deploys, update backend CLIENT_URL:

```bash
# Heroku
heroku config:set CLIENT_URL="https://your-actual-frontend-url.vercel.app"

# Railway
# Update in Railway dashboard Variables
```

### 4.2 Verify CORS Configuration

File: `backend/server.js` should have:

```javascript
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
```

### 4.3 Restart Backend

```bash
# Heroku
heroku restart

# Railway
# Automatic restart on config change
```

---

## STEP 5: PRODUCTION TESTING (30 minutes)

### 5.1 Full Feature Test

Open your deployed frontend URL and test:

**Authentication:**
- [ ] Register new user (entrepreneur)
- [ ] Logout
- [ ] Login with credentials
- [ ] View dashboard (no blank screen)

**Profile:**
- [ ] Edit profile information
- [ ] Upload profile picture
- [ ] Save changes

**Messaging:**
- [ ] Open in 2 browsers (incognito)
- [ ] Register 2 different users
- [ ] Send message from user 1
- [ ] Verify appears instantly for user 2
- [ ] Check typing indicator works

**Meetings:**
- [ ] Schedule a meeting
- [ ] Accept meeting request
- [ ] View calendar
- [ ] No conflict detection errors

**Video Calls:**
- [ ] Initiate video call
- [ ] Accept call (in second browser)
- [ ] Toggle audio on/off
- [ ] Toggle video on/off
- [ ] End call
- [ ] Check reconnection works

**Documents:**
- [ ] Upload a document
- [ ] View document in list
- [ ] Download document
- [ ] Sign document
- [ ] Delete document

**Payments:**
- [ ] View wallet balance
- [ ] Deposit funds
- [ ] Withdraw funds
- [ ] Transfer to another user
- [ ] View transaction history

**Collaboration:**
- [ ] Send collaboration request (as investor)
- [ ] Accept request (as entrepreneur)
- [ ] View connection status

### 5.2 Browser Console Check

Press F12 and check:
- [ ] No red errors in Console tab
- [ ] API calls return 200/201 (Network tab)
- [ ] WebSocket connects successfully
- [ ] No CORS errors

### 5.3 Mobile Testing

Test on mobile device:
- [ ] Responsive layout works
- [ ] All features accessible
- [ ] Video calls work (if mobile supports WebRTC)

---

## STEP 6: SECURITY HARDENING (15 minutes)

### 6.1 SSL Certificate

**Heroku/Vercel/Railway:**
- SSL automatically provided ✅
- Verify https:// works

**Custom Domain:**
```bash
# Heroku
heroku certs:auto:enable

# Vercel
# Automatic when custom domain added

# Let's Encrypt (VPS)
sudo certbot --nginx -d yourdomain.com
```

### 6.2 Environment Variables Security

Verify:
- [ ] .env files NOT in git (.gitignore configured)
- [ ] JWT_SECRET is strong (64+ characters)
- [ ] MongoDB password is strong
- [ ] No API keys exposed in frontend

### 6.3 Rate Limiting Verification

Test rate limiting:
```bash
# Try 10 rapid login attempts
for i in {1..10}; do
  curl -X POST https://your-backend/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' &
done

# After 5 attempts, should return 429 (Too Many Requests)
```

---

## STEP 7: MONITORING SETUP (Optional)

### 7.1 Uptime Monitoring

**Free option: UptimeRobot**
```
1. Go to uptimerobot.com
2. Add Monitor
3. URL: https://your-backend/api/health
4. Interval: 5 minutes
5. Alert: Email when down
```

### 7.2 Error Tracking (Recommended)

**Sentry Setup:**
```bash
npm install @sentry/node @sentry/integrations

# backend/server.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### 7.3 Analytics (Optional)

**Google Analytics:**
```html
<!-- Nexus/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

---

## COST SUMMARY

### Free Tier (Development/Testing)
```
MongoDB Atlas M0:      $0/month
Heroku Hobby:          $0/month
Vercel Hobby:          $0/month
Domain (optional):     $12/year
─────────────────────────────
Total:                 $0/month (or $1/month for domain)
```

### Production (Small Scale)
```
MongoDB Atlas M10:     $57/month
Heroku Standard-1X:    $25/month
Vercel Pro:            $20/month
Domain + SSL:          $12/year
─────────────────────────────
Total:                 $102/month + $1/month domain
```

### Production (High Performance)
```
MongoDB Atlas M30:     $396/month
DigitalOcean 8GB:      $48/month
Vercel Pro:            $20/month
CloudFlare (optional): $0/month (free tier)
Domain:                $12/year
─────────────────────────────
Total:                 $464/month
```

---

## TROUBLESHOOTING

### "Cannot connect to MongoDB"
```bash
# Check connection string
echo $MONGODB_URI

# Test with mongosh
mongosh "mongodb+srv://nexus_app:PASSWORD@cluster.mongodb.net/nexus"

# Common issues:
# 1. Wrong password (check for special characters that need encoding)
# 2. IP not whitelisted
# 3. Database user doesn't exist
# 4. Cluster not finished provisioning
```

### "CORS Error"
```javascript
// Verify CLIENT_URL exactly matches frontend URL
// No trailing slash
// Include protocol (https://)
// Case sensitive

// Check logs
heroku logs --tail | grep CORS
```

### "Socket.IO won't connect"
```javascript
// 1. Check Socket.IO CORS in backend/server.js
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// 2. Verify frontend socket URL
const socket = io('https://your-backend.herokuapp.com', {
  auth: { token: localStorage.getItem('business_nexus_token') }
});
```

### "Video calls fail"
```
// WebRTC requires HTTPS in production
// Check browser console for ICE connection errors
// Test STUN servers are reachable
// Consider adding TURN server for better connectivity
```

### "File uploads fail"
```bash
# Heroku has ephemeral filesystem
# Files uploaded will disappear on dyno restart
# Solution: Use cloud storage (AWS S3, Cloudinary)

# Check disk space
heroku run df -h

# Check upload limits
heroku config | grep MAX_FILE_SIZE
```

---

## ROLLBACK PROCEDURE

If deployment fails:

```bash
# 1. Rollback Heroku
heroku releases
heroku rollback v42  # Replace with last working version

# 2. Rollback Vercel
vercel --prod  # Redeploy previous version

# 3. Restore Database (if needed)
# Go to MongoDB Atlas → Clusters → Restore
# Choose snapshot before deployment
```

---

## POST-DEPLOYMENT CHECKLIST

- [ ] Frontend loads at production URL
- [ ] Backend /api/health returns "connected"
- [ ] Users can register
- [ ] Users can login
- [ ] Dashboard displays without errors
- [ ] Real-time messages work
- [ ] Video calls connect
- [ ] Documents upload
- [ ] Payments process
- [ ] SSL certificate valid (https:// works)
- [ ] No console errors
- [ ] Mobile responsive
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Monitoring configured
- [ ] Backups enabled (MongoDB Atlas)

---

## MAINTENANCE

### Weekly
- [ ] Check uptime reports
- [ ] Review error logs
- [ ] Monitor disk usage
- [ ] Check database size

### Monthly
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Check SSL certificate expiry
- [ ] Rotate API keys/secrets
- [ ] Review user feedback

### Quarterly
- [ ] Performance audit
- [ ] Security audit
- [ ] Backup restore test
- [ ] Scaling assessment

---

## SUPPORT

**Deployment Issues:**
- Heroku: devcenter.heroku.com
- Vercel: vercel.com/support
- MongoDB: support.mongodb.com

**Application Issues:**
- Check: FINAL_VERIFICATION_REPORT.md
- Logs: `heroku logs --tail`
- Health: `/api/health` endpoint

---

**🎉 DEPLOYMENT COMPLETE!**

Your Nexus platform is now live in production. Share the URL with users and monitor the deployment for the first 24 hours.

**Frontend URL:** https://your-app.vercel.app  
**Backend URL:** https://your-backend.herokuapp.com  
**Status Page:** https://your-backend.herokuapp.com/api/health

