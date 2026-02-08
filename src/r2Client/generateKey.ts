import { z } from "zod";

const generateKeyParamsSchema = z.object({
  fileName: z
    .string()
    .min(1, "Filename cannot be empty")
    .refine((fileName) => fileName.includes("."), "File must have an extension")
    .refine(
      (fileName) => !(fileName.endsWith(".") && fileName.split(".").length === 2),
      "File cannot end with dot but have no extension",
    ),
});

export type GenerateKeyParams = z.infer<typeof generateKeyParamsSchema>;

export const generateKey = (params: GenerateKeyParams): string => {
  const { fileName } = generateKeyParamsSchema.parse(params);

  const extension = fileName.split(".").pop() || "";
  const baseName = fileName.replace(/\.[^/.]+$/, "");

  const today = new Date();
  const dateFolder = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const timestamp = Date.now();

  return `${dateFolder}/${timestamp}_${baseName}.${extension}`;
};
