require('dotenv').config();
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');

const prisma = require('./db');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes'); 

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server,{
    cors : {
        origin:"http://localhost:5173",
        methods:["GET", "POST", "PATCH", "DELETE"]
    }
});

app.use((req,res,next)=>{
  req.io = io;
  next();
});

io.on("connection", (socket)=>{
  console.log(`User Connected: ${socket.id}`);

  socket.on('disconnect', ()=>{
    console.log(`User Disconnected: ${socket.id}`);
  });
})

// Routes
// Authentication routes (register, login, etc.)
app.use('/api/auth', authRoutes);

// Ticket routes (create, view tickets)
app.use('/api/tickets', ticketRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1. Force Prisma to connect immediately
    await prisma.$connect();
    console.log('✅ Successfully connected to the PostgreSQL database');
    
    // 2. Start the Express server only if the DB connection was successful
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database:');
    console.error(error);
    process.exit(1); // Kill the server if it can't connect
  }
}

startServer();