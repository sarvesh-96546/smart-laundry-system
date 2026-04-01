const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { auth } = require('./auth');
const userRoutes = require('./routes/userRoutes');
const { toNodeHandler } = require('better-auth/node');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));
app.use(express.json());

// Better Auth Middleware
app.all("/api/auth/*", toNodeHandler(auth));

// Request Logger
app.use((req, req_res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Attach io to app for use in controllers
app.set('io', io);

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.emit('connected', { message: 'Welcome to Pristine Flow Auth Server' });
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Routes
app.use('/api', userRoutes);

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
