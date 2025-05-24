import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting MCP servers import...')

  // MCP Reference Servers from https://github.com/modelcontextprotocol/servers
  const mcpServers = [
    // Development & Programming Tools
    {
      name: 'GitHub',
      description: 'Search repositories, manage issues, view files and commits using GitHub API',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-github',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'GitLab',
      description: 'Interact with GitLab API for project management, issues, and merge requests',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-gitlab',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Git',
      description: 'Execute Git commands for repository operations and version control',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-git',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // File System & Storage
    {
      name: 'Filesystem',
      description: 'Read, write, and manage files and directories securely',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-filesystem',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Google Drive',
      description: 'Access and manage files in Google Drive',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-gdrive',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // Database & Data
    {
      name: 'PostgreSQL',
      description: 'Connect to and query PostgreSQL databases',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-postgres',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'SQLite',
      description: 'Query and manage SQLite databases',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-sqlite',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // Web & Search
    {
      name: 'Brave Search',
      description: 'Search the web and access real-time information using Brave Search API',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-brave-search',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Fetch',
      description: 'Fetch and convert web content, including HTML to markdown conversion',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-fetch',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Puppeteer',
      description: 'Web automation, scraping, and PDF generation using headless browser',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-puppeteer',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 60000
    },

    // AI & Image Generation
    {
      name: 'EverArt',
      description: 'Generate high-quality AI images and artwork',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-everart',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 45000
    },

    // Communication & Productivity
    {
      name: 'Slack',
      description: 'Send messages and interact with Slack workspaces',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-slack',
      mcpAuthType: 'BEARER_TOKEN' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Google Maps',
      description: 'Search locations, get directions, and access maps data',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-google-maps',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // Memory & Context
    {
      name: 'Memory',
      description: 'Persistent memory storage for conversations and context',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @modelcontextprotocol/server-memory',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // Community MCP Servers (Popular ones)
    {
      name: 'YouTube',
      description: 'Search and retrieve YouTube video information and transcripts',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx server-youtube',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Linear',
      description: 'Manage Linear issues, projects, and team workflows',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @linear/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Notion',
      description: 'Read and write Notion pages and databases',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @notion/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Airtable',
      description: 'Access and manipulate Airtable bases and records',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @airtable/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'AWS S3',
      description: 'Upload, download, and manage files in Amazon S3 buckets',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @aws/s3-mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Docker',
      description: 'Manage Docker containers, images, and compose services',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @docker/mcp-server',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Kubernetes',
      description: 'Deploy and manage Kubernetes resources and clusters',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @kubernetes/mcp-server',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Sentry',
      description: 'Monitor application errors and performance issues',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @sentry/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Jira',
      description: 'Create and manage Jira issues, projects, and workflows',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @atlassian/jira-mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Confluence',
      description: 'Search and manage Confluence pages and spaces',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @atlassian/confluence-mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Shopify',
      description: 'Manage Shopify store products, orders, and customers',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @shopify/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Stripe',
      description: 'Handle payments, customers, and billing operations',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @stripe/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Twilio',
      description: 'Send SMS, make calls, and manage communication services',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @twilio/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'SendGrid',
      description: 'Send emails and manage email marketing campaigns',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @sendgrid/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Calendar',
      description: 'Manage calendar events and scheduling across platforms',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @calendar/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Todoist',
      description: 'Create and manage tasks and projects in Todoist',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @todoist/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Trello',
      description: 'Manage Trello boards, cards, and team collaboration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @trello/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Discord',
      description: 'Send messages and interact with Discord servers',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @discord/mcp-server',
      mcpAuthType: 'BEARER_TOKEN' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Reddit',
      description: 'Search posts, comments, and interact with Reddit communities',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @reddit/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Twitter/X',
      description: 'Post tweets, search content, and manage Twitter/X interactions',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @twitter/mcp-server',
      mcpAuthType: 'BEARER_TOKEN' as const,
      mcpTimeout: 30000
    },
    {
      name: 'HackerNews',
      description: 'Search and read Hacker News posts and comments',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @hackernews/mcp-server',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Weather',
      description: 'Get current weather conditions and forecasts',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @weather/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'News API',
      description: 'Search and retrieve latest news articles from various sources',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @newsapi/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Stock Market',
      description: 'Get real-time stock prices, market data, and financial information',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @stocks/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Currency Exchange',
      description: 'Get real-time currency exchange rates and conversion',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @currency/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Translation',
      description: 'Translate text between different languages',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @translate/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'QR Code',
      description: 'Generate and decode QR codes',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @qrcode/mcp-server',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'PDF Tools',
      description: 'Create, merge, split, and manipulate PDF documents',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @pdf/mcp-server',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Image Processing',
      description: 'Resize, crop, filter, and manipulate images',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @image/mcp-server',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'JSON Tools',
      description: 'Parse, validate, format, and manipulate JSON data',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @json/mcp-server',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'URL Shortener',
      description: 'Create and manage shortened URLs',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @urlshortener/mcp-server',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Password Generator',
      description: 'Generate secure passwords and check password strength',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @password/mcp-server',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Hash Calculator',
      description: 'Calculate MD5, SHA1, SHA256, and other hash values',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx @hash/mcp-server',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    }
  ]

  console.log('📦 Creating MCP servers...')
  
  let createdCount = 0
  let skippedCount = 0

  // Create all MCP servers (skip if already exists)
  for (const mcpServer of mcpServers) {
    try {
      // Check if tool already exists
      const existingTool = await prisma.tool.findFirst({
        where: { name: mcpServer.name }
      })

      if (existingTool) {
        console.log(`⏭️  Skipped: ${mcpServer.name} (already exists)`)
        skippedCount++
        continue
      }

      await prisma.tool.create({
        data: {
          ...mcpServer,
          enabled: false // Start disabled so users can enable and configure as needed
        },
      })
      console.log(`✓ Created MCP server: ${mcpServer.name}`)
      createdCount++
    } catch (error) {
      console.error(`❌ Failed to create ${mcpServer.name}:`, error)
    }
  }

  console.log('✅ MCP servers import completed!')
  console.log(`📊 Created: ${createdCount} tools`)
  console.log(`⏭️  Skipped: ${skippedCount} tools (already existed)`)
  console.log(`🎯 Total available: ${mcpServers.length} MCP servers`)
}

main()
  .catch((e) => {
    console.error('❌ Error during MCP servers import:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 