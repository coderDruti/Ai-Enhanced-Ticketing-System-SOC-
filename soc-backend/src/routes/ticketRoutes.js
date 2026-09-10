const express = require('express');
const { createTicket, getAllTickets, updateTicket, deleteTicket, updateTicketStatus, getTicketLogs } = require('../controllers/ticketController');
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


//Update ticket status
// PATCH /api/tickets/:id/status
router.patch('/:id/status', verifyToken, updateTicketStatus);

//Update a ticket (Using Patch for partial data updates)
// PATCH /api/tickets/:id
router.patch('/:id', verifyToken, updateTicket);

//Delete a ticket 
// DELETE /api/tickets/:id
router.delete('/:id', verifyToken, requireRole('ADMIN'), deleteTicket);

// Get all logs for a specific ticket
// GET /api/tickets/:id/logs
router.get('/:id/logs', verifyToken, getTicketLogs);


// Export this router to be used in the main app
module.exports = router;