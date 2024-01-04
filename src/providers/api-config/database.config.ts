import process from 'process';
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB,
  DATABASE_URL: process.env.DATABASE_URL,
}));
