const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Changed: googleId is no longer 'required: true' to allow manual signups
    googleId: { 
        type: String, 
        default: null, 
        sparse: true // 'sparse' allows multiple nulls while keeping the index unique
    }, 
    displayName: { 
        type: String,
        default: ""
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    // New: Added password field for manual login
    password: { 
        type: String, 
        default: null 
    },
    image: { 
        type: String,
        default: "" 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    teamName: { type: String, default: "" },
    selectedBids: { type: [String], default: [] }
});

module.exports = mongoose.model('User', UserSchema);