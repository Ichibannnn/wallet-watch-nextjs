import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().min(1, "Please select a role"),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  roleId: z.string().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
  // Optional password reset — omit/empty to leave unchanged.
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
