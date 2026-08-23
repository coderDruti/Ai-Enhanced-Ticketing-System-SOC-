require('dotenv').config();
const cors = require('cors');
const express = require('express');

const prisma = require('./db');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes'); 

const app = express();
app.use(express.json());
app.use(cors());

// Routes
// Authentication routes (register, login, etc.)
app.use('/api/auth', authRoutes);

// Ticket routes (create, view tickets)
app.use('/api/tickets', ticketRoutes);

async function startServer() {
  try {
    // 1. Force Prisma to connect immediately
    await prisma.$connect();
    console.log('✅ Successfully connected to the PostgreSQL database');
    
    // 2. Start the Express server only if the DB connection was successful
    app.listen(3000, () => {
      console.log('🚀 Server is running on port 3000');
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database:');
    console.error(error);
    process.exit(1); // Kill the server if it can't connect
  }
}

startServer();