// server.js (Updated with Socket.io Structure)

require('dotenv').config();

const express = require('express');
const http = require('http'); // NEW: For the underlying server
const { Server } = require('socket.io'); // NEW: For real-time communication

// Existing imports
const requireAuth = require('./middleware/clerkAuth');
const queries = require('./db/queries');
const { webhookParser, handleClerkWebhook } = require('./webhookHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Create the HTTP server using the Express app
const server = http.createServer(app);

// 2. Initialize Socket.io and attach it to the HTTP server
const io = new Server(server, {
    // Crucial for allowing your React front-end to connect
    cors: {
        origin: "http://localhost:5173", // **CHANGE THIS** to your front-end URL
        methods: ["GET", "POST"]
    }
});

// --- Existing Setup ---

// Test the database connection on startup
queries.pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client from pool', err.stack);
    }
    console.log('Successfully connected to the PostgreSQL database!');
    release();
});

// *******************************************************************
// 🛑 CRITICAL FIX: The JSON parser was moved down to prevent it from consuming 
// the raw webhook body before it hits the custom webhookParser.
// The webhook route must be defined first.
// *******************************************************************

// --- API ROUTES ---

// 1. Webhook Endpoint (Requires raw body parser - MUST be first)
app.post('/api/clerk-webhook', webhookParser, handleClerkWebhook);

// 2. Middleware to parse JSON bodies for regular API routes (MUST be after the webhook)
app.use(express.json()); 


// --- SOCKET.IO REAL-TIME LOGIC ---
const socketTeamMap = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_team', (teamId) => {
        if (socketTeamMap[socket.id]) {
            socket.leave(socketTeamMap[socket.id]);
        }
        socket.join(teamId);
        socketTeamMap[socket.id] = teamId;
        console.log(`User ${socket.id} joined room: ${teamId}`);
        socket.to(teamId).emit('team_message', `A new user joined the team chat!`);
    });

    socket.on('send_message', (data) => {
        const teamId = socketTeamMap[socket.id];
        if (!teamId) return console.error('Message rejected: User not in a team room.');

        io.to(teamId).emit('receive_message', {
            content: data.content,
            sender: data.username,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete socketTeamMap[socket.id];
    });
});
// --- END SOCKET.IO LOGIC ---


// Protected API Endpoint (Requires requireAuth, JSON parser)
app.get('/api/customers', requireAuth, async (req, res) => {
    // ... (logic from Step 4 remains here) ...
    try {
        const teamId = req.orgId;
        const customers = await queries.getCustomersByTeamId(teamId);
        res.json({
            message: `Customers for Team ID: ${teamId}`,
            data: customers,
            count: customers.length,
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch team data.' });
    }
});


// 3. The HTTP server starts listening, not the express app
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
