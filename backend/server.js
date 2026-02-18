require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const {MongoStore} = require('connect-mongo');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Team = require('./models/Team');

// Configure Passport strategies (Google, Local, etc.)
require('./config/passport')(passport);

const app = express();

/* =====================================
   1. PROXY & MIDDLEWARE SETUP
===================================== */
// Required for secure cookies to work on proxy-based platforms like Render or Vercel
app.set('trust proxy', 1);

app.use(express.json());

/* =====================================
   2. DYNAMIC CORS CONFIGURATION
===================================== */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL // Ensure this is https://your-app.vercel.app without a trailing slash
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Blocked for origin: ${origin}`);
      callback(new Error("CORS not allowed by Algorithmic Titans Server"));
    }
  },
  credentials: true, // Required to pass session cookies to the frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

/* =====================================
   3. PERSISTENT SESSION CONFIGURATION
===================================== */
const isProduction = process.env.NODE_ENV === "production";

app.use(session({
  name: "connect.sid",
  secret: process.env.SESSION_SECRET || "algorithmic_titans_secret",
  resave: false,
  saveUninitialized: false, // Prevents creating empty sessions
  // Stores sessions in MongoDB so logins survive server restarts
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60 // Session valid for 1 day
  }),
  cookie: {
    secure: isProduction, // Set to true only in production (requires HTTPS)
    httpOnly: true, // Prevents client-side JS from reading the cookie
    sameSite: isProduction ? "none" : "lax", // "none" is required for cross-domain auth
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/* =====================================
   4. DATABASE CONNECTION
===================================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Mongo Connection Error:", err));

/* =====================================
   5. AUTHENTICATION ROUTES
===================================== */

// Verify if the user is currently logged in
app.get('/api/auth/check', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ success: true, user: req.user });
  }
  res.status(401).json({ success: false });
});

// Standard Email/Password Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      res.json({ 
        success: true, 
        user: { id: user._id, name: user.displayName } 
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// User Registration Route
app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      displayName: fullName,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "User created" });
  } catch (err) {
    res.status(500).json({ message: "Signup error" });
  }
});

/* =====================================
   6. PROTECTED ROUTES
===================================== */

// Submit team data (Authenticated only)
app.post('/api/submit-team', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ success: false });
  try {
    const newTeam = new Team({ ...req.body, user: req.user.id });
    await newTeam.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =====================================
   7. EXTERNAL AUTH (GOOGLE) & LOGOUT
===================================== */

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login`);
    });
  });
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

/* =====================================
   8. SERVER START
===================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server on ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
});