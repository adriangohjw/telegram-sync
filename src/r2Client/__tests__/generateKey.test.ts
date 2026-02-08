import { describe, it, expect, vi, beforeEach, setSystemTime } from "bun:test";
import { generateKey } from "../generateKey";

describe("generateKey", () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp for consistent testing
    vi.useFakeTimers();
    setSystemTime(new Date("2024-01-15T10:30:00Z"));
  });

  it("should generate a key with date folder, base name, timestamp, and extension", () => {
    // Arrange
    const fileName = "test-image.jpg";

    // Act
    const result = generateKey({ fileName });

    // Assert
    expect(result).toEqual("2024-01-15/1705314600000_test-image.jpg");
  });

  it("should handle files with multiple dots in name", () => {
    // Arrange
    const fileName = "my.file.name.png";

    // Act
    const result = generateKey({ fileName });

    // Assert
    expect(result).toEqual("2024-01-15/1705314600000_my.file.name.png");
  });

  describe("error cases", () => {
    it("should throw error for files without extension", () => {
      // Arrange
      const fileName = "test-file";

      // Act & Assert
      expect(() => generateKey({ fileName })).toThrow(
        "File must have an extension",
      );
    });

    it("should throw error for files with no extension but ending with dot", () => {
      // Arrange
      const fileName = "test.";

      // Act & Assert
      expect(() => generateKey({ fileName })).toThrow(
        "File cannot end with dot but have no extension",
      );
    });

    it("should throw error for empty filename", () => {
      // Arrange
      const fileName = "";

      // Act & Assert
      expect(() => generateKey({ fileName })).toThrow(
        "Filename cannot be empty",
      );
    });
  });
});
