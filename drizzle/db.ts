// Import the Neon serverless client for PostgreSQL

import * as schema from './schema';

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Import Drizzle's Neon HTTP driver for ORM support

// Import your database schema definitions (e.g., tables) from the local schema file

// Initialize the Neon client using the DATABASE_URL from your environment variables
const sql = neon(process.env.DATABASE_URL!);

// Create and export the Drizzle ORM instance, with the Neon client and schema for type-safe queries
export const db = drizzle(sql, { schema });
