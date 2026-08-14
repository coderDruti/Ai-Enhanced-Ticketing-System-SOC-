require('dotenv').config();
const express = require('express');

const prisma = require('./db');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);



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