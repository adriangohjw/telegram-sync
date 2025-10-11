// Environment types for Cloudflare Workers
import type { R2Bucket, KVNamespace } from "@cloudflare/workers-types";

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHANNEL_ID: string;
  TELEGRAM_MESSAGE_THREAD_ID?: string;
  R2_BUCKET: R2Bucket;
  KV_STORE: KVNamespace;
  [key: string]: string | R2Bucket | KVNamespace;
}
