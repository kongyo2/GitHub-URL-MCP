# GitHub URL MCP Server

An MCP (Model Context Protocol) server for handling GitHub URLs with validation and parsing capabilities.

This server provides tools to convert between GitHub repository information and URLs, with intelligent validation to distinguish between public repositories, private repositories, and non-existent repositories.

## Background

This tool was created to solve the problem where LLMs often struggle to properly handle GitHub-related tasks. Many LLMs have difficulty constructing correct GitHub URLs from repository information or parsing GitHub URLs to extract meaningful components. This server provides specialized tools that make these operations reliable and consistent for AI applications.

*Note: This issue might be specific to the LLMs I commonly use, but providing dedicated tools ensures consistent behavior across different AI systems.*

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

## Repository Status Detection

The server intelligently detects different repository states:

### Public Repositories
- Status: `"public"`
- Accessible: `true`
- Returns clean URL without warnings

### Private Repositories
- Status: `"private"`
- Accessible: `false`
- Detected by checking if the owner exists when repository returns 404
- Returns URL with 🔒 note indicating the repository is private

### Non-existent Repositories
- Status: `"not_found"`
- Accessible: `false`
- Detected when both repository and owner return 404
- Returns URL with ⚠️ warning indicating the repository doesn't exist

### Validation Errors
- Status: `"error"`
- Accessible: `false`
- Includes network timeouts, HTTP errors, etc.
- Returns URL with ❌ error message and details

## Error Handling

The server provides detailed error messages for various scenarios:

- Invalid URL formats
- Non-GitHub URLs
- Missing owner or repository information
- Network timeouts
- HTTP errors and unexpected responses
- Repository accessibility detection

## License

MIT License - see LICENSE file for details.

## Examples

### Building URLs

```bash
# Public repository
github/build_url { "owner": "microsoft", "repo": "vscode" }
# Returns: https://github.com/microsoft/vscode

# Private repository (assuming microsoft/private-repo exists but is private)
github/build_url { "owner": "microsoft", "repo": "private-repo" }
# Returns: https://github.com/microsoft/private-repo
#          🔒 Note: Repository exists but is private

# Non-existent repository
github/build_url { "owner": "nonexistent", "repo": "repo" }
# Returns: https://github.com/nonexistent/repo
#          ⚠️ Warning: Repository does not exist
```

### Parsing URLs

```bash
# Public repository
github/parse_url { "url": "https://github.com/microsoft/vscode" }
# Returns:
{
  "owner": "microsoft",
  "repo": "vscode",
  "url": "https://github.com/microsoft/vscode",
  "status": "public",
  "accessible": true
}

# Private repository
github/parse_url { "url": "https://github.com/microsoft/private-repo" }
# Returns:
{
  "owner": "microsoft",
  "repo": "private-repo",
  "url": "https://github.com/microsoft/private-repo",
  "status": "private",
  "accessible": false,
  "note": "Repository exists but is private"
}

# Non-existent repository
github/parse_url { "url": "https://github.com/nonexistent/repo" }
# Returns:
{
  "owner": "nonexistent",
  "repo": "repo",
  "url": "https://github.com/nonexistent/repo",
  "status": "not_found",
  "accessible": false,
  "warning": "Repository does not exist"
}
```