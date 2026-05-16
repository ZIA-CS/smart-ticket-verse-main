import 'reflect-metadata';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../entities/User.js';
import { Result } from '../entities/Result.js';
import { Event } from '../entities/Event.js';
import { Ticket } from '../entities/Ticket.js';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'smart_ticket_verse',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Result, Event, Ticket],
  migrations: ['src/migrations/*.js'],
  subscribers: [],
});
