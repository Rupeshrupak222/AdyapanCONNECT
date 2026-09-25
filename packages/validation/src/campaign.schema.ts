import { z } from 'zod';

export const CreateCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['IMMEDIATE', 'SCHEDULED', 'RECURRING', 'CSV']).default('IMMEDIATE'),
  phoneNumberId: z.string().min(1, 'WhatsApp number is required'),
  templateId: z.string().min(1, 'Template is required'),
  segmentIds: z.array(z.string()).min(1, 'At least one audience segment is required'),
  scheduledAt: z.string().datetime().optional(),
  variables: z.record(z.string()).optional().default({}),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  recurringConfig: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    interval: z.number().min(1),
    endDate: z.string().datetime().optional(),
  }).optional(),
});

export const UpdateCampaignSchema = CreateCampaignSchema.partial();

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
