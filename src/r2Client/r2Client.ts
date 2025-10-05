import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../env";
import { generateKey, type GenerateKeyParams } from "./generateKey";

export class R2Client {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.bucketName = env.R2_BUCKET_NAME;
    this.s3Client = new S3Client({
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(
    key: string,
    body: ArrayBuffer,
    contentType?: string
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: new Uint8Array(body),
      ContentType: contentType,
    });

    try {
      await this.s3Client.send(command);
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
