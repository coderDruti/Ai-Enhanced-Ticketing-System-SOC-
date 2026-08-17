const express = require('express');
const { createTicket, getAllTickets, updateTicket, deleteTicket } = require('../controllers/ticketController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new ticket
// POST /api/tickets
// verifyToken to ensure only logged-in users can create a ticket
router.post('/', verifyToken, createTicket);

// Get all tickets for the logged-in user
// GET /api/tickets
// verifyToken to ensure only logged-in users can view tickets
router.get('/', verifyToken, getAllTickets);

//Update a ticket (Using Patch for partial data updates)
// PATCH /api/tickets/:id
router.patch('/:id', verifyToken, updateTicket);

//Delete a ticket 
// DELETE /api/tickets/:id
router.delete('/:id', verifyToken, requireRole('ADMIN'), deleteTicket);

// Export this router to be used in the main app
module.exports = router;