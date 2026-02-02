# 🚀 Fashion Hub - Complete Deployment Guide

This comprehensive guide will walk you through deploying your full-stack Fashion Hub application (Frontend + Backend + Database) to production.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Database Deployment](#database-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)

---

## 📋 Prerequisites

Before starting deployment, ensure you have:

- ✅ GitHub account
- ✅ All code committed and pushed to GitHub
- ✅ Node.js installed locally (for testing)
- ✅ MySQL database backup ready
- ✅ Email credentials for email service
- ✅ Credit card (for some services, even if free tier)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Users/Clients │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend (React)│  ← Netlify/Vercel
│  Port: 443 (HTTPS)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend (Node.js)│  ← Railway/Render
│  Port: 5000      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Database (MySQL) │  ← Railway/PlanetScale
│  Port: 3306      │
└─────────────────┘
```

---

## 🗄️ STEP 1: Database Deployment

### Option A: Railway (Recommended - Easy)

#### 1. Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify your email

#### 2. Create MySQL Database
1. Click **"New Project"**
2. Select **"Provision MySQL"**
3. Wait for database to be created (2-3 minutes)

#### 3. Get Database Credentials
1. Click on your MySQL service
2. Go to **"Variables"** tab
3. Copy these values:
   ```
   MYSQL_HOST=containers-us-west-xxx.railway.app
   MYSQL_PORT=6379
   MYSQL_USER=root
   MYSQL_PASSWORD=xxxxxxxxxxxxx
   MYSQL_DATABASE=railway
   ```

#### 4. Import Your Database
1. Download and install [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
2. Create new connection with Railway credentials
3. Open your `database.sql` file
4. Execute the SQL script to create tables
5. Verify tables are created

**Alternative: Use Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Import database
railway run mysql -u root -p < database.sql
```

### Option B: PlanetScale (Alternative - Serverless)

1. Go to [PlanetScale.com](https://planetscale.com)
2. Sign up with GitHub
3. Create new database
4. Get connection string
5. Import schema using their web interface

---

## 🖥️ STEP 2: Backend Deployment

### Option A: Railway (Recommended)

#### 1. Prepare Backend for Deployment

**Update `backend/package.json`:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 2. Create Railway Backend Service

1. In Railway dashboard, click **"New"** → **"GitHub Repo"**
2. Select your Fashion-Hub repository
3. Railway will detect it's a Node.js app

#### 3. Configure Environment Variables

In Railway, go to **Variables** tab and add:

```env
# Database Configuration
DB_HOST=containers-us-west-xxx.railway.app
DB_USER=root
DB_PASSWORD=your_railway_mysql_password
DB_NAME=railway
DB_PORT=6379

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (Generate a strong random string)
JWT_SECRET=your_super_secure_random_string_here_min_32_chars

# Frontend URL (Will update after frontend deployment)
FRONTEND_URL=https://your-frontend-url.netlify.app

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Fashion Hub
ADMIN_EMAIL=admin@fashionhub.com
EMAIL_ENABLED=true

# Backup Configuration (Optional)
BACKUP_DIR=/app/backups
MAX_BACKUPS=7
TZ=Asia/Kolkata
```

#### 4. Set Root Directory

1. Go to **Settings** → **Service Settings**
2. Set **Root Directory** to: `backend`
3. Set **Start Command** to: `npm start`

#### 5. Deploy

1. Click **"Deploy"**
2. Wait 3-5 minutes for deployment
3. You'll get a URL like: `https://fashion-hub-backend.up.railway.app`

#### 6. Verify Backend is Running

Visit: `https://your-backend-url.up.railway.app/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2025-02-01T10:30:00.000Z"
}
```

### Option B: Render (Alternative)

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: fashion-hub-backend
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables (same as Railway)
7. Click **"Create Web Service"**

---

## 🎨 STEP 3: Frontend Deployment

### Option A: Netlify (Recommended)

#### 1. Prepare Frontend

**Update `frontend/.env`:**
```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

**Update `frontend/vite.config.js`:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          axios: ['axios']
        }
      }
    }
  }
})
```

#### 2. Build Locally (Test)

```bash
cd frontend
npm install
npm run build
```

Verify `dist` folder is created.

#### 3. Create Netlify Account

1. Go to [Netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Verify email

#### 4. Deploy to Netlify

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Select your **Fashion-Hub** repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Click **"Deploy site"**

#### 5. Configure Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```
3. Click **"Save"**
4. Trigger redeploy: **Deploys** → **Trigger deploy** → **Deploy site**

#### 6. Fix React Router (Important!)

Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

Commit and push:
```bash
git add frontend/public/_redirects
git commit -m "Add Netlify redirects for React Router"
git push
```

Netlify will auto-redeploy.

#### 7. Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS

### Option B: Vercel (Alternative)

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"New Project"**
4. Import your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
6. Add environment variable: `VITE_API_URL`
7. Click **"Deploy"**

---

## ⚙️ STEP 4: Post-Deployment Configuration

### 1. Update Backend CORS

Now that you have your frontend URL, update backend environment variables:

**In Railway (Backend):**
```env
FRONTEND_URL=https://your-actual-frontend.netlify.app
```

Redeploy backend.

### 2. Update Frontend API URL

**In Netlify (Frontend):**
```env
VITE_API_URL=https://your-actual-backend.up.railway.app
```

Trigger redeploy.

### 3. Test Email Service

1. Try password reset feature
2. Try user registration
3. Check if emails are received

### 4. Upload Product Images

Since you're using file uploads:

1. Create a cloud storage account (AWS S3, Cloudinary, etc.)
2. Or use Railway's persistent volumes
3. Update upload paths in backend

**For Railway Persistent Storage:**
1. Go to your backend service
2. Click **"Settings"** → **"Volumes"**
3. Add volume: `/app/uploads`
4. Redeploy

### 5. Set Up Automated Backups

**Option 1: Railway Cron Job**
```bash
# In Railway, add a new service
# Type: Cron Job
# Schedule: 0 2 * * * (Daily at 2 AM)
# Command: npm run backup
```

**Option 2: GitHub Actions**
Create `.github/workflows/backup.yml`:
```yaml
name: Database Backup
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run backup
        run: |
          npm install
          npm run backup
        env:
          DB_HOST: ${{ secrets.DB_HOST }}
          DB_USER: ${{ secrets.DB_USER }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          DB_NAME: ${{ secrets.DB_NAME }}
```

---

## ✅ STEP 5: Testing & Verification

### 1. Test All Features

**User Features:**
- [ ] User registration
- [ ] User login
- [ ] Password reset
- [ ] Browse products
- [ ] Add to cart
- [ ] Checkout process
- [ ] Order placement
- [ ] Custom tailoring appointment
- [ ] Membership upgrade

**Admin Features:**
- [ ] Admin login
- [ ] Dashboard statistics
- [ ] Manage products
- [ ] Manage users
- [ ] Manage orders
- [ ] View reviews
- [ ] Analytics
- [ ] Payment verification

### 2. Performance Testing

**Use Google Lighthouse:**
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit
4. Aim for:
   - Performance: 90+
   - Accessibility: 90+
   - Best Practices: 90+
   - SEO: 90+

### 3. Security Checklist

- [ ] HTTPS enabled on all services
- [ ] Environment variables not exposed
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] CSRF protection active

### 4. Monitor Logs

**Railway:**
- Go to your service
- Click **"Logs"** tab
- Monitor for errors

**Netlify:**
- Go to **"Functions"** → **"Logs"**
- Check for build errors

---

## 🐛 STEP 6: Troubleshooting

### Common Issues

#### 1. CORS Error
**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Verify `FRONTEND_URL` in backend matches your actual frontend URL
- Check backend CORS configuration in `backend/config/cors.js`
- Ensure no trailing slashes in URLs

#### 2. Database Connection Failed
**Error:** `ECONNREFUSED` or `ER_ACCESS_DENIED_ERROR`

**Solution:**
- Verify database credentials in Railway
- Check if database service is running
- Ensure backend can reach database (same region preferred)
- Check firewall rules

#### 3. 404 on Page Refresh
**Error:** Page not found when refreshing React routes

**Solution:**
- Ensure `_redirects` file exists in `frontend/public/`
- Content should be: `/*    /index.html   200`
- Redeploy frontend

#### 4. Environment Variables Not Working
**Error:** `undefined` when accessing `process.env` or `import.meta.env`

**Solution:**
- Frontend: Use `VITE_` prefix for all variables
- Backend: Restart service after adding variables
- Clear build cache and redeploy

#### 5. Images Not Loading
**Error:** 404 for product images

**Solution:**
- Check if uploads folder is persistent (Railway volumes)
- Or migrate to cloud storage (Cloudinary, AWS S3)
- Update image URLs in database

#### 6. Rate Limiting Too Strict
**Error:** 429 Too Many Requests

**Solution:**
- Adjust rate limits in `backend/middleware/rateLimiter.js`
- Increase limits for production
- Consider using Redis for distributed rate limiting

---

## 📊 Monitoring & Maintenance

### 1. Set Up Monitoring

**Uptime Monitoring:**
- [UptimeRobot](https://uptimerobot.com) - Free
- [Pingdom](https://pingdom.com) - Paid
- Monitor: `/health` endpoint

**Error Tracking:**
- [Sentry](https://sentry.io) - Free tier available
- Add to both frontend and backend

**Analytics:**
- Google Analytics
- Plausible Analytics (privacy-friendly)

### 2. Regular Maintenance

**Weekly:**
- Check error logs
- Monitor database size
- Review user feedback

**Monthly:**
- Update dependencies
- Review security patches
- Backup database manually
- Check disk space usage

**Quarterly:**
- Performance audit
- Security audit
- Cost optimization review

---

## 💰 Cost Estimation

### Free Tier (Hobby/Portfolio)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Railway | $5 credit/month | 500 hours, 512MB RAM |
| Netlify | 100GB bandwidth | 300 build minutes |
| PlanetScale | 5GB storage | 1 billion row reads |
| **Total** | **$0/month** | Good for demos |

### Paid Tier (Production)

| Service | Cost | Features |
|---------|------|----------|
| Railway | $20/month | Unlimited hours, 8GB RAM |
| Netlify | $19/month | 1TB bandwidth |
| PlanetScale | $29/month | 25GB storage |
| Cloudinary | $0-89/month | Image hosting |
| **Total** | **~$70-150/month** | Production ready |

---

## 🎉 Deployment Complete!

Your Fashion Hub application is now live!

### Your URLs:
- **Frontend**: https://fashion-hub.netlify.app
- **Backend**: https://fashion-hub-backend.up.railway.app
- **API Docs**: https://fashion-hub-backend.up.railway.app/api-docs

### Next Steps:
1. Share your project link
2. Add to your portfolio
3. Monitor performance
4. Gather user feedback
5. Iterate and improve

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Netlify Documentation](https://docs.netlify.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#production-grade-react-frameworks)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review service logs (Railway/Netlify)
3. Check browser console for errors
4. Verify all environment variables
5. Test locally first before deploying

---

**Good luck with your deployment! 🚀**
