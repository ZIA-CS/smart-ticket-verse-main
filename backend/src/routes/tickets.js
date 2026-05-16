import express from 'express';
import {
  getAllTickets,
  getTicketById,
  getTicketsByEvent,
  createTicket,
  scanTicket,
  deleteTicket,
} from '../controllers/ticketController.js';

const router = express.Router();

// Get all tickets
router.get('/', getAllTickets);

// Get ticket by ID
router.get('/:id', getTicketById);

// Get tickets by event
router.get('/event/:eventId', getTicketsByEvent);

// Create ticket
router.post('/', createTicket);

// Validate/Scan ticket
router.put('/:id/scan', scanTicket);

// Delete ticket
router.delete('/:id', deleteTicket);

export default router;
