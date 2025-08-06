import { FastMCP } from "fastmcp";
import { z } from "zod";

const server = new FastMCP({
  name: "GitHub URL Converter",
  version: "1.0.0",
});

export const toUrl = async (args: { owner: string; repo: string }) => {
  return `https://github.com/${args.owner}/${args.repo}`;
};

export const fromUrl = async (args: { url: string }) => {
  const url = new URL(args.url);
  if (url.hostname !== "github.com") {
    throw new Error("Invalid GitHub URL");
  }
  const [owner, repo] = url.pathname.slice(1).split("/");
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL path");
  }
  return JSON.stringify({ owner, repo });
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
