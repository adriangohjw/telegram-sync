import type { KVNamespace } from "@cloudflare/workers-types";
import superjson from "superjson";
import { generateKey, type GenerateKeyParams } from "./generateKey";

export interface KVServiceOptions {
  namespace: KVNamespace;
}

export interface KVSetOptions {
  ttl?: number; // TTL in seconds, defaults to 24 hours (86400 seconds)
}

export class KVService {
  private namespace: KVNamespace;

  constructor(options: KVServiceOptions) {
    this.namespace = options.namespace;
  }

  async get<T = string>(key: string): Promise<T | null> {
    try {
      const value = await this.namespace.get(key);
      if (value === null) {
        return null;
      }

      // Try to parse with superjson, fallback to string
      try {
        return superjson.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`Error getting key ${key} from KV:`, error);
      return null;
    }
  }

  async set<T = string>(key: string, value: T, options?: KVSetOptions): Promise<boolean> {
    try {
      const serializedValue = typeof value === "string" ? value : superjson.stringify(value);

      const ttl = options?.ttl ?? 86400; // 24 hours if not specified

      await this.namespace.put(key, serializedValue, { expirationTtl: ttl });
      return true;
    } catch (error) {
      console.error(`Error setting key ${key} in KV:`, error);
      return false;
    }
  }

  generateKey({ mediaGroupId }: GenerateKeyParams): ReturnType<typeof generateKey> {
    return generateKey({ mediaGroupId });
  }
}
