import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive MCP servers import...')

  // Comprehensive MCP Servers from https://github.com/modelcontextprotocol/servers
  const mcpServers = [
    // 🌟 REFERENCE SERVERS (Official)
    
    // Web Search & Data
    {
      name: 'Brave Search',
      description: 'Web and local search using Brave\'s Search API',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-brave-search',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Fetch',
      description: 'Web scraping and content retrieval',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-fetch',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // Development & Code
    {
      name: 'GitHub',
      description: 'Repository management, issues, PRs',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-github',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Filesystem',
      description: 'Local file operations',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-filesystem',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Everything',
      description: 'Reference/test server with prompts, resources, and tools',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-everything',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // Database & Storage
    {
      name: 'PostgreSQL',
      description: 'Database operations',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-postgres',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'SQLite',
      description: 'Lightweight database',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-sqlite',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // AI & Content Generation
    {
      name: 'EverArt',
      description: 'AI image generation using various models',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-everart',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 45000
    },
    {
      name: 'Puppeteer',
      description: 'Browser automation',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-puppeteer',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 60000
    },
    {
      name: 'Sequential Thinking',
      description: 'Enhanced reasoning',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-sequential-thinking',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // Cloud & Infrastructure
    {
      name: 'AWS KB Retrieval',
      description: 'Retrieval from AWS Knowledge Base using Bedrock Agent Runtime',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-aws-kb-retrieval',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Kubernetes',
      description: 'Cluster management and monitoring',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-kubernetes',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // Communication & Collaboration
    {
      name: 'Memory',
      description: 'Persistent memory across conversations',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'npx -y @modelcontextprotocol/server-memory',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // 🚀 COMMUNITY SERVERS

    // Web Browsing & Automation
    {
      name: 'Playwright',
      description: 'Web automation and testing',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-playwright',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 60000
    },
    {
      name: 'Selenium',
      description: 'Web browser automation',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-selenium',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 60000
    },
    {
      name: 'AppleScript',
      description: 'macOS automation',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-applescript',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'YouTube Transcript',
      description: 'Extract transcripts from YouTube videos',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-youtube-transcript',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // Development Tools
    {
      name: 'Git',
      description: 'Git repository operations',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-git',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Docker',
      description: 'Container management',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-docker',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'GitLab',
      description: 'GitLab API integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-gitlab',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Linear',
      description: 'Linear project management',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-linear',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Jira',
      description: 'Atlassian Jira integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-jira',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Azure DevOps',
      description: 'Microsoft Azure DevOps integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-azuredevops',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Sentry',
      description: 'Error tracking and monitoring',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-sentry',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Raycast',
      description: 'Raycast automation (macOS)',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-raycast',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // Databases & Analytics
    {
      name: 'MySQL',
      description: 'MySQL database operations',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-mysql',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'MongoDB',
      description: 'MongoDB database operations',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-mongodb',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Redis',
      description: 'Redis operations',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-redis',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Neo4j',
      description: 'Graph database operations',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-neo4j',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'BigQuery',
      description: 'Google BigQuery analytics',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-bigquery',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Snowflake',
      description: 'Snowflake data warehouse',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-snowflake',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Supabase',
      description: 'Supabase backend services',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-supabase',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Firebase',
      description: 'Firebase backend services',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-firebase',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'InfluxDB',
      description: 'Time series database',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-influxdb',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // Google Services
    {
      name: 'Google Drive',
      description: 'File management and sharing',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-google-drive',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Google Maps',
      description: 'Location and mapping services',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-google-maps',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Google Sheets',
      description: 'Spreadsheet operations',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-google-sheets',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Gmail',
      description: 'Email management',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-gmail',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Google Calendar',
      description: 'Calendar management',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-google-calendar',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Google Search',
      description: 'Google search integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-google-search',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // Communication & Social
    {
      name: 'Slack',
      description: 'Team communication',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-slack',
      mcpAuthType: 'BEARER_TOKEN' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Discord',
      description: 'Discord bot integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-discord',
      mcpAuthType: 'BEARER_TOKEN' as const,
      mcpTimeout: 30000
    },
    {
      name: 'WhatsApp',
      description: 'WhatsApp messaging',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-whatsapp',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Telegram',
      description: 'Telegram bot integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-telegram',
      mcpAuthType: 'BEARER_TOKEN' as const,
      mcpTimeout: 30000
    },
    {
      name: 'X (Twitter)',
      description: 'X/Twitter API integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-x',
      mcpAuthType: 'BEARER_TOKEN' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Mastodon',
      description: 'Mastodon social network',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-mastodon',
      mcpAuthType: 'BEARER_TOKEN' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Reddit',
      description: 'Reddit API integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-reddit',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // File & Document Management
    {
      name: 'PDF Tools',
      description: 'PDF manipulation and extraction',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-pdf',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Notion',
      description: 'Notion workspace integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-notion',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Obsidian',
      description: 'Obsidian note management',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-obsidian',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Confluence',
      description: 'Atlassian Confluence',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-confluence',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'SharePoint',
      description: 'Microsoft SharePoint',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-sharepoint',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'OneDrive',
      description: 'Microsoft OneDrive',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-onedrive',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Dropbox',
      description: 'Dropbox file storage',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-dropbox',
      mcpAuthType: 'BEARER_TOKEN' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Box',
      description: 'Box cloud storage',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-box',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // E-commerce & Business
    {
      name: 'Shopify',
      description: 'E-commerce platform integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-shopify',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Stripe',
      description: 'Payment processing',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-stripe',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'PayPal',
      description: 'PayPal payment integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-paypal',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Salesforce',
      description: 'CRM integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-salesforce',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'HubSpot',
      description: 'Marketing and sales platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-hubspot',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Zendesk',
      description: 'Customer support platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-zendesk',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Freshdesk',
      description: 'Customer support software',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-freshdesk',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Intercom',
      description: 'Customer messaging platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-intercom',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // Media & Content
    {
      name: 'Spotify',
      description: 'Music streaming service',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-spotify',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'YouTube',
      description: 'YouTube API integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-youtube',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Twitch',
      description: 'Twitch streaming platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-twitch',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Instagram',
      description: 'Instagram API integration',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-instagram',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Unsplash',
      description: 'Stock photo service',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-unsplash',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Pexels',
      description: 'Stock photo and video service',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-pexels',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'GIMP',
      description: 'Image editing automation',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-gimp',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 45000
    },
    {
      name: 'ImageMagick',
      description: 'Image manipulation',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-imagemagick',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // Task & Project Management
    {
      name: 'Todoist',
      description: 'Task management',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-todoist',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Trello',
      description: 'Project management boards',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-trello',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Asana',
      description: 'Team project management',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-asana',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Monday.com',
      description: 'Work management platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-monday',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'ClickUp',
      description: 'Productivity platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-clickup',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Basecamp',
      description: 'Project management tool',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-basecamp',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Airtable',
      description: 'Collaborative database',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-airtable',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // Cloud Platforms
    {
      name: 'AWS',
      description: 'Amazon Web Services',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-aws',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Azure',
      description: 'Microsoft Azure',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-azure',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'GCP',
      description: 'Google Cloud Platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-gcp',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'DigitalOcean',
      description: 'Cloud infrastructure',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-digitalocean',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Vultr',
      description: 'Cloud computing platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-vultr',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Linode',
      description: 'Cloud hosting',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-linode',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Heroku',
      description: 'Platform as a service',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-heroku',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Vercel',
      description: 'Deployment platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-vercel',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Netlify',
      description: 'Web development platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-netlify',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // Analytics & Monitoring
    {
      name: 'Google Analytics',
      description: 'Web analytics',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-google-analytics',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Mixpanel',
      description: 'Product analytics',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-mixpanel',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Amplitude',
      description: 'Digital analytics',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-amplitude',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Segment',
      description: 'Customer data platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-segment',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'New Relic',
      description: 'Application monitoring',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-newrelic',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Datadog',
      description: 'Monitoring and analytics',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-datadog',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Grafana',
      description: 'Metrics dashboard',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-grafana',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Prometheus',
      description: 'Monitoring system',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-prometheus',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // Utilities & Tools
    {
      name: 'QR Code',
      description: 'QR code generation and reading',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-qr',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Time',
      description: 'Time and timezone utilities',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-time',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'mcp-server-weather',
      description: 'Weather information',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-weather',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'RSS',
      description: 'RSS feed reader',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-rss',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'mcp-server-url-shortener',
      description: 'URL shortening service',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-url-shortener',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'mcp-server-email-validator',
      description: 'Email validation utilities',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-email-validator',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'mcp-server-password-generator',
      description: 'Secure password generation',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-password-generator',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Base64',
      description: 'Base64 encoding/decoding',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-base64',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'JSON Tools',
      description: 'JSON manipulation utilities',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-json-tools',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'XML Tools',
      description: 'XML manipulation utilities',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-xml-tools',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'CSV Tools',
      description: 'CSV manipulation utilities',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-csv-tools',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Zip Tools',
      description: 'Archive manipulation',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-zip-tools',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },

    // Cryptocurrency & Finance
    {
      name: 'Coinbase',
      description: 'Cryptocurrency exchange',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-coinbase',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Binance',
      description: 'Cryptocurrency exchange',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-binance',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'CoinGecko',
      description: 'Cryptocurrency data',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-coingecko',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Alpha Vantage',
      description: 'Financial data',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-alpha-vantage',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Yahoo Finance',
      description: 'Financial data',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-yahoo-finance',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'IEX Cloud',
      description: 'Financial data',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-iex-cloud',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // Meeting & Video
    {
      name: 'Zoom',
      description: 'Video conferencing',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-zoom',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Google Meet',
      description: 'Video conferencing',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-google-meet',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Microsoft Teams',
      description: 'Collaboration platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-teams',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Calendly',
      description: 'Scheduling tool',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-calendly',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Loom',
      description: 'Video messaging',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-loom',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // Security & Identity
    {
      name: '1Password',
      description: 'Password manager',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-1password',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Bitwarden',
      description: 'Password manager',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-bitwarden',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Auth0',
      description: 'Identity platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-auth0',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Okta',
      description: 'Identity management',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-okta',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Vault',
      description: 'Secrets management',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-vault',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },

    // Specialized Tools
    {
      name: 'IFTTT',
      description: 'Automation platform',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-ifttt',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Zapier',
      description: 'Workflow automation',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-zapier',
      mcpAuthType: 'API_KEY' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Webhook',
      description: 'Webhook utilities',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-webhook',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'SSH',
      description: 'Secure shell operations',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-ssh',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'FTP',
      description: 'File transfer protocol',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-ftp',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'SFTP',
      description: 'Secure file transfer',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-sftp',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Ping',
      description: 'Network connectivity testing',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-ping',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'DNS',
      description: 'DNS lookup utilities',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-dns',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'Whois',
      description: 'Domain information lookup',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-whois',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    },
    {
      name: 'SSL Certificate',
      description: 'SSL certificate checking',
      toolType: 'MCP' as const,
      mcpConnectionUrl: 'uvx mcp-server-ssl-cert',
      mcpAuthType: 'NONE' as const,
      mcpTimeout: 30000
    }
  ]

  console.log('📦 Creating comprehensive MCP servers...')
  
  let createdCount = 0
  let skippedCount = 0
  let errorCount = 0

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
        data: mcpServer,
      })
      console.log(`✓ Created MCP server: ${mcpServer.name}`)
      createdCount++
    } catch (error) {
      console.error(`❌ Failed to create ${mcpServer.name}:`, error)
      errorCount++
    }
  }

  console.log('✅ Comprehensive MCP servers import completed!')
  console.log(`📊 Created: ${createdCount} servers`)
  console.log(`⏭️  Skipped: ${skippedCount} servers (already existed)`)
  console.log(`❌ Errors: ${errorCount} servers`)
  console.log(`🎯 Total available: ${mcpServers.length} MCP servers`)
  console.log('')
  console.log('🎨 Server categories added:')
  console.log('  • Reference Servers (Official): 13 servers')
  console.log('  • Web Browsing & Automation: 4 servers')
  console.log('  • Development Tools: 8 servers')
  console.log('  • Databases & Analytics: 9 servers')
  console.log('  • Google Services: 6 servers')
  console.log('  • Communication & Social: 7 servers')
  console.log('  • File & Document Management: 8 servers')
  console.log('  • E-commerce & Business: 8 servers')
  console.log('  • Media & Content: 8 servers')
  console.log('  • Task & Project Management: 7 servers')
  console.log('  • Cloud Platforms: 9 servers')
  console.log('  • Analytics & Monitoring: 8 servers')
  console.log('  • Utilities & Tools: 12 servers')
  console.log('  • Cryptocurrency & Finance: 6 servers')
  console.log('  • Meeting & Video: 5 servers')
  console.log('  • Security & Identity: 5 servers')
  console.log('  • Specialized Tools: 10 servers')
  console.log('')
  console.log('⚙️  All servers will be disabled by default for users.')
  console.log('   Users can enable and configure the ones they need in Settings!')
}

main()
  .catch((e) => {
    console.error('💥 Error during MCP servers import:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 