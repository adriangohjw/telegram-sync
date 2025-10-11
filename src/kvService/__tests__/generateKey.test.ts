import { describe, it, expect } from "vitest";
import { generateKey } from "../generateKey";

describe("generateKey", () => {
  it("should generate a key with message ID", () => {
    // Arrange
    const messageId = 12345;

    // Act
    const result = generateKey({ messageId });

    // Assert
    expect(result).toEqual("message_processed_12345");
  });

  it("should handle zero message ID", () => {
    // Arrange
    const messageId = 0;

    // Act
    const result = generateKey({ messageId });

    // Assert
    expect(result).toEqual("message_processed_0");
  });

  it("should handle negative message ID", () => {
    // Arrange
    const messageId = -1;

    // Act
    const result = generateKey({ messageId });

    // Assert
    expect(result).toEqual("message_processed_-1");
  });

  it("should handle large message ID", () => {
    // Arrange
    const messageId = 999999999;

    // Act
    const result = generateKey({ messageId });

    // Assert
    expect(result).toEqual("message_processed_999999999");
  });

  describe("error cases", () => {
    it("should throw error for non-number messageId", () => {
      // Arrange
      const invalidParams = { messageId: "not-a-number" } as any;

      // Act & Assert
      expect(() => generateKey(invalidParams)).toThrow();
    });

    it("should throw error for missing messageId", () => {
      // Arrange
      const invalidParams = {} as any;

      // Act & Assert
      expect(() => generateKey(invalidParams)).toThrow();
    });

    it("should throw error for undefined messageId", () => {
      // Arrange
      const invalidParams = { messageId: undefined } as any;

      // Act & Assert
      expect(() => generateKey(invalidParams)).toThrow();
    });
  });
});
