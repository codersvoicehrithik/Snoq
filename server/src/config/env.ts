import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  COOKIE_SECURE: z.preprocess(value=>value==='true',z.boolean()).default(false),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  BACKEND_URL: z.string().url().default('http://localhost:4000'),
  GOOGLE_CLIENT_ID: z.string().optional(), GOOGLE_CLIENT_SECRET: z.string().optional(), GOOGLE_CALLBACK_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(), CLOUDINARY_API_KEY: z.string().optional(), CLOUDINARY_API_SECRET: z.string().optional(), CLOUDINARY_FOLDER: z.string().default('resource-vault/documents'), CLOUDINARY_AVATAR_FOLDER: z.string().default('snoq/avatars'),
  RESEND_API_KEY: z.string().optional(), EMAIL_FROM: z.string().min(3).optional(),
  AI_PRIMARY_PROVIDER: z.enum(['gemini', 'openrouter']).default('gemini'), AI_FALLBACK_PROVIDER: z.enum(['gemini', 'openrouter']).optional(),
  GEMINI_API_KEY: z.string().optional(), GEMINI_MODEL: z.string().default('gemini-3.6-flash'), OPENROUTER_API_KEY: z.string().optional(), OPENROUTER_MODEL: z.string().default('google/gemini-3.5-flash-lite')
});
export const env = envSchema.parse(process.env);
