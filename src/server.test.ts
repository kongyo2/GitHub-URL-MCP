import { describe, expect, it } from "vitest";

import { fromUrl, toUrl } from "./server.js";

describe("GitHub URL Converter Tools", () => {
  describe("to-url", () => {
    it("should convert owner and repo to a valid GitHub URL for existing repo", async () => {
      const result = await toUrl({ owner: "microsoft", repo: "vscode" });
      expect(result).toBe("https://github.com/microsoft/vscode");
    });

    it("should show warning for non-existent repository", async () => {
      const result = await toUrl({
        owner: "non-existent-owner-12345",
        repo: "non-existent-repo-67890",
      });
      expect(result).toContain(
        "https://github.com/non-existent-owner-12345/non-existent-repo-67890",
      );
      expect(result).toContain(
        "⚠️ Warning: This repository may not exist or is not publicly accessible.",
      );
    });
  });

  describe("from-url", () => {
    it("should convert a valid GitHub URL to owner and repo for existing repo", async () => {
      const result = await fromUrl({
        url: "https://github.com/microsoft/vscode",
      });
      expect(JSON.parse(result as string)).toEqual({
        owner: "microsoft",
        repo: "vscode",
      });
    });

    it("should include warning for non-existent repository", async () => {
      const result = await fromUrl({
        url: "https://github.com/non-existent-owner-12345/non-existent-repo-67890",
      });
      const parsed = JSON.parse(result as string);
      expect(parsed).toEqual({
        owner: "non-existent-owner-12345",
        repo: "non-existent-repo-67890",
        warning: "This repository may not exist or is not publicly accessible.",
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

    it("should handle URLs with extra path segments for existing repo", async () => {
      const result = await fromUrl({
        url: "https://github.com/microsoft/vscode/tree/main",
      });
      expect(JSON.parse(result as string)).toEqual({
        owner: "microsoft",
        repo: "vscode",
      });
    });
  });
});
