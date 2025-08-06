import { describe, expect, it } from "vitest";

import { buildGitHubUrl, parseGitHubUrlTool } from "./server.js";

describe("GitHub URL Handler Tools", () => {
  describe("github/build_url", () => {
    it("should convert owner and repo to a valid GitHub URL for existing repo", async () => {
      const result = await buildGitHubUrl({
        owner: "microsoft",
        repo: "vscode",
      });
      expect(result).toBe("https://github.com/microsoft/vscode");
    });

    it("should show warning for non-existent repository", async () => {
      const result = await buildGitHubUrl({
        owner: "non-existent-owner-12345",
        repo: "non-existent-repo-67890",
      });
      expect(result).toContain(
        "https://github.com/non-existent-owner-12345/non-existent-repo-67890",
      );
      expect(result).toContain("⚠️ Warning: Repository does not exist");
    });

    it("should show note for private repository", async () => {
      // Using a known organization with likely private repos
      const result = await buildGitHubUrl({
        owner: "microsoft",
        repo: "private-test-repo-that-does-not-exist-12345",
      });
      expect(result).toContain(
        "https://github.com/microsoft/private-test-repo-that-does-not-exist-12345",
      );
      // This will likely be detected as private since microsoft exists
      expect(result).toMatch(
        /🔒 Note: Repository exists but is private|⚠️ Warning: Repository does not exist/,
      );
    });

    it("should throw error for empty owner", async () => {
      await expect(
        buildGitHubUrl({ owner: "", repo: "test-repo" }),
      ).rejects.toThrow("Owner and repository name cannot be empty");
    });

    it("should throw error for empty repo", async () => {
      await expect(
        buildGitHubUrl({ owner: "test-owner", repo: "" }),
      ).rejects.toThrow("Owner and repository name cannot be empty");
    });

    it("should handle whitespace-only inputs", async () => {
      await expect(
        buildGitHubUrl({ owner: "  ", repo: "test-repo" }),
      ).rejects.toThrow("Owner and repository name cannot be empty");
    });
  });

  describe("github/parse_url", () => {
    it("should parse a valid GitHub URL for existing repo", async () => {
      const result = await parseGitHubUrlTool({
        url: "https://github.com/microsoft/vscode",
      });
      const parsed = JSON.parse(result as string);
      expect(parsed.owner).toBe("microsoft");
      expect(parsed.repo).toBe("vscode");
      expect(parsed.url).toBe("https://github.com/microsoft/vscode");
      expect(parsed.status).toBe("public");
      expect(parsed.accessible).toBe(true);
    });

    it("should include warning for non-existent repository", async () => {
      const result = await parseGitHubUrlTool({
        url: "https://github.com/non-existent-owner-12345/non-existent-repo-67890",
      });
      const parsed = JSON.parse(result as string);
      expect(parsed.owner).toBe("non-existent-owner-12345");
      expect(parsed.repo).toBe("non-existent-repo-67890");
      expect(parsed.url).toBe(
        "https://github.com/non-existent-owner-12345/non-existent-repo-67890",
      );
      expect(parsed.status).toBe("not_found");
      expect(parsed.accessible).toBe(false);
      expect(parsed.warning).toBe("Repository does not exist");
    });

    it("should handle private repository detection", async () => {
      const result = await parseGitHubUrlTool({
        url: "https://github.com/microsoft/private-test-repo-that-does-not-exist-12345",
      });
      const parsed = JSON.parse(result as string);
      expect(parsed.owner).toBe("microsoft");
      expect(parsed.repo).toBe("private-test-repo-that-does-not-exist-12345");
      expect(parsed.accessible).toBe(false);
      // Should be either private or not_found
      expect(["private", "not_found"]).toContain(parsed.status);
    });

    it("should throw error for non-GitHub URL", async () => {
      await expect(
        parseGitHubUrlTool({ url: "https://example.com/test-owner/test-repo" }),
      ).rejects.toThrow("URL must be from github.com domain");
    });

    it("should throw error for invalid URL format", async () => {
      await expect(parseGitHubUrlTool({ url: "not-a-url" })).rejects.toThrow(
        "Invalid URL format",
      );
    });

    it("should throw error for GitHub URL without repo", async () => {
      await expect(
        parseGitHubUrlTool({ url: "https://github.com/test-owner" }),
      ).rejects.toThrow("URL must contain both owner and repository name");
    });

    it("should throw error for GitHub root URL", async () => {
      await expect(
        parseGitHubUrlTool({ url: "https://github.com/" }),
      ).rejects.toThrow("URL must contain both owner and repository name");
    });

    it("should handle URLs with additional path segments", async () => {
      const result = await parseGitHubUrlTool({
        url: "https://github.com/microsoft/vscode/tree/main/src",
      });
      const parsed = JSON.parse(result as string);
      expect(parsed.owner).toBe("microsoft");
      expect(parsed.repo).toBe("vscode");
      expect(parsed.url).toBe("https://github.com/microsoft/vscode");
      expect(parsed.additionalPath).toBe("tree/main/src");
      expect(parsed.status).toBe("public");
      expect(parsed.accessible).toBe(true);
    });

    it("should handle URLs with query parameters", async () => {
      const result = await parseGitHubUrlTool({
        url: "https://github.com/microsoft/vscode?tab=readme-ov-file",
      });
      const parsed = JSON.parse(result as string);
      expect(parsed.owner).toBe("microsoft");
      expect(parsed.repo).toBe("vscode");
      expect(parsed.url).toBe("https://github.com/microsoft/vscode");
    });

    it("should handle URLs with fragments", async () => {
      const result = await parseGitHubUrlTool({
        url: "https://github.com/microsoft/vscode#readme",
      });
      const parsed = JSON.parse(result as string);
      expect(parsed.owner).toBe("microsoft");
      expect(parsed.repo).toBe("vscode");
      expect(parsed.url).toBe("https://github.com/microsoft/vscode");
    });

    it("should handle complex URLs with path, query, and fragment", async () => {
      const result = await parseGitHubUrlTool({
        url: "https://github.com/microsoft/vscode/blob/main/README.md?plain=1#L10",
      });
      const parsed = JSON.parse(result as string);
      expect(parsed.owner).toBe("microsoft");
      expect(parsed.repo).toBe("vscode");
      expect(parsed.url).toBe("https://github.com/microsoft/vscode");
      expect(parsed.additionalPath).toBe("blob/main/README.md");
    });
  });
});
