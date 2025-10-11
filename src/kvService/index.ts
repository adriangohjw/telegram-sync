import type { KVNamespace } from "@cloudflare/workers-types";
import superjson from "superjson";
import { generateKey, type GenerateKeyParams } from "./generateKey";

export interface KVServiceOptions {
  namespace: KVNamespace;
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

  async set<T = string>(key: string, value: T): Promise<boolean> {
    try {
      const serializedValue =
        typeof value === "string" ? value : superjson.stringify(value);

      await this.namespace.put(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Error setting key ${key} in KV:`, error);
      return false;
    }
  }

  generateKey({
    mediaGroupId,
  }: GenerateKeyParams): ReturnType<typeof generateKey> {
    return generateKey({ mediaGroupId });
  }
}
