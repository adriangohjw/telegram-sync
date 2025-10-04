import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateKey } from "./generateKey";

describe("generateKey", () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:30:00Z"));
  });

  it("should generate a key with date folder, base name, timestamp, and extension", () => {
    // Arrange
    const fileName = "test-image.jpg";

    // Act
    const result = generateKey({ fileName });

    // Assert
    expect(result).toEqual("2024-01-15/test-image_1705314600000.jpg");
  });

  it("should handle files with multiple dots in name", () => {
    // Arrange
    const fileName = "my.file.name.png";

    // Act
    const result = generateKey({ fileName });

    // Assert
    expect(result).toEqual("2024-01-15/my.file.name_1705314600000.png");
  });

  describe("error cases", () => {
    it("should throw error for files without extension", () => {
      // Arrange
      const fileName = "test-file";

      // Act & Assert
      expect(() => generateKey({ fileName })).toThrow(
        "File must have an extension"
      );
    });

    it("should throw error for files with no extension but ending with dot", () => {
      // Arrange
      const fileName = "test.";

      // Act & Assert
      expect(() => generateKey({ fileName })).toThrow(
        "File cannot end with dot but have no extension"
      );
    });

    it("should throw error for empty filename", () => {
      // Arrange
      const fileName = "";

      // Act & Assert
      expect(() => generateKey({ fileName })).toThrow(
        "Filename cannot be empty"
      );
    });
  });
});
