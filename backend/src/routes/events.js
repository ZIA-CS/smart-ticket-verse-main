import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';

const router = express.Router();

// Get all events
router.get('/', getAllEvents);

// Get event by ID
router.get('/:id', getEventById);

// Create event
router.post('/', createEvent);

// Update event
router.put('/:id', updateEvent);

// Delete event
router.delete('/:id', deleteEvent);

export default router;
