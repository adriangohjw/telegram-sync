import { describe, it, expect } from "bun:test";
import { generateKey } from "../generateKey";

describe("generateKey", () => {
  it("should generate a key with media group ID", () => {
    // Arrange
    const mediaGroupId = "12345";

    // Act
    const result = generateKey({ mediaGroupId });

    // Assert
    expect(result).toEqual("media_group_processed_12345");
  });

  it("should handle empty string media group ID", () => {
    // Arrange
    const mediaGroupId = "";

    // Act & Assert
    expect(() => generateKey({ mediaGroupId })).toThrow();
  });

  it("should handle long media group ID", () => {
    // Arrange
    const mediaGroupId = "very-long-media-group-id-123456789";

    // Act
    const result = generateKey({ mediaGroupId });

    // Assert
    expect(result).toEqual(
      "media_group_processed_very-long-media-group-id-123456789",
    );
  });

  it("should handle special characters in media group ID", () => {
    // Arrange
    const mediaGroupId = "group_123-abc_456";

    // Act
    const result = generateKey({ mediaGroupId });

    // Assert
    expect(result).toEqual("media_group_processed_group_123-abc_456");
  });

  describe("error cases", () => {
    it("should throw error for non-string mediaGroupId", () => {
      // Arrange
      const invalidParams = { mediaGroupId: 123 } as any;

      // Act & Assert
      expect(() => generateKey(invalidParams)).toThrow();
    });

    it("should throw error for missing mediaGroupId", () => {
      // Arrange
      const invalidParams = {} as any;

      // Act & Assert
      expect(() => generateKey(invalidParams)).toThrow();
    });

    it("should throw error for undefined mediaGroupId", () => {
      // Arrange
      const invalidParams = { mediaGroupId: undefined } as any;

      // Act & Assert
      expect(() => generateKey(invalidParams)).toThrow();
    });

    it("should throw error for empty mediaGroupId", () => {
      // Arrange
      const invalidParams = { mediaGroupId: "" };

      // Act & Assert
      expect(() => generateKey(invalidParams)).toThrow();
    });
  });
});
