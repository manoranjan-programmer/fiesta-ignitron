require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 

// Import Models
const User = require('./models/User');
const Team = require('./models/Team'); 

require('./config/passport')(passport);

const app = express();

// 1. CORS Configuration
app.use(cors({ 
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); 

// 2. Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'algorithmic_titans_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to false for localhost
        sameSite: "lax", 
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

/* --- NEW: AUTH CHECK ROUTE --- */
// React calls this on Dashboard load to see if Google login was successful
app.get('/api/auth/check', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ success: true, user: req.user });
    } else {
        res.status(401).json({ success: false });
    }
});

/* --- MANUAL SIGNUP --- */
app.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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

/* --- MANUAL LOGIN --- */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !user.password) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        req.login(user, (err) => {
            if (err) return res.status(500).json({ message: "Login failed" });
            return res.json({ success: true, user: { id: user._id, name: user.displayName } });
        });
    } catch (err) {
        res.status(500).json({ message: "Login error" });
    }
});

/* --- TEAM SUBMISSION --- */
app.post('/api/submit-team', async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { teamName, bids, selectedData, credits, score } = req.body;
        const newTeam = new Team({
            user: req.user.id,
            teamName: teamName || "Unnamed Team",
            selectedBids: bids,
            selectedData: selectedData,
            credits: parseInt(credits) || 0,
            score: parseFloat(score) || 0
        });

        await newTeam.save();
        res.json({ success: true, message: "Simulation saved!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

/* --- LOGOUT --- */
app.get('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: "Logout error" });
        res.redirect(`${process.env.FRONTEND_URL}/login`);
    });
});

/* --- GOOGLE AUTH --- */
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    (req, res) => {
        // SUCCESS: Redirect to dashboard
        // The cookie 'connect.sid' is now set in the browser
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));