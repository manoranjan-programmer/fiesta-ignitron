# Deployment Guide - Fiesta Ignitron

## Architecture Overview

- **Frontend**: React + Vite (Deployed on Vercel)
- **Backend**: Node.js + Express (Deployed on Railway/Render)
- **Database**: MongoDB (MongoDB Atlas Cloud)
- **Authentication**: Passport.js + Google OAuth

---

## Prerequisites

1. **Vercel Account**: https://vercel.com (for frontend)
2. **Railway/Render Account**: https://railway.app or https://render.com (for backend)
3. **MongoDB Atlas Account**: https://www.mongodb.com/cloud/atlas (for database)
4. **Google Cloud Project**: https://console.cloud.google.com (for OAuth)

---

## Step 1: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user:
   - Username: `admin`
   - Password: Generate a strong password
4. Get Connection String:
   - Click "Connect" → "Drivers" → Copy the connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with a database name (e.g., `fiesta`)
   - Example: `mongodb+srv://admin:password@cluster.mongodb.net/fiesta?retryWrites=true&w=majority`
5. Whitelist your deployment IPs:
   - For Railway/Render: Add `0.0.0.0/0` (allows all IPs)
   - For local: Add your IP or use `0.0.0.0/0`

---

## Step 2: Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create a new project: `Fiesta Ignitron`
3. Enable Google+ API:
   - Search "Google+ API" → Click "Enable"
4. Create OAuth 2.0 Credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth Client ID"
   - Application type: "Web application"
   - Add Authorized redirect URIs:
     ```
     http://localhost:5000/auth/google/callback          (development)
     https://your-backend.railway.app/auth/google/callback   (production)
     ```
   - Add Authorized JavaScript origins:
     ```
     http://localhost:5173        (development)
     http://localhost:5000        (development)
     https://your-frontend.vercel.app   (production)
     https://your-backend.railway.app   (production)
     ```
5. Copy Client ID and Client Secret (save them, you'll need them)

---

## Step 3: Deploy Backend (Railway.app example)

### Using Railway

1. **Connect Repository**:
   - Go to https://railway.app/dashboard
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repo

2. **Deploy Backend Service**:
   - Create a new service manually
   - Select "Dockerfile"
   - Set root directory: `backend`

3. **Configure Environment Variables**:
   In Railway dashboard, go to Variables and add:
   ```
   NODE_ENV=production
   PORT=8000
   MONGO_URI=mongodb+srv://admin:password@cluster.mongodb.net/fiesta?retryWrites=true&w=majority
   SESSION_SECRET=generate-a-long-random-string-here-at-least-32-chars
   FRONTEND_URL=https://your-frontend.vercel.app
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Get Backend URL**:
   - After deployment, Railway will show you the URL (e.g., `https://fiesta-api-prod.railway.app`)
   - Copy this, you'll need it for the frontend

---

## Step 4: Deploy Frontend (Vercel)

### Using Vercel

1. **Connect Repository**:
   - Go to https://vercel.com/new
   - Select your GitHub repo
   - Select project root: `/frontend`

2. **Configure Environment Variables**:
   In Vercel dashboard:
   - Go to "Settings" → "Environment Variables"
   - Add:
     ```
     VITE_BACKEND_URL=https://your-backend.railway.app
     ```

3. **Deploy**:
   - Vercel auto-deploys on push to main branch
   - URL will be like: `https://your-app.vercel.app`

4. **Update Google OAuth**:
   - Go back to Google Cloud Console
   - Update "Authorized JavaScript origins" with your Vercel URL

5. **Update Backend**:
   - Go back to Railway
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Trigger a redeploy

---

## Step 5: Update Redirect URLs

### Backend Google OAuth Callback

Update in Google Cloud Console:
```
https://your-backend.railway.app/auth/google/callback
```

### Frontend URL

Update in `.env.production`:
```
VITE_BACKEND_URL=https://your-backend.railway.app
```

---

## Local Development (Docker Compose)

```bash
# 1. Create local .env file
cp backend/.env.example backend/.env

# 2. Edit backend/.env with your local values or:
# MONGO_URI=mongodb://root:password123@mongodb:27017/fiesta?authSource=admin
# (uses docker-compose MongoDB)

# 3. Start all services
docker-compose up -d

# 4. Frontend runs separately
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173

# 5. Backend runs in Docker on http://localhost:5000

# 6. Stop
docker-compose down
```

---

## Local Development (Traditional)

```bash
# Backend
cd backend
npm install
# Create .env file with your values
node server.js

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Troubleshooting

### 1. **CORS Error**
- Check `FRONTEND_URL` in backend matches your frontend URL exactly
- Verify cookie settings in server.js match your domain

### 2. **Login Not Working**
- Verify `/api/auth/check` returns 200 with `{"success": true}`
- Check backend logs for session errors
- Ensure MongoDB is running

### 3. **Google OAuth Fails**
- Verify redirect URIs in Google Cloud Console
- Check Client ID and Secret are correct
- Ensure `FRONTEND_URL` and `GOOGLE_CLIENT_ID` match Google Console settings

### 4. **Database Connection Failed**
- Test MongoDB URI: Paste in MongoDB Compass or Studio 3T
- Verify IP Whitelist in MongoDB Atlas (use `0.0.0.0/0` for testing)
- Check username/password are URL-encoded if special characters

### 5. **Session Not Persisting**
- Verify `credentials: "include"` in fetch requests (already done)
- Check cookie `secure: true/false` matches HTTP/HTTPS
- Ensure `sameSite: "none"` for cross-origin in production

---

## Environment Variables Summary

### Backend (.env)
```
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb+srv://admin:password@cluster.mongodb.net/fiesta?retryWrites=true&w=majority
SESSION_SECRET=generate-a-long-random-string
FRONTEND_URL=https://your-frontend.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend (Vercel Environment Variables)
```
VITE_BACKEND_URL=https://your-backend.railway.app
```

---

## Quick Deploy Checklist

- [ ] MongoDB Atlas cluster created and connection string ready
- [ ] Google OAuth credentials created
- [ ] Backend deployed to Railway/Render
- [ ] Backend environment variables set
- [ ] Frontend deployed to Vercel
- [ ] `VITE_BACKEND_URL` environment variable set in Vercel
- [ ] Update Google OAuth redirect URIs
- [ ] Test login flow
- [ ] Test Google OAuth login
- [ ] Check Session persistence

---

## Production Security Checklist

- [ ] `SESSION_SECRET` is a random 32+ character string
- [ ] `NODE_ENV=production`
- [ ] MongoDB password is strong
- [ ] Google OAuth Secret is kept private (never commit to repo)
- [ ] CORS settings are restrictive (only allow your frontend domain)
- [ ] Cookies have `secure: true` and `sameSite: "none"` for HTTPS
- [ ] Remove any `console.log` statements with sensitive data
- [ ] Use HTTPS only for production URLs

---

## Useful Commands

```bash
# Test backend locally
curl -X GET http://localhost:5000/api/auth/check -H "Cookie: connect.sid=xxx" -H "Content-Type: application/json"

# Build frontend
npm run build

# Preview frontend build
npm run preview

# Check MongoDB connection
mongosh "mongodb+srv://admin:password@cluster.mongodb.net/fiesta?authSource=admin"
```

---

## Support & Resources

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Express.js: https://expressjs.com
- React Router: https://reactrouter.com
- Passport.js: http://www.passportjs.org

---

**Last Updated**: February 2026
