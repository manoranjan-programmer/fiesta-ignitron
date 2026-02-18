const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.GOOGLE_CALLBACK_URL}/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // 1. Always search by googleId first (most reliable for OAuth)
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                // User exists, return them
                return done(null, user);
            }

            // 2. Secondary check: Does a user with this email already exist?
            const email = profile.emails[0].value;
            user = await User.findOne({ email: email });

            if (user) {
                // If user exists by email, link the googleId to this account
                user.googleId = profile.id;
                await user.save();
                return done(null, user);
            }

            // 3. Only if NO user is found by ID or Email, create a new one
            const newUser = await User.create({
                googleId: profile.id,
                displayName: profile.displayName,
                email: email,
                image: profile.photos[0].value
            });

            return done(null, newUser);
        } catch (err) {
            console.error("Passport Error:", err);
            return done(err, null);
        }
    }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};