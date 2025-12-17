// --- GRAZEON BACKEND SERVER ---
// Install dependencies: npm install express cors body-parser dotenv

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- MOCK DATABASE ---
// In production, replace this with MongoDB
let users = {
    // "0xWalletAddress": { balance: { BTC: 0, ETH: 0 }, spinsLeft: 3 }
};

let withdrawals = []; // Admin will see these

// --- ROUTES ---

// 1. SPIN THE WHEEL (Secure Logic)
app.post('/api/spin', (req, res) => {
    const { walletAddress, currency } = req.body;
    
    if (!users[walletAddress]) {
        users[walletAddress] = { balance: { BTC: 0, ETH: 0, SOL: 0 }, spinsLeft: 3 };
    }

    // Server determines the win, not the client
    const random = Math.random();
    let reward = 0;
    
    // 60% chance to win small, 10% big, 30% nothing
    if (random < 0.6) reward = 0.00001; 
    else if (random < 0.7) reward = 0.0005; // Big win
    else reward = 0;

    // Update DB
    users[walletAddress].balance[currency] += reward;

    res.json({
        success: true,
        reward: reward,
        newBalance: users[walletAddress].balance[currency]
    });
});

// 2. ADMIN LOGIN (Simple Hardcoded for Personal Use)
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    // SET THIS PASSWORD IN YOUR HOSTING ENVIRONMENT VARIABLES
    const ADMIN_PASS = process.env.ADMIN_PASS || "mySecretAdminPass123";

    if (password === ADMIN_PASS) {
        res.json({ success: true, token: "admin_token_xyz" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Password" });
    }
});

// 3. ADMIN: GET ALL WITHDRAWALS
app.get('/api/admin/withdrawals', (req, res) => {
    const { token } = req.query; // simplified auth
    if (token !== "admin_token_xyz") return res.status(403).send("Unauthorized");
    
    res.json(withdrawals);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Grazeon Server running on port ${PORT}`);
});
