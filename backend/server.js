require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const {MongoStore} = require('connect-mongo'); // Added for session persistence
const cors = require('cors');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Team = require('./models/Team');

require('./config/passport')(passport);

const app = express();

/* =====================================
   1. TRUST PROXY (CRITICAL FOR RENDER/HEROKU)
===================================== */
// This allows secure cookies to be set via proxy servers
app.set('trust proxy', 1);

/* =====================================
   2. DYNAMIC CORS CONFIG
===================================== */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL // Example: https://your-site.vercel.app
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    const isAllowed = allowedOrigins.some(allowed => 
      origin.startsWith(allowed)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`CORS Blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());

/* =====================================
   3. SESSION CONFIG (STABLE PROD)
===================================== */
const isProduction = process.env.NODE_ENV === "production";

app.use(session({
  name: "connect.sid",
  secret: process.env.SESSION_SECRET || "algorithmic_titans_secret",
  resave: false,
  saveUninitialized: false,
  // This stores sessions in MongoDB so users stay logged in after server refreshes
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: isProduction, // true requires HTTPS
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax", // "none" required for cross-domain
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/* =====================================
   4. DATABASE
===================================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Mongo Connection Error:", err));

/* =====================================
   5. ROUTES
===================================== */

// AUTH CHECK
app.get('/api/auth/check', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      success: true,
      user: { id: req.user._id, name: req.user.displayName, email: req.user.email }
    });
  }
  res.status(401).json({ success: false, message: "Unauthorized" });
});

// SIGNUP
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

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !user.password) 
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Login failed" });
      res.json({
        success: true,
        user: { id: user._id, name: user.displayName }
      });
    });
  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

// TEAM SUBMIT
app.post('/api/submit-team', async (req, res) => {
  try {
    if (!req.isAuthenticated())
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { teamName, bids, selectedData, credits, score } = req.body;
    const newTeam = new Team({
      user: req.user.id,
      teamName,
      selectedBids: bids,
      selectedData,
      credits,
      score
    });

    await newTeam.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// LOGOUT
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.session.destroy(() => {
      res.clearCookie('connect.sid', {
        path: '/',
        domain: isProduction ? '.yourdomain.com' : 'localhost', // Optional: adjust if needed
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
      });
      const redirectUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${redirectUrl}/login`);
    });
  });
});

// GOOGLE AUTH
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard`);
  }
);

/* =====================================
   SERVER START
===================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Mode: ${isProduction ? 'Production' : 'Development'}`);
});