#!/usr/bin/env tsx

import { TelegramBot } from "../src/telegramBot";
import { config } from "dotenv";
import { Env } from "../src/env";

// Load environment variables
config({ path: ".dev.vars" });

const POLL_INTERVAL = 5000; // 5 seconds
const MAX_UPDATES_PER_POLL = 100;

class DevPoller {
  private telegramBot: TelegramBot;
  private offset?: number;
  private isRunning = false;

  constructor() {
    // Validate required environment variables
    const requiredEnvVars = [
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_CHANNEL_ID",
      // "MESSAGE_THREAD_ID", // Optional field
      // "R2_ACCOUNT_ID",
      // "R2_ACCESS_KEY_ID",
      // "R2_SECRET_ACCESS_KEY",
      // "R2_BUCKET_NAME",
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        console.error("Please check your .dev.vars file");
        process.exit(1);
      }
    }

    this.telegramBot = new TelegramBot(process.env as Env);
  }

  async start() {
    console.log("🚀 Starting Telegram bot polling for local development...");
    console.log(`📡 Polling every ${POLL_INTERVAL / 1000} seconds`);
    console.log("Press Ctrl+C to stop\n");

    this.isRunning = true;

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Stopping poller...");
      this.isRunning = false;
      process.exit(0);
    });

    while (this.isRunning) {
      try {
        await this.pollUpdates();
      } catch (error) {
        console.error("❌ Error during polling:", error);
        // Continue polling even if there's an error
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }
  }

  private async pollUpdates() {
    try {
      const updates = await this.telegramBot.getUpdates({
        offset: this.offset || 0,
        limit: MAX_UPDATES_PER_POLL,
      });

      if (updates.length === 0) {
        console.log("⏳ No new updates");
        return;
      }

      console.log(`📨 Received ${updates.length} update(s)`);

      // Process each update
      for (const update of updates) {
        try {
          console.log(`🔄 Processing update ${update.update_id}...`);
          await this.telegramBot.processUpdate(update);
          console.log(`✅ Successfully processed update ${update.update_id}`);
        } catch (error) {
          console.error(`❌ Failed to process update ${update.update_id}:`, error);
        }
      }

      // Update offset for next poll
      this.offset = Math.max(...updates.map((u) => u.update_id)) + 1;
      console.log(`📍 Next offset: ${this.offset}\n`);
    } catch (error) {
      console.error("❌ Error fetching updates:", error);
      throw error;
    }
  }
}

// Start the poller~
const poller = new DevPoller();
poller.start().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
