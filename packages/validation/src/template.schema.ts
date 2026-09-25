import { z } from 'zod';

export const TemplateButtonSchema = z.object({
  type: z.enum(['QUICK_REPLY', 'URL', 'PHONE_NUMBER', 'COPY_CODE']),
  text: z.string().min(1).max(25),
  url: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  example: z.array(z.string()).optional(),
});

export const CreateTemplateSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(512)
    .regex(/^[a-z0-9_]+$/, 'Template name must be lowercase letters, numbers and underscores only'),
  category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']),
  language: z.string().default('en'),
  phoneNumberId: z.string().min(1),
  headerType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION']).optional(),
  headerContent: z.string().max(60).optional(),
  headerExample: z.array(z.string()).optional(),
  body: z.string().min(1, 'Body is required').max(1024),
  bodyVariables: z.array(z.string()).optional().default([]),
  bodyExample: z.record(z.string()).optional(),
  footer: z.string().max(60).optional(),
  buttons: z.array(TemplateButtonSchema).max(3).optional().default([]),
});

export const UpdateTemplateSchema = CreateTemplateSchema.partial();

export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof UpdateTemplateSchema>;
