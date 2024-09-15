import { z } from 'zod';
import { ROLE, RoleTypeValue } from '~/constants/role';

export const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required').trim(),
  firebaseId: z.string().min(1, 'Firebase ID is required').trim(),
  role: z.enum(Object.values(ROLE) as [RoleTypeValue, ...RoleTypeValue[]]).optional().default(ROLE.USER),
}).strict();

export const updateUserSchema = createUserSchema
  .omit({ firebaseId: true })
  .partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
