# GitHub URL MCP Server

An MCP (Model Context Protocol) server for handling GitHub URLs with validation and parsing capabilities.

This server provides tools to convert between GitHub repository information and URLs, with built-in validation to check if repositories exist and are publicly accessible.

## Features

- **URL Building**: Convert owner/repo pairs to properly formatted GitHub URLs
- **URL Parsing**: Extract owner, repository, and path information from GitHub URLs
- **Repository Validation**: Check if repositories exist and are publicly accessible
- **Error Handling**: Comprehensive error messages for invalid inputs
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

**Returns:** `https://github.com/microsoft/vscode` (with warning if repository doesn't exist)

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
  "additionalPath": "tree/main/src"
}
```

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

## Usage with MCP Clients

Add this server to your MCP client configuration:

```json
{
  "mcpServers": {
    "github-url": {
      "command": "node",
      "args": ["path/to/dist/server.js"]
    }
  }
}
```

Or for development:

```json
{
  "mcpServers": {
    "github-url": {
      "command": "tsx",
      "args": ["path/to/src/server.ts"]
    }
  }
}
```

## Error Handling

The server provides detailed error messages for various scenarios:

- Invalid URL formats
- Non-GitHub URLs
- Missing owner or repository information
- Network timeouts
- Repository accessibility issues

## License

MIT License - see LICENSE file for details.
