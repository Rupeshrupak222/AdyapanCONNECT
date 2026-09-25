import { z } from 'zod';

export const SendMessageSchema = z.object({
  conversationId: z.string().min(1),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'TEMPLATE', 'INTERACTIVE']),
  content: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  templateId: z.string().optional(),
  templateData: z.record(z.any()).optional(),
  interactiveData: z.record(z.any()).optional(),
  replyToId: z.string().optional(),
});

export const SendTemplateMessageSchema = z.object({
  phoneNumber: z.string().min(7),
  phoneNumberId: z.string().min(1),
  templateName: z.string().min(1),
  language: z.string().default('en'),
  components: z.array(z.any()).optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type SendTemplateMessageInput = z.infer<typeof SendTemplateMessageSchema>;
