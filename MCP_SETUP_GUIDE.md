# MCP (Model Context Protocol) Setup Guide

## What are MCP Servers?

MCP servers are **separate processes** that provide tools and capabilities to AI assistants. They run independently and communicate via the Model Context Protocol.

## Current Status

✅ **Built-in Tools**: Fully functional (Calculator, Password Generator, etc.)
🔄 **MCP Integration**: Basic implementation ready, requires server installation
📦 **Available MCP Servers**: 50+ servers in database (currently placeholders)

## How to Install and Use MCP Servers

### 1. Install MCP Server Packages

Each MCP server is a separate npm package. Install the ones you want to use:

```bash
# Web Search (requires Brave API key)
npm install -g @modelcontextprotocol/server-brave-search

# GitHub Integration (requires GitHub token)
npm install -g @modelcontextprotocol/server-github

# Database access
npm install -g @modelcontextprotocol/server-postgres

# File system access
npm install -g @modelcontextprotocol/server-filesystem
```

### 2. Set Up Environment Variables

Add the required API keys to your `.env` file:

```bash
# Brave Search API
BRAVE_API_KEY=your_brave_api_key

# GitHub API
GITHUB_TOKEN=your_github_token

# Other APIs as needed...
```

### 3. Test MCP Server Installation

Test if an MCP server works by running it directly:

```bash
# Test Brave Search server
npx @modelcontextprotocol/server-brave-search

# Test GitHub server (needs GITHUB_TOKEN env var)
GITHUB_PERSONAL_ACCESS_TOKEN=your_token npx @modelcontextprotocol/server-github
```

### 4. Test MCP Integration in Chat App

With the servers installed, test the integration:

```bash
# Test MCP connectivity
curl http://localhost:3000/api/mcp/test
```

## Popular MCP Servers & Installation

### 🔍 **Web Search & Data**
```bash
# Brave Search - Web search with API
npm install -g @modelcontextprotocol/server-brave-search
# Requires: BRAVE_API_KEY

# Fetch - Web scraping and content retrieval
npm install -g @modelcontextprotocol/server-fetch
# No API key required
```

### 💻 **Development Tools**
```bash
# GitHub - Repository management, issues, PRs
npm install -g @modelcontextprotocol/server-github
# Requires: GITHUB_PERSONAL_ACCESS_TOKEN

# File System - Local file operations
npm install -g @modelcontextprotocol/server-filesystem
# No API key required (use with caution!)
```

### 🗄️ **Databases**
```bash
# PostgreSQL - Database operations
npm install -g @modelcontextprotocol/server-postgres
# Requires: POSTGRES_CONNECTION_STRING

# SQLite - Lightweight database
npm install -g @modelcontextprotocol/server-sqlite
# No API key required
```

### 🤖 **AI & Content**
```bash
# Puppeteer - Browser automation
npm install -g @modelcontextprotocol/server-puppeteer
# No API key required

# Sequential Thinking - Enhanced reasoning
npm install -g @modelcontextprotocol/server-sequential-thinking
# No API key required
```

## Environment Variables Needed

Create a `.env.local` file with the following (add only the ones you need):

```bash
# Web Search
BRAVE_API_KEY=your_brave_api_key

# GitHub
GITHUB_TOKEN=ghp_your_github_token

# Database (if using Postgres MCP server)
POSTGRES_CONNECTION_STRING=postgresql://user:pass@localhost:5432/db

# Google Services (if using Google MCP servers)
GOOGLE_API_KEY=your_google_api_key

# Other services...
SLACK_BOT_TOKEN=xoxb_your_slack_token
OPENAI_API_KEY=sk_your_openai_key
```

## How MCP Tools Appear in Chat

Once installed and configured:

1. **Tool Selection**: MCP tools appear in the tool picker alongside built-in tools
2. **AI Integration**: Anthropic can use them automatically when relevant
3. **Real Execution**: Tools actually connect to external services
4. **Live Results**: Real data returned from APIs/services

## Example: Setting Up Brave Search

1. **Get API Key**: Sign up at [Brave Search API](https://api.search.brave.com/)

2. **Install Server**:
   ```bash
   npm install -g @modelcontextprotocol/server-brave-search
   ```

3. **Add to Environment**:
   ```bash
   echo "BRAVE_API_KEY=your_api_key_here" >> .env.local
   ```

4. **Test Installation**:
   ```bash
   BRAVE_API_KEY=your_key npx @modelcontextprotocol/server-brave-search
   ```

5. **Use in Chat**: Select "Brave Search" tool and ask: "Search for latest AI news"

## Troubleshooting

### Server Won't Start
```bash
# Check if package is installed
npm list -g @modelcontextprotocol/server-brave-search

# Check if API key is set
echo $BRAVE_API_KEY

# Run with debug output
DEBUG=* npx @modelcontextprotocol/server-brave-search
```

### Connection Errors
- Ensure environment variables are properly set
- Check that the MCP server process can start
- Verify API keys have correct permissions
- Some servers may need additional setup (webhooks, OAuth, etc.)

### Tool Not Available in Chat
- Restart the Next.js development server
- Check browser console for errors
- Verify the tool is enabled in Tool Management

## Security Considerations

⚠️ **Important Security Notes**:

1. **File System Access**: Be very careful with filesystem MCP servers
2. **API Keys**: Never commit API keys to version control
3. **Database Access**: Limit database permissions for MCP servers
4. **Network Access**: Some MCP servers make external network calls

## Next Steps

1. **Choose Your Tools**: Start with 1-2 MCP servers you actually need
2. **Get API Keys**: Set up accounts for the services you want to use
3. **Install & Test**: Install the MCP server packages and test them
4. **Configure Chat**: Enable the tools in your chat application
5. **Start Using**: Ask the AI to use the tools in conversation!

## Available MCP Servers

See the full list of 50+ available MCP servers in the Tool Management page. Popular categories:

- **Development**: GitHub, GitLab, Git, Docker, Kubernetes
- **Productivity**: Notion, Linear, Jira, Todoist, Trello
- **Communication**: Slack, Discord, Email
- **Data**: PostgreSQL, SQLite, Google Drive
- **Utilities**: QR codes, PDF tools, image processing

Most are disabled by default - enable and configure the ones you need! 