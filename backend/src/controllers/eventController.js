import { AppDataSource } from '../config/data-source.js';
import { Event } from '../entities/Event.js';

const eventRepository = AppDataSource.getRepository(Event);

export const getAllEvents = async (req, res) => {
  try {
    const events = await eventRepository.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventRepository.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, eventDate, location, capacity, createdBy } = req.body;

    if (!title || !eventDate || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const event = eventRepository.create({
      title,
      description,
      eventDate,
      location,
      capacity: capacity || 100,
      createdBy,
    });

    await eventRepository.save(event);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, eventDate, location, capacity } = req.body;

    const event = await eventRepository.findOne({ where: { id } });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (eventDate) event.eventDate = eventDate;
    if (location) event.location = location;
    if (capacity) event.capacity = capacity;

    await eventRepository.save(event);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await eventRepository.delete({ id });

    if (result.affected === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
