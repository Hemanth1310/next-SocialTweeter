import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or fewer"),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Handle must be at least 3 characters")
    .max(15, "Handle must be 15 characters or fewer")
    .regex(/^[a-z0-9_]+$/, "Use only letters, numbers and underscores"),
  email,
  // bcrypt ignores bytes past 72, so cap it rather than silently truncate.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or fewer"),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
