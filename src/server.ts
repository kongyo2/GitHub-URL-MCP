import { FastMCP } from "fastmcp";
import { z } from "zod";

const server = new FastMCP({
  name: "GitHub URL Handler",
  version: "1.0.0",
});

/**
 * Validates if a GitHub repository exists and determines its accessibility
 * Uses HEAD request to avoid downloading content
 */
const validateRepository = async (
  owner: string,
  repo: string,
): Promise<{
  error?: string;
  exists: boolean;
  isPrivate?: boolean;
  status: "error" | "not_found" | "private" | "public";
}> => {
  try {
    const response = await fetch(`https://github.com/${owner}/${repo}`, {
      method: "HEAD",
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === 200) {
      return {
        exists: true,
        isPrivate: false,
        status: "public",
      };
    } else if (response.status === 404) {
      // 404 can mean either the repo doesn't exist or it's private
      // Try to access the owner's profile to distinguish
      const ownerResponse = await fetch(`https://github.com/${owner}`, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });

      if (ownerResponse.status === 200) {
        // Owner exists, so the repo is likely private
        return {
          exists: true,
          isPrivate: true,
          status: "private",
        };
      } else {
        // Owner doesn't exist, so repo doesn't exist
        return {
          exists: false,
          status: "not_found",
        };
      }
    } else {
      // Other status codes (403, 500, etc.)
      return {
        error: `HTTP ${response.status}`,
        exists: false,
        status: "error",
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      error: errorMessage.includes("timeout")
        ? "Request timeout"
        : "Network error",
      exists: false,
      status: "error",
    };
  }
};

/**
 * Parses a GitHub URL and extracts owner and repository information
 */
const parseGitHubUrl = (
  urlString: string,
): { owner: string; path?: string; repo: string } => {
  let url: URL;

  try {
    url = new URL(urlString);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (url.hostname !== "github.com") {
    throw new Error("URL must be from github.com domain");
  }

  const pathParts = url.pathname.slice(1).split("/").filter(Boolean);

  if (pathParts.length < 2) {
    throw new Error(
      "URL must contain both owner and repository name (e.g., https://github.com/owner/repo)",
    );
  }

  const [owner, repo, ...remainingPath] = pathParts;

  if (!owner || !repo) {
    throw new Error("Invalid owner or repository name in URL");
  }

  return {
    owner,
    path: remainingPath.length > 0 ? remainingPath.join("/") : undefined,
    repo,
  };
};

/**
 * Converts owner and repository name to GitHub URL
 */
export const buildGitHubUrl = async (args: { owner: string; repo: string }) => {
  const { owner, repo } = args;

  // Basic validation
  if (!owner.trim() || !repo.trim()) {
    throw new Error("Owner and repository name cannot be empty");
  }

  const url = `https://github.com/${owner}/${repo}`;
  const validation = await validateRepository(owner, repo);

  switch (validation.status) {
    case "error": {
      const errorInfo = validation.error ? ` (${validation.error})` : "";
      return `${url}\n\n❌ Error: Unable to verify repository${errorInfo}`;
    }
    case "not_found":
      return `${url}\n\n⚠️ Warning: Repository does not exist`;
    case "private":
      return `${url}\n\n🔒 Note: Repository exists but is private`;
    case "public":
      return url;
    default:
      return url;
  }
};

/**
 * Parses GitHub URL and extracts repository information
 */
export const parseGitHubUrlTool = async (args: { url: string }) => {
  const parsed = parseGitHubUrl(args.url);
  const validation = await validateRepository(parsed.owner, parsed.repo);

  const result = {
    owner: parsed.owner,
    repo: parsed.repo,
    status: validation.status,
    url: `https://github.com/${parsed.owner}/${parsed.repo}`,
    ...(parsed.path && { additionalPath: parsed.path }),
  };

  switch (validation.status) {
    case "error": {
      const errorInfo = validation.error ? ` (${validation.error})` : "";
      return JSON.stringify({
        ...result,
        accessible: false,
        error: `Unable to verify repository${errorInfo}`,
      });
    }
    case "not_found":
      return JSON.stringify({
        ...result,
        accessible: false,
        warning: "Repository does not exist",
      });
    case "private":
      return JSON.stringify({
        ...result,
        accessible: false,
        note: "Repository exists but is private",
      });
    case "public":
      return JSON.stringify({
        ...result,
        accessible: true,
      });
    default:
      return JSON.stringify(result);
  }
};

// Tool for converting owner/repo to GitHub URL
server.addTool({
  annotations: {
    openWorldHint: false, // No external system interaction beyond validation
    readOnlyHint: true, // Does not modify any data
    title: "Build GitHub URL",
  },
  description:
    "Converts GitHub owner and repository name into a properly formatted GitHub URL with validation",
  execute: buildGitHubUrl,
  name: "github/build_url",
  parameters: z.object({
    owner: z
      .string()
      .min(1, "Owner cannot be empty")
      .describe(
        "GitHub username or organization name (e.g., 'microsoft', 'facebook')",
      ),
    repo: z
      .string()
      .min(1, "Repository name cannot be empty")
      .describe("Repository name (e.g., 'vscode', 'react')"),
  }),
});

// Tool for parsing GitHub URL to extract components
server.addTool({
  annotations: {
    openWorldHint: false, // No external system interaction beyond validation
    readOnlyHint: true, // Does not modify any data
    title: "Parse GitHub URL",
  },
  description:
    "Parses a GitHub URL to extract owner, repository name, and additional path information with validation",
  execute: parseGitHubUrlTool,
  name: "github/parse_url",
  parameters: z.object({
    url: z
      .string()
      .url("Must be a valid URL")
      .describe(
        "GitHub URL to parse (e.g., 'https://github.com/microsoft/vscode' or 'https://github.com/facebook/react/tree/main/packages')",
      ),
  }),
});

// Add a resource that provides information about the server
server.addResource({
  async load() {
    return {
      text: `GitHub URL Handler MCP Server

This server provides tools for working with GitHub URLs:

1. github/build_url - Convert owner/repo to GitHub URL
2. github/parse_url - Parse GitHub URL to extract components

Features:
- Repository existence validation
- Proper error handling for invalid URLs
- Support for URLs with additional path segments
- Network timeout protection
- Detailed error messages

All operations are read-only and do not require GitHub API authentication.`,
    };
  },
  mimeType: "text/plain",
  name: "Server Information",
  uri: "github-url-handler://info",
});

server.start({
  transportType: "stdio",
});
