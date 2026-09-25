import { z } from 'zod';

export const CreateTenantSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters').max(200),
  slug: z
    .string()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens only'),
  industry: z.string().max(100).optional(),
  country: z.string().max(2).optional(),
  timezone: z.string().optional(),
  currency: z.string().max(3).optional(),
  phone: z.string().max(20).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
});

export const UpdateTenantSchema = CreateTenantSchema.partial();

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  roleId: z.string().min(1, 'Role is required'),
});

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
