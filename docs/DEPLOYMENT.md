# Deployment Guide - Focus Frontier

Complete guide for deploying the Focus Frontier platform to production.

## 📋 Pre-Deployment Checklist

- [ ] All games are tested and working
- [ ] Environment variables are configured
- [ ] Database is set up (MongoDB Atlas recommended)
- [ ] API endpoints are tested
- [ ] CORS settings are configured for production domain
- [ ] JWT secret is strong and secure
- [ ] Analytics are tracking correctly

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select region closest to your users
   - Name your cluster (e.g., "focus-frontier")

3. **Configure Access**
   - Database Access: Create a user with password
   - Network Access: Add IP `0.0.0.0/0` (allow from anywhere)
   - Or add your server's specific IP

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `focus_frontier`

## 🖥️ Backend Deployment (Railway/Render/Heroku)

### Option A: Railway.app (Recommended)

1. **Create Account** at [railway.app](https://railway.app)

2. **Create New Project**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Navigate to server directory
   cd server
   
   # Initialize
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set PORT=4000
   railway variables set MONGO_URI="your-mongodb-atlas-connection-string"
   railway variables set JWT_SECRET="your-super-secure-random-string"
   railway variables set CORS_ORIGIN="https://your-frontend-domain.com"
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get URL**
   - Railway will provide a URL like `https://your-app.railway.app`
   - Save this for frontend configuration

### Option B: Render.com

1. **Create Account** at [render.com](https://render.com)

2. **New Web Service**
   - Connect your GitHub repository
   - Select `server` directory as root
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables**
   Add in dashboard:
   ```
   PORT=4000
   MONGO_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key
   CORS_ORIGIN=https://your-frontend.com
   ```

4. **Deploy**
   - Render auto-deploys on git push
   - Get your API URL from dashboard

## 🌐 Frontend Deployment

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to Project Root**
   ```bash
   cd capstone
   ```

3. **Create vercel.json**
   ```json
   {
     "rewrites": [
       { "source": "/client/(.*)", "destination": "/client/$1" },
       { "source": "/", "destination": "/client/index.html" }
     ]
   }
   ```

4. **Deploy**
   ```bash
   vercel
   ```

5. **Update API URL**
   After first deploy, update client code:
   ```javascript
   // In client/assets/app.js, change:
   const API_BASE = 'https://your-backend.railway.app/api';
   ```

### Option B: Netlify

1. **Create Account** at [netlify.com](https://netlify.com)

2. **Drag & Drop Deploy**
   - Zip the `client` folder
   - Drag to Netlify dashboard
   - Or connect GitHub repo

3. **Configure Redirects**
   Create `client/_redirects`:
   ```
   /*    /index.html   200
   ```

4. **Update API URL** in `client/assets/app.js`

## 🔗 Connect Frontend to Backend

After deploying both:

1. **Update CORS on Backend**
   ```env
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

2. **Update API URL on Frontend**
   In `client/assets/app.js`:
   ```javascript
   const API_BASE = 'https://your-backend.railway.app/api';
   ```

3. **Redeploy Both**
   ```bash
   # Backend (Railway)
   cd server
   railway up
   
   # Frontend (Vercel)
   cd ..
   vercel --prod
   ```

## 🧪 Post-Deployment Testing

### Test Checklist
- [ ] Visit your frontend URL
- [ ] Check browser console for errors
- [ ] Register a new account
- [ ] Login with credentials
- [ ] Play each game and verify:
  - [ ] Memory Matrix
  - [ ] Reflex Runner
  - [ ] Color Cascade
  - [ ] Pattern Path
  - [ ] Shape Sorter
  - [ ] Focus Sphere
- [ ] Check analytics page loads
- [ ] Verify session data saves
- [ ] Test on mobile device
- [ ] Test logout and re-login

### API Health Check
```bash
curl https://your-backend.railway.app/api/health
# Should return: {"ok":true,"ts":...}
```

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong (32+ random characters)
- [ ] CORS_ORIGIN is set to specific domain (not *)
- [ ] MongoDB user has minimal required permissions
- [ ] Passwords are hashed (bcrypt - already implemented)
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled on both frontend and backend

## 📊 Monitoring

### Backend Logs
```bash
# Railway
railway logs

# Render - view in dashboard
```

### Error Tracking
Consider adding:
- Sentry for error monitoring
- LogRocket for session replay
- Google Analytics for usage tracking

## 🚀 Performance Optimization

### Frontend
1. **Minify Assets**
   ```bash
   # Install terser for JS minification
   npm install -g terser
   
   terser client/assets/app.js -o client/assets/app.min.js
   terser client/assets/game-utils.js -o client/assets/game-utils.min.js
   ```

2. **Enable Gzip** (automatic on Vercel/Netlify)

3. **Add Caching Headers**

### Backend
1. **Add Rate Limiting**
   ```bash
   cd server
   npm install express-rate-limit
   ```

2. **Enable Compression**
   ```bash
   npm install compression
   ```

## 🔄 CI/CD Setup (Optional)

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: vercel --prod
```

## 🆘 Troubleshooting

### Common Issues

**"CORS Error"**
- Check CORS_ORIGIN includes your frontend domain
- Verify protocol (http vs https)
- Redeploy backend after changes

**"Cannot connect to database"**
- Verify MONGO_URI is correct
- Check MongoDB Atlas network access settings
- Ensure database user has permissions

**"401 Unauthorized"**
- Clear browser localStorage
- Re-login to get new token
- Check JWT_SECRET matches between deployments

**Games not loading**
- Check browser console for errors
- Verify all script paths are correct
- Ensure API_BASE points to deployed backend

## 📝 Custom Domain (Optional)

### Vercel
1. Go to project settings
2. Add custom domain
3. Update DNS records as instructed
4. Update CORS_ORIGIN on backend

### Railway
1. Go to project settings
2. Add custom domain
3. Configure DNS CNAME
4. Update API_BASE on frontend

## ✅ Launch Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database populated with game definitions
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] All games tested in production
- [ ] Analytics working
- [ ] Mobile responsive
- [ ] Error handling tested
- [ ] Documentation updated
- [ ] Monitoring set up

**Congratulations! Your Focus Frontier platform is now live! 🎉**
