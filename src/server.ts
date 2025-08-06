import { FastMCP } from "fastmcp";
import { z } from "zod";

const server = new FastMCP({
  name: "GitHub URL Converter",
  version: "1.0.0",
});

const checkRepoExists = async (
  owner: string,
  repo: string,
): Promise<boolean> => {
  try {
    const response = await fetch(`https://github.com/${owner}/${repo}`, {
      method: "HEAD",
    });
    return response.status === 200;
  } catch {
    return false;
  }
};

export const toUrl = async (args: { owner: string; repo: string }) => {
  const url = `https://github.com/${args.owner}/${args.repo}`;
  const exists = await checkRepoExists(args.owner, args.repo);

  if (!exists) {
    return `${url}\n\n⚠️ Warning: This repository may not exist or is not publicly accessible.`;
  }

  return url;
};

export const fromUrl = async (args: { url: string }) => {
  const url = new URL(args.url);
  if (url.hostname !== "github.com") {
    throw new Error("Invalid GitHub URL");
  }
  const pathParts = url.pathname.slice(1).split("/");
  const owner = pathParts[0];
  const repo = pathParts[1];
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL path");
  }

  const exists = await checkRepoExists(owner, repo);
  const result = { owner, repo };

  if (!exists) {
    return JSON.stringify({
      ...result,
      warning: "This repository may not exist or is not publicly accessible.",
    });
  }

  return JSON.stringify(result);
};

server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Convert Owner/Repo to GitHub URL",
  },
  description: "Converts a GitHub owner and repository name to a GitHub URL.",
  execute: toUrl,
  name: "to-url",
  parameters: z.object({
    owner: z.string().describe("The owner of the repository"),
    repo: z.string().describe("The name of the repository"),
  }),
});

server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Convert GitHub URL to Owner/Repo",
  },
  description: "Converts a GitHub URL to its owner and repository name.",
  execute: fromUrl,
  name: "from-url",
  parameters: z.object({
    url: z.string().url().describe("The GitHub URL to convert"),
  }),
});

server.start({
  transportType: "stdio",
});
