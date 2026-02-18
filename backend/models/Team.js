const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    // Reference to the User who created the team
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // The name given to the team during Step 1
    teamName: { 
        type: String, 
        required: true,
        trim: true
    },
    // Array of strings representing selected algorithms (Tiers 1-4)
    selectedBids: { 
        type: [String], 
        default: [] 
    }, 
    // Array of strings representing the 5 selected datasets
    selectedData: { 
        type: [String], 
        default: [] 
    },
    // Remaining credit points entered by the user
    credits: { 
        type: Number, 
        default: 0 
    },
    // The final performance score calculated on the frontend
    score: { 
        type: Number, 
        default: 0 
    },
    // Timestamp for when the simulation was saved
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Create an index for faster queries when fetching a user's team history
TeamSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Team', TeamSchema);