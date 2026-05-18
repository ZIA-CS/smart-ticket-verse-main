import { supabase } from '../config/supabaseClient.js';
import crypto from 'crypto';

const generateTicketCode = () => {
  return crypto.randomBytes(12).toString('hex');
};

export const getAllTickets = async (req, res) => {
  try {
    const { data: tickets, error } = await supabase.from('tickets').select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

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
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('eventId', eventId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

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

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        eventId,
        userId,
        ticketCode: generateTicketCode(),
        status: 'active',
      })
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const scanTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ error: 'Ticket already used' });
    }

    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update({
        status: 'used',
        usedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    res.json({ message: 'Ticket scanned successfully', ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
