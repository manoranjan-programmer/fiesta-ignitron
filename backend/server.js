require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Team = require("./models/Team");

require("./config/passport")(passport);

const app = express();
app.set("trust proxy", 1);
app.use(express.json());

/* =====================================
   CORS
===================================== */

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) return callback(null, true);

    console.log("Blocked by CORS:", origin);
    return callback(null, false);
  },
  credentials: true
}));

/* =====================================
   SESSION
===================================== */

const isProduction = process.env.NODE_ENV === "production";

app.use(session({
  name: "connect.sid",
  secret: process.env.SESSION_SECRET || "secret123",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60
  }),
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/* =====================================
   DATABASE
===================================== */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

/* =====================================
   AUTH CHECK
===================================== */

app.get("/api/auth/check", (req, res) => {
  if (req.isAuthenticated())
    return res.json({ success: true, user: req.user });

  res.status(401).json({ success: false });
});

/* =====================================
   LOGIN (FIXED SESSION SAVE)
===================================== */

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    req.login(user, err => {
      if (err) return res.status(500).json({ message: "Login failed" });

      req.session.save(() => {
        res.status(200).json({
          success: true,
          user: {
            id: user._id,
            name: user.displayName,
            email: user.email
          }
        });
      });
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================
   SIGNUP (AUTO LOGIN AFTER REGISTER)
===================================== */

app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "User exists" });

    const hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      displayName: fullName,
      email,
      password: hash
    });

    req.login(newUser, err => {
      if (err) return res.status(500).json({ message: "Signup login failed" });

      req.session.save(() => {
        res.status(201).json({
          success: true,
          user: {
            id: newUser._id,
            name: newUser.displayName,
            email: newUser.email
          }
        });
      });
    });

  } catch {
    res.status(500).json({ message: "Signup error" });
  }
});

/* =====================================
   PROTECTED ROUTE
===================================== */

app.post("/api/submit-team", async (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ success: false });

  await Team.create({ ...req.body, user: req.user.id });
  res.json({ success: true });
});

/* =====================================
   LOGOUT (REDIRECT FIXED)
===================================== */

app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
      });

      // redirect to login page after logout
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    });
  });
});

/* GOOGLE AUTH (UNCHANGED) */
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

/* =====================================
   START SERVER
===================================== */

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on ${PORT}`)
);