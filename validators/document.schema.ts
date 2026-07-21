import { z } from "zod";

export const CreateDocumentSchema =
  z.object({
    lesson_id: z.string().uuid(),

    title: z.string().min(1),

    description: z.string().optional(),

    file_url: z.string().url(),

    file_name: z.string().min(1),

    file_size: z.number().optional(),

    file_type: z.string().min(1),

    document_order: z.number().int(),
  });

export const UpdateDocumentSchema =
  CreateDocumentSchema.partial();