import 'reflect-metadata';
import dotenv from 'dotenv';
import dns from 'node:dns';
import { DataSource } from 'typeorm';
import { User } from '../entities/User.js';
import { Result } from '../entities/Result.js';
import { Event } from '../entities/Event.js';
import { Ticket } from '../entities/Ticket.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');

const dbUrl = process.env.DB_URL || process.env.DATABASE_URL;
const useSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true';
const forceIpv4 = process.env.DB_FORCE_IPV4
  ? String(process.env.DB_FORCE_IPV4).toLowerCase() === 'true'
  : process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl || undefined,
  host: dbUrl ? undefined : process.env.DB_HOST || 'localhost',
  port: dbUrl ? undefined : parseInt(process.env.DB_PORT || '5432'),
  username: dbUrl ? undefined : process.env.DB_USERNAME || 'postgres',
  password: dbUrl ? undefined : process.env.DB_PASSWORD || 'password',
  database: dbUrl ? undefined : process.env.DB_DATABASE || 'smart_ticket_verse',
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  extra: forceIpv4 ? { family: 4 } : undefined,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Result, Event, Ticket],
  migrations: ['src/migrations/*.js'],
  subscribers: [],
});
