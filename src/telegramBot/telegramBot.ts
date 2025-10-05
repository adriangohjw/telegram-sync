import type { TelegramFile, MediaFile, TelegramUpdate } from "./types";
import { R2Client } from "../r2Client";
import { extractMediaFiles } from "./extractMediaFiles";
import type { Env } from "../env";

export class TelegramBot {
  private readonly botToken: string;
  private readonly baseUrl: string;
  private readonly channelId: string;
  private readonly messageThreadId: string | undefined;
  private readonly r2Client: R2Client;

  constructor(env: Env) {
    this.botToken = env.TELEGRAM_BOT_TOKEN;
    this.channelId = env.TELEGRAM_CHANNEL_ID;
    this.messageThreadId = env.TELEGRAM_MESSAGE_THREAD_ID;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;

    this.r2Client = new R2Client(env);
  }

  async setWebhook(webhookUrl: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "channel_post"],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set webhook: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      ok: boolean;
      description?: string;
    };

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    return data.ok;
  }

  async deleteWebhook(): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/deleteWebhook`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete webhook: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      ok: boolean;
      description?: string;
    };

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    return data.ok;
  }

  // For local development where we don't have a webhook
  async getUpdates({
    offset,
    limit,
  }: {
    offset: number;
    limit: number;
  }): Promise<TelegramUpdate[]> {
    const response = await fetch(
      `${this.baseUrl}/getUpdates?offset=${offset}&limit=${limit}`
    );

    const data = (await response.json()) as {
      ok: boolean;
      result: TelegramUpdate[];
    };

    if (!data.ok) {
      throw new Error(`Telegram API error: Unable to get updates`);
    }

    // Filter updates by channel ID and message thread ID
    return data.result.filter((update) => this.shouldProcessUpdate(update));
  }

  /**
   * Determines if an update should be processed based on channel ID and message thread ID
   */
  shouldProcessUpdate(update: TelegramUpdate): boolean {
    const message = update.message || update.channel_post;

    if (!message) {
      return false;
    }

    if (!this.channelId) {
      return false;
    }

    // Filter by channel ID if specified
    if (message.chat.id.toString() !== this.channelId) {
      return false;
    }

    // Filter by message thread ID if specified
    if (
      this.messageThreadId &&
      message?.message_thread_id?.toString() !== this.messageThreadId
    ) {
      return false;
    }

    return true;
  }

  async processUpdate(update: TelegramUpdate): Promise<void> {
    if (!this.shouldProcessUpdate(update)) {
      return;
    }

    const message = update.message || update.channel_post;

    if (!message) {
      return;
    }

    // Process each media file
    for (const mediaFile of extractMediaFiles(message)) {
      try {
        console.log(`Processing ${mediaFile.type}: ${mediaFile.fileName}`);

        // Download file from Telegram
        const fileData = await this.downloadMediaFile(mediaFile);

        // Generate R2 key with date-based folder structure
        const r2Key = this.r2Client.generateKey({
          fileName: mediaFile.fileName,
        });

        // Upload to R2
        await this.r2Client.uploadFile({
          key: r2Key,
          body: fileData,
          contentType: mediaFile.mimeType,
        });
      } catch (error) {
        console.error(`Failed to process ${mediaFile.fileName}:`, error);
      }
    }
  }

  async downloadMediaFile(mediaFile: MediaFile): Promise<ArrayBuffer> {
    const fileInfo = await this.getFile(mediaFile.fileId);

    if (!fileInfo.file_path) {
      throw new Error("File path not available");
    }

    return this.downloadFile(fileInfo.file_path);
  }

  private async getFile(fileId: string): Promise<TelegramFile> {
    const response = await fetch(`${this.baseUrl}/getFile?file_id=${fileId}`);

    if (!response.ok) {
      throw new Error(`Failed to get file info: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      ok: boolean;
      result: TelegramFile;
      description?: string;
    };

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    return data.result;
  }

  private async downloadFile(filePath: string): Promise<ArrayBuffer> {
    const response = await fetch(
      `https://api.telegram.org/file/bot${this.botToken}/${filePath}`
    );

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return response.arrayBuffer();
  }
}
