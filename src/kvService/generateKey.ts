import { z } from "zod";

const generateKeyParamsSchema = z.object({
  mediaGroupId: z.string().min(1, "Media group ID cannot be empty"),
});

export type GenerateKeyParams = z.infer<typeof generateKeyParamsSchema>;

export const generateKey = (params: GenerateKeyParams): string => {
  const { mediaGroupId } = generateKeyParamsSchema.parse(params);
  return `media_group_processed_${mediaGroupId}`;
};
