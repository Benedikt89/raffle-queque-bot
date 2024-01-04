import { registerAs } from '@nestjs/config';
import process from 'process';

export default registerAs('main', () => ({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  BASE_URL: process.env.BASE_URL,
}));
