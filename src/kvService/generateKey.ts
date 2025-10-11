import { z } from "zod";

const generateKeyParamsSchema = z.object({
  messageId: z.number(),
});

export type GenerateKeyParams = z.infer<typeof generateKeyParamsSchema>;

export const generateKey = (params: GenerateKeyParams): string => {
  const { messageId } = generateKeyParamsSchema.parse(params);
  return `message_processed_${messageId}`;
};
