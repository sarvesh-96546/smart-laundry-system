const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { Server } = require('socket.io');
const { auth } = require('./auth');
const userRoutes = require('./routes/userRoutes');
const { toNodeHandler } = require('better-auth/node');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5002",
        "http://localhost:3000",
        "https://pristine-flow.vercel.app",
        "https://pristinr-flow-api.onrender.com"
    ],
    credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ status: "Pristine Flow API Node Live", timestamp: new Date().toISOString() });
});

app.all("/api/auth/*path", toNodeHandler(auth));

app.use((req, req_res, next) => {
    next();
});

app.set('io', io);

io.on('connection', (socket) => {
    socket.emit('connected', { message: 'Welcome To Pristine Flow Auth Server' });
    
    socket.on('disconnect', () => {
    });
});

app.use('/api', userRoutes);

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
});
