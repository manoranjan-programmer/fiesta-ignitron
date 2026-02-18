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

/* =====================================
   BODY PARSER
===================================== */
app.use(express.json());

/* =====================================
   SAFE CORS CONFIG (FIXES YOUR ERROR)
===================================== */

const allowedOrigins = [
  "http://localhost:5173",
  "https://fiesta-ignitron.vercel.app",
  process.env.FRONTEND_URL
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server / postman / no-origin requests
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.includes(".vercel.app")
    ) {
      return callback(null, true);
    }

    // DO NOT THROW ERROR → causes 500
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // VERY IMPORTANT (preflight fix)

/* =====================================
   SESSION CONFIG (CROSS DOMAIN SAFE)
===================================== */
const isProduction = process.env.NODE_ENV === "production";

app.use(session({
  name: "connect.sid",
  secret: process.env.SESSION_SECRET || "algorithmic_titans_secret",
  resave: false,
  saveUninitialized: false,
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
  .catch(err => console.error("❌ Mongo Error:", err));

/* =====================================
   AUTH ROUTES
===================================== */

app.get("/api/auth/check", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ success: true, user: req.user });
  }
  res.status(401).json({ success: false });
});

app.post("/api/login", async (req, res) => {
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

  } catch {
    res.status(500).json({ message: "Server error during login" });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      displayName: fullName,
      email,
      password: hashedPassword
    });

    res.status(201).json({ success: true });

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

  try {
    await Team.create({ ...req.body, user: req.user.id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* =====================================
   LOGOUT
===================================== */
app.get("/auth/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        path: "/",
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
      });

      res.redirect(`${process.env.FRONTEND_URL}/login`);
    });
  });
});

/* =====================================
   START SERVER
===================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on ${PORT}`)
);