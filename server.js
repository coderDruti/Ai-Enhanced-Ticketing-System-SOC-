require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('./prisma/generated/prisma/client.js');
const {PrismaPg} = require('@prisma/adapter-pg');

const app = express();

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

app.use(express.json());

// A test route to fetch users from PostgreSQL
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
  }
});


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