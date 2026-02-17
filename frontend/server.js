const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes Placeholder
// You can add custom backend logic here if needed, 
// extending beyond what Supabase provides directly.
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Serve Static Assets (Production Build)
// In development, we use 'npm run dev' (Vite). 
// In production, we run this server.
app.use(express.static(path.join(__dirname, 'dist')));

// Handle Client-Side Routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to view the app`);
});
