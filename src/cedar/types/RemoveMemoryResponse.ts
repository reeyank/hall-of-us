import { z } from 'zod';
import { StructuredResponseSchema } from 'cedar-os';

export const RemoveMemoryResponseSchema = StructuredResponseSchema('remove_memory').and(
  z.object({
    memoryId: z.string().min(1, 'Memory ID cannot be empty').describe('The ID of the memory that was removed'),
    success: z.boolean().describe('Whether the memory was successfully removed'),
    message: z.string().optional().describe('An optional message about the removal operation'),
  })
);

export type RemoveMemoryResponse = z.infer<typeof RemoveMemoryResponseSchema>;
