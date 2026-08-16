const express = require('express');
const { createTicket, getAllTickets } = require('../controllers/ticketController');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new ticket
// POST /api/tickets
// verifyToken to ensure only logged-in users can create a ticket
router.post('/', verifyToken, createTicket);

// Get all tickets for the logged-in user
// GET /api/tickets
// verifyToken to ensure only logged-in users can view tickets
router.get('/', verifyToken, getAllTickets);

// Export this router to be used in the main app
module.exports = router;