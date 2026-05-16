import { AppDataSource } from '../config/data-source.js';
import { Ticket } from '../entities/Ticket.js';
import crypto from 'crypto';

const ticketRepository = AppDataSource.getRepository(Ticket);

const generateTicketCode = () => {
  return crypto.randomBytes(12).toString('hex');
};

export const getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketRepository.find();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTicketsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const tickets = await ticketRepository.find({ where: { eventId } });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ticket = ticketRepository.create({
      eventId,
      userId,
      ticketCode: generateTicketCode(),
      status: 'active',
    });

    await ticketRepository.save(ticket);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const scanTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ error: 'Ticket already used' });
    }

    ticket.status = 'used';
    ticket.usedAt = new Date();

    await ticketRepository.save(ticket);
    res.json({ message: 'Ticket scanned successfully', ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ticketRepository.delete({ id });

    if (result.affected === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
