require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Team = require('./models/Team');

require('./config/passport')(passport);

const app = express();

/* =====================================
   1. TRUST PROXY (REQUIRED FOR RENDER)
===================================== */
app.set('trust proxy', 1);

/* =====================================
   2. CORS CONFIG (VERY IMPORTANT)
===================================== */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error("CORS not allowed"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* =====================================
   3. SESSION CONFIG (PRODUCTION SAFE)
===================================== */
const isProduction = process.env.NODE_ENV === "production";

app.use(session({
  name: "connect.sid",
  secret: process.env.SESSION_SECRET || "algorithmic_titans_secret",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: isProduction,        // true on Render
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
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
  .catch(err => console.log("❌ MongoDB Error:", err));

/* =====================================
   5. AUTH CHECK
===================================== */
app.get('/api/auth/check', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ success: true, user: req.user });
  }
  res.status(401).json({ success: false });
});

/* =====================================
   6. SIGNUP
===================================== */
app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      displayName: fullName,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Signup error" });
  }
});

/* =====================================
   7. LOGIN
===================================== */
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    req.login(user, (err) => {
      if (err)
        return res.status(500).json({ message: "Login failed" });

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.displayName
        }
      });
    });

  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

/* =====================================
   8. TEAM SUBMISSION
===================================== */
app.post('/api/submit-team', async (req, res) => {
  try {
    if (!req.isAuthenticated())
      return res.status(401).json({ success: false });

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

/* =====================================
   9. LOGOUT
===================================== */
app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  });
});

/* =====================================
   10. GOOGLE AUTH
===================================== */
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login`
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

/* =====================================
   SERVER START
===================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
