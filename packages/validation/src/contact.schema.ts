import { z } from 'zod';

export const CreateContactSchema = z.object({
  phoneNumber: z.string().min(7, 'Invalid phone number').max(20),
  countryCode: z.string().default('+91'),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().max(200).optional(),
  jobTitle: z.string().max(100).optional(),
  tags: z.array(z.string()).optional().default([]),
  customAttributes: z.record(z.any()).optional().default({}),
  source: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
});

export const UpdateContactSchema = CreateContactSchema.partial();

export const ImportContactsSchema = z.object({
  fileUrl: z.string().url(),
  fieldMapping: z.record(z.string()),
  skipDuplicates: z.boolean().default(true),
  defaultTags: z.array(z.string()).optional().default([]),
});

export const SegmentConditionSchema = z.object({
  field: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_set', 'is_not_set', 'in_last', 'not_in_last']),
  value: z.any(),
  type: z.enum(['attribute', 'tag', 'activity', 'campaign']),
});

export const CreateSegmentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  conditions: z.array(SegmentConditionSchema).min(1),
  conditionOperator: z.enum(['AND', 'OR']).default('AND'),
  isDynamic: z.boolean().default(true),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;
export type CreateSegmentInput = z.infer<typeof CreateSegmentSchema>;
