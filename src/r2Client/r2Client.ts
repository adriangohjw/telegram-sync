import { generateKey, type GenerateKeyParams } from "./generateKey";
import type { Env } from "../env";
import type { R2Bucket } from "@cloudflare/workers-types";

export class R2Client {
  private readonly bucket: R2Bucket;

  constructor(env: Env) {
    this.bucket = env.R2_BUCKET;
  }

  async uploadFile(
    key: string,
    body: ArrayBuffer,
    contentType: string
  ): Promise<void> {
    try {
      await this.bucket.put(key, body, {
        httpMetadata: { contentType },
      });
      console.log(`Successfully uploaded file: ${key}`);
    } catch (error) {
      console.error(`Failed to upload file ${key}:`, error);
      throw error;
    }
  }

  generateKey({ fileName }: GenerateKeyParams): ReturnType<typeof generateKey> {
    return generateKey({ fileName });
  }
}
