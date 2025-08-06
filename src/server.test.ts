import { describe, expect, it } from "vitest";

import { fromUrl, toUrl } from "./server.js";

describe("GitHub URL Converter Tools", () => {
  describe("to-url", () => {
    it("should convert owner and repo to a valid GitHub URL", async () => {
      const result = await toUrl({ owner: "test-owner", repo: "test-repo" });
      expect(result).toBe("https://github.com/test-owner/test-repo");
    });
  });

  describe("from-url", () => {
    it("should convert a valid GitHub URL to owner and repo", async () => {
      const result = await fromUrl({
        url: "https://github.com/test-owner/test-repo",
      });
      expect(JSON.parse(result as string)).toEqual({
        owner: "test-owner",
        repo: "test-repo",
      });
    });

    it("should throw an error for a non-GitHub URL", async () => {
      await expect(
        fromUrl({ url: "https://example.com/test-owner/test-repo" }),
      ).rejects.toThrow("Invalid GitHub URL");
    });

    it("should throw an error for an invalid GitHub URL path", async () => {
      await expect(
        fromUrl({ url: "https://github.com/test-owner" }),
      ).rejects.toThrow("Invalid GitHub URL path");
    });

    it("should handle URLs with extra path segments", async () => {
      const result = await fromUrl({
        url: "https://github.com/test-owner/test-repo/tree/main",
      });
      expect(JSON.parse(result as string)).toEqual({
        owner: "test-owner",
        repo: "test-repo",
      });
    });
  });
});
