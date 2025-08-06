# GitHub URL Converter MCP Server

An MCP server for converting between GitHub URLs and owner/repository names.

This server provides two tools:

- `to-url`: Converts an owner and repository name into a full GitHub URL.
- `from-url`: Converts a GitHub URL into its owner and repository name.

This was created as a personal approach to solving the problem that current LLMs sometimes do not handle GitHub-related tools correctly (although this may just be an issue with the performance of the LLM I usually use).

## Development

To get started, clone the repository and install the dependencies.

```bash
git clone <your-repo-url>
cd <your-repo-name>
npm install
npm run dev
```

### Start the server

If you simply want to start the server, you can use the `start` script.

```bash
npm run start
```

However, you can also interact with the server using the `dev` script.

```bash
npm run dev
```

This will start the server and allow you to interact with it using the CLI.

### Testing

A good MCP server should have tests. You don't need to test the MCP server itself, but rather the tools you implement.

```bash
npm run test
```

In this project, we test the implementation of the `to-url` and `from-url` tools.

### Linting

Having a good linting setup reduces the friction for other developers to contribute to your project.

```bash
npm run lint
```

This boilerplate uses [Prettier](https://prettier.io/), [ESLint](https://eslint.org/) and [TypeScript ESLint](https://typescript-eslint.io/) to lint the code.

### Formatting

Use `npm run format` to format the code.

```bash
npm run format
```

### GitHub Actions

This repository has a GitHub Actions workflow that runs linting, formatting, tests, and publishes package updates to NPM using [semantic-release](https://semantic-release.gitbook.io/semantic-release/).

In order to use this workflow, you need to:

1. Add `NPM_TOKEN` to the repository secrets
   1. [Create a new automation token](https://www.npmjs.com/settings/punkpeye/tokens/new)
   2. Add token as `NPM_TOKEN` environment secret (Settings → Secrets and Variables → Actions → "Manage environment secrets" → "release" → Add environment secret)
1. Grant write access to the workflow (Settings → Actions → General → Workflow permissions → "Read and write permissions")
