import { describe, it, expect, vi } from "vitest";
import { TelegramBot } from "../telegramBot";
import type { TelegramUpdate, TelegramMessage, TelegramChat } from "../types";
import type { Env } from "../../env";

describe("TelegramBot.shouldProcessUpdate", () => {
  const mockR2Bucket = {
    put: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
  };

  const mockKVStore = {
    get: vi.fn(),
    set: vi.fn(),
  };

  const createMockEnv = (overrides: Partial<Env> = {}): Env => ({
    TELEGRAM_BOT_TOKEN: "test-token",
    TELEGRAM_CHANNEL_ID: "123456789",
    R2_BUCKET: mockR2Bucket as any,
    KV_STORE: mockKVStore as any,
    ...overrides,
  });

  describe("channel ID filtering", () => {
    it("should return true for updates from the correct channel", () => {
      // Arrange
      const telegramBot = new TelegramBot(createMockEnv());
      const update = createMockUpdate({
        chatId: "123456789",
      });

      // Act
      const result = telegramBot.shouldProcessUpdate(update);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false for updates from different channel", () => {
      // Arrange
      const telegramBot = new TelegramBot(createMockEnv());
      const update = createMockUpdate({ chatId: "-999999999" });

      // Act
      const result = telegramBot.shouldProcessUpdate(update);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false for any channel when no channel ID is configured", () => {
      // Arrange
      const telegramBot = new TelegramBot(
        createMockEnv({ TELEGRAM_CHANNEL_ID: "" })
      );
      const update = createMockUpdate({ chatId: "any-channel-id" });

      // Act
      const result = telegramBot.shouldProcessUpdate(update);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false for any channel when channel ID is undefined", () => {
      // Arrange
      const telegramBot = new TelegramBot(
        createMockEnv({ TELEGRAM_CHANNEL_ID: undefined as any })
      );
      const update = createMockUpdate({ chatId: "any-channel-id" });

      // Act
      const result = telegramBot.shouldProcessUpdate(update);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("message thread ID filtering", () => {
    it("should return true for updates with correct thread ID", () => {
      // Arrange
      const telegramBot = new TelegramBot(
        createMockEnv({
          TELEGRAM_MESSAGE_THREAD_ID: "987654321",
        })
      );
      const update = createMockUpdate({
        chatId: "123456789",
        messageThreadId: 987654321,
      });

      // Act
      const result = telegramBot.shouldProcessUpdate(update);

      // Assert
      expect(result).toBe(true);
    });

    it("should return false for updates with different thread ID", () => {
      // Arrange
      const telegramBot = new TelegramBot(
        createMockEnv({
          TELEGRAM_MESSAGE_THREAD_ID: "987654321",
        })
      );
      const update = createMockUpdate({
        chatId: "123456789",
        messageThreadId: 111111111,
      });

      // Act
      const result = telegramBot.shouldProcessUpdate(update);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false for updates without thread ID when thread ID is configured", () => {
      // Arrange
      const telegramBot = new TelegramBot(
        createMockEnv({
          TELEGRAM_MESSAGE_THREAD_ID: "987654321",
        })
      );
      const update = createMockUpdate({ chatId: "123456789" });

      // Act
      const result = telegramBot.shouldProcessUpdate(update);

      // Assert
      expect(result).toBe(false);
    });

    it("should return true for any thread ID when no thread ID is configured", () => {
      // Arrange
      const telegramBot = new TelegramBot(createMockEnv());
      const update = createMockUpdate({
        chatId: "123456789",
        messageThreadId: 999999999,
      });

      // Act
      const result = telegramBot.shouldProcessUpdate(update);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("combined filtering", () => {
    it("should return false when channel ID is wrong even if thread ID is correct", () => {
      // Arrange
      const telegramBot = new TelegramBot(
        createMockEnv({
          TELEGRAM_MESSAGE_THREAD_ID: "987654321",
        })
      );
      const update = createMockUpdate({
        chatId: "999999999",
        messageThreadId: 987654321,
      });

      // Act
      const result = telegramBot.shouldProcessUpdate(update);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when thread ID is wrong even if channel ID is correct", () => {
      // Arrange
      const telegramBot = new TelegramBot(
        createMockEnv({
          TELEGRAM_MESSAGE_THREAD_ID: "987654321",
        })
      );
      const update = createMockUpdate({
        chatId: "123456789",
        messageThreadId: 111111111,
      });

      // Act
      const result = telegramBot.shouldProcessUpdate(update);

      // Assert
      expect(result).toBe(false);
    });

    it("should return true when both channel ID and thread ID are correct", () => {
      // Arrange
      const telegramBot = new TelegramBot(
        createMockEnv({
          TELEGRAM_MESSAGE_THREAD_ID: "987654321",
        })
      );
      const update = createMockUpdate({
        chatId: "123456789",
        messageThreadId: 987654321,
      });

      // Act
      const result = telegramBot.shouldProcessUpdate(update);

      // Assert
      expect(result).toBe(true);
    });
  });
});

interface CreateMockUpdateParams {
  chatId: string;
  messageThreadId?: number;
  isChannelPost?: boolean;
}

const createMockUpdate = ({
  chatId,
  messageThreadId,
  isChannelPost = false,
}: CreateMockUpdateParams): TelegramUpdate => {
  const mockChat: TelegramChat = {
    id: parseInt(chatId),
    type: "channel",
    title: "Test Channel",
  };

  const mockMessage: TelegramMessage = {
    message_id: 1,
    ...(messageThreadId !== undefined && {
      message_thread_id: messageThreadId,
    }),
    chat: mockChat,
    date: Math.floor(Date.now() / 1000), // Telegram uses Unix timestamp
    text: "Test message",
  };

  return {
    update_id: Math.floor(Math.random() * 1000000),
    ...(isChannelPost
      ? { channel_post: mockMessage }
      : { message: mockMessage }),
  };
};
