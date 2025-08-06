# GitHub URL MCP Server

[![smithery badge](https://smithery.ai/badge/@kongyo2/github-url-mcp)](https://smithery.ai/server/@kongyo2/github-url-mcp)

An MCP (Model Context Protocol) server for handling GitHub URLs with validation and parsing capabilities.

This server provides tools to convert between GitHub repository information and URLs, with intelligent validation to distinguish between public repositories, private repositories, and non-existent repositories.

## Background

This tool was created to solve the problem where LLMs often struggle to properly handle GitHub-related tasks and fail to appropriately call MCP tools for GitHub operations. Many LLMs have difficulty constructing correct GitHub URLs from repository information, parsing GitHub URLs to extract meaningful components, or knowing when to use available MCP tools for GitHub-related requests. This server provides specialized tools that make these operations reliable and consistent for AI applications.

*Note: This issue might be specific to the LLMs I commonly use, but providing dedicated tools ensures consistent behavior across different AI systems. Or perhaps I should just quietly invest a fortune in Claude Code's max plan instead.*

## Features

- **URL Building**: Convert owner/repo pairs to properly formatted GitHub URLs
- **URL Parsing**: Extract owner, repository, and path information from GitHub URLs
- **Smart Repository Validation**: Distinguish between public, private, and non-existent repositories
- **Private Repository Detection**: Identify when a repository exists but is private
- **Comprehensive Status Reporting**: Clear status indicators for repository accessibility
- **Error Handling**: Detailed error messages for invalid inputs
- **No Authentication Required**: Works without GitHub API tokens
- **Timeout Protection**: Network requests have built-in timeouts

## Tools

### `github/build_url`

Converts GitHub owner and repository name into a properly formatted GitHub URL with validation.

**Parameters:**

- `owner` (string): GitHub username or organization name
- `repo` (string): Repository name

**Example:**

```json
{
  "owner": "microsoft",
  "repo": "vscode"
}
```

**Returns:** 
- `https://github.com/microsoft/vscode` (for public repositories)
- `https://github.com/owner/repo` + 🔒 Note (for private repositories)
- `https://github.com/owner/repo` + ⚠️ Warning (for non-existent repositories)
- `https://github.com/owner/repo` + ❌ Error (for validation errors)

### `github/parse_url`

Parses a GitHub URL to extract owner, repository name, and additional path information with validation.

**Parameters:**

- `url` (string): GitHub URL to parse

**Example:**

```json
{
  "url": "https://github.com/microsoft/vscode/tree/main/src"
}
```

**Returns:**

```json
{
  "owner": "microsoft",
  "repo": "vscode",
  "url": "https://github.com/microsoft/vscode",
  "additionalPath": "tree/main/src",
  "status": "public",
  "accessible": true
}
```

**Status Values:**
- `"public"`: Repository is publicly accessible
- `"private"`: Repository exists but is private
- `"not_found"`: Repository does not exist
- `"error"`: Validation error occurred

**Additional Fields:**
- `accessible`: Boolean indicating if the repository is publicly accessible
- `note`: Information message for private repositories
- `warning`: Warning message for non-existent repositories
- `error`: Error message for validation failures

## Development

### Setup

```bash
npm install
```

### Start the server

```bash
npm run start
```

### Development mode with CLI interaction

```bash
npm run dev
```

### Testing

```bash
npm run test
```

### Linting and formatting

```bash
npm run lint
npm run format
```

### Build

```bash
npm run build
```
