import { z } from 'zod';

const safeUsernamePattern = /^[a-zA-Z0-9_]+$/;

export const createUserSchema = z.object({
  username: z
      .string()
      .min(1, 'Username is required')
      .max(30, 'Username should not exceed 30 characters')
      .regex(safeUsernamePattern, 'Username can only contain letters, numbers, and underscores')
      .trim(),
  firebaseId: z.string().min(1, 'Firebase ID is required').trim(),
}).strict();

export const updateUserSchema = createUserSchema
  .omit({ firebaseId: true })
  .partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
