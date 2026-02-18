# Fiesta Ignitron - Full Stack App

Complete MERN stack application with Google OAuth authentication, Passport.js sessions, and MongoDB persistence.

## 🎯 Features

✅ User authentication (Email/Password + Google OAuth)  
✅ Session management with persistent cookies  
✅ Protected routes and API endpoints  
✅ Responsive UI with React  
✅ RESTful API with Express  
✅ MongoDB database integration  
✅ Docker support for development  
✅ Production-ready deployment configs

---

## 📁 Project Structure

```
fiesta-ignitron/
├── backend/                 # Node.js API Server
│   ├── models/             # MongoDB models (User, Team)
│   ├── config/             # Passport configuration
│   ├── server.js           # Main Express server
│   ├── package.json        # Backend dependencies
│   ├── Dockerfile          # Container config
│   └── .env.example        # Environment template
├── frontend/               # React + Vite App
│   ├── src/
│   │   ├── pages/         # Login, Signup, Dashboard
│   │   ├── App.jsx        # Main router
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Frontend dependencies
│   ├── vercel.json        # Vercel deployment
│   └── .env.example       # Environment template
├── docker-compose.yml     # Local dev environment
├── DEPLOYMENT.md          # Full deployment guide
└── setup.sh               # Quick setup script
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and setup
git clone <your-repo>
cd fiesta-ignitron

# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your values
# - Add MongoDB URI (create free cluster at mongodb.com/cloud/atlas)
# - Add Google OAuth credentials (console.cloud.google.com)

# Start all services
docker-compose up -d

# Install frontend deps and run
cd frontend
npm install
npm run dev
```

Then:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MongoDB: http://localhost:27017

### Option 2: Traditional Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and Google OAuth keys
npm start
# Runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🔐 Environment Setup

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
SESSION_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Getting credentials:**
1. MongoDB: https://www.mongodb.com/cloud/atlas (free tier available)
2. Google OAuth: https://console.cloud.google.com
   - Create new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Add redirect URIs:
     - `http://localhost:5000/auth/google/callback` (dev)
     - `https://your-backend.railway.app/auth/google/callback` (prod)

### Frontend (.env)

```env
VITE_BACKEND_URL=http://localhost:5000
```

For production, set in Vercel environment variables.

---

## 🔄 Authentication Flow

1. **Manual Login/Signup**
   - User enters credentials
   - Backend hashes password with bcryptjs
   - Passport.js creates session
   - Cookie stored in browser

2. **Google OAuth**
   - User clicks Google login
   - Redirected to Google consent screen
   - Redirected back with OAuth code
   - Backend validates and creates session
   - Cookie stored in browser

3. **Protected Routes**
   - Frontend checks `/api/auth/check` on load
   - If authenticated, shows dashboard
   - If not, redirects to login
   - Session persists across pages

---

## 📦 API Endpoints

### Authentication

```
GET    /api/auth/check          - Check if user is logged in
POST   /api/login               - Manual login
POST   /api/signup              - Create account
GET    /auth/google             - Google OAuth redirect
GET    /auth/google/callback    - Google OAuth callback
GET    /auth/logout             - Logout and clear session
```

### Protected Endpoints

```
POST   /api/submit-team         - Create team (requires auth)
```

---

## 🧪 Testing

```bash
# Check if backend is running
curl http://localhost:5000/api/auth/check

# Test login endpoint
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📱 Frontend Pages

- **Login** (`/login`) - Email/password or Google login
- **Signup** (`/signup`) - Register new account
- **Dashboard** (`/dashboard`) - Protected page for logged-in users

---

## 🚀 Deployment

### Automatic (Git Push)

1. **Frontend** → Push to main → Auto-deploys to Vercel
2. **Backend** → Push to main → Auto-deploys to Railway/Render

### Manual Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Setting up MongoDB Atlas
- Configuring Google OAuth  
- Deploying to Railway/Render
- Deploying to Vercel
- Environment variables
- Troubleshooting

---

## 🛠️ Additional Commands

```bash
# Build production frontend
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Rebuild Docker images
docker-compose build

# View logs
docker-compose logs -f

# Execute command in container
docker-compose exec backend npm test
```

---

## 🐛 Troubleshooting

### Login page not showing
- Check [App.jsx](frontend/src/App.jsx#L110) default route redirects to `/login`
- Clear browser cache and localStorage

### "Cannot POST /api/login"
- Ensure backend is running on correct PORT
- Check `VITE_BACKEND_URL` in frontend matches backend URL

### Google OAuth redirect fails
- Verify redirect URIs in Google Cloud Console
- Check `FRONTEND_URL` in backend .env
- Ensure Client ID/Secret are correct

### MongoDB connection error
- Test connection string in MongoDB Compass
- Check whitelist IPs in MongoDB Atlas (add `0.0.0.0/0` for testing)
- Verify username/password have no special characters (or URL-encode them)

### Session not persisting
- Check cookies in DevTools → Application → Cookies
- Verify `credentials: "include"` in fetch requests
- Ensure backend CORS includes your frontend domain

---

## 📚 Technologies

- **Frontend**: React 19, Vite, React Router v7, Axios
- **Backend**: Node.js, Express 5, Passport.js
- **Database**: MongoDB, Mongoose ODM
- **Auth**: Passport.js, bcryptjs
- **Session**: express-session with MongoDB store
- **Deployment**: Vercel (frontend), Railway/Render (backend)

---

## 📋 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Google OAuth credentials created  
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] Backend deployed to Railway/Render
- [ ] Frontend deployed to Vercel
- [ ] Test login/signup flow
- [ ] Test Google OAuth
- [ ] Check session persistence
- [ ] Monitor logs for errors

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Need Help?

- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production guide
- Review error logs in backend terminal
- Check browser DevTools console
- Test endpoints with curl/Postman

---

**Happy coding! 🎉**
