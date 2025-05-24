# MCP (Model Context Protocol) Setup Guide

## What are MCP Servers?

MCP servers are **separate processes** that provide tools and capabilities to AI assistants. They run independently and communicate via the Model Context Protocol.

## Current Status

✅ **Built-in Tools**: Fully functional (Calculator, Password Generator, etc.)
🔄 **MCP Integration**: Basic implementation ready, requires server installation
📦 **Available MCP Servers**: 100+ servers in database

## How to Install and Use MCP Servers

### 1. Install MCP Server Packages

Each MCP server is a separate npm package or Python package. Install the ones you want to use:

```bash
# TypeScript/JavaScript servers (using npx)
npx -y @modelcontextprotocol/server-memory

# Python servers (using uvx - recommended)
uvx mcp-server-git

# Python servers (using pip)
pip install mcp-server-git
python -m mcp_server_git
```

### 2. Set Up Environment Variables

Add the required API keys to your `.env` file:

```bash
# Common API Keys
BRAVE_API_KEY=your_brave_api_key
GITHUB_TOKEN=your_github_token
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
SLACK_BOT_TOKEN=your_slack_token
```

### 3. Test MCP Server Installation

Test if an MCP server works by running it directly:

```bash
# Test TypeScript server
npx -y @modelcontextprotocol/server-brave-search

# Test Python server
uvx mcp-server-git
```

### 4. Example Claude Desktop Configuration

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    },
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "path/to/git/repo"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

## 🌟 Reference Servers (Official)

### Web Search & Data
```bash
# Brave Search - Web and local search using Brave's Search API
npm install -g @modelcontextprotocol/server-brave-search
# Requires: BRAVE_API_KEY

# Fetch - Web scraping and content retrieval
npm install -g @modelcontextprotocol/server-fetch
# No API key required
```

### Development & Code
```bash
# GitHub - Repository management, issues, PRs
npm install -g @modelcontextprotocol/server-github
# Requires: GITHUB_PERSONAL_ACCESS_TOKEN

# File System - Local file operations
npm install -g @modelcontextprotocol/server-filesystem
# No API key required (use with caution!)

# Everything - Reference/test server with prompts, resources, and tools
npm install -g @modelcontextprotocol/server-everything
# No API key required
```

### Database & Storage
```bash
# PostgreSQL - Database operations
npm install -g @modelcontextprotocol/server-postgres
# Requires: POSTGRES_CONNECTION_STRING

# SQLite - Lightweight database
npm install -g @modelcontextprotocol/server-sqlite
# No API key required
```

### AI & Content Generation
```bash
# EverArt - AI image generation using various models
npm install -g @modelcontextprotocol/server-everart
# Requires: EVERART_API_KEY

# Puppeteer - Browser automation
npm install -g @modelcontextprotocol/server-puppeteer
# No API key required

# Sequential Thinking - Enhanced reasoning
npm install -g @modelcontextprotocol/server-sequential-thinking
# No API key required
```

### Cloud & Infrastructure
```bash
# AWS KB Retrieval - Retrieval from AWS Knowledge Base using Bedrock Agent Runtime
npm install -g @modelcontextprotocol/server-aws-kb-retrieval
# Requires: AWS credentials

# Kubernetes - Cluster management and monitoring
npm install -g @modelcontextprotocol/server-kubernetes
# Requires: kubectl configuration
```

### Communication & Collaboration
```bash
# Memory - Persistent memory across conversations
npm install -g @modelcontextprotocol/server-memory
# No API key required
```

## 🚀 Community Servers

### Web Browsing & Automation
```bash
# Playwright - Web automation and testing
uvx mcp-server-playwright

# Selenium - Web browser automation
uvx mcp-server-selenium

# AppleScript - macOS automation
uvx mcp-server-applescript

# YouTube Transcript - Extract transcripts from YouTube videos
uvx mcp-server-youtube-transcript
```

### Development Tools
```bash
# Git - Git repository operations
uvx mcp-server-git

# Docker - Container management
uvx mcp-server-docker

# GitLab - GitLab API integration
uvx mcp-server-gitlab

# Linear - Linear project management
uvx mcp-server-linear

# Jira - Atlassian Jira integration
uvx mcp-server-jira

# Azure DevOps - Microsoft Azure DevOps integration
uvx mcp-server-azuredevops

# Sentry - Error tracking and monitoring
uvx mcp-server-sentry

# Raycast - Raycast automation (macOS)
uvx mcp-server-raycast
```

### Databases & Analytics
```bash
# MySQL - MySQL database operations
uvx mcp-server-mysql

# MongoDB - MongoDB database operations
uvx mcp-server-mongodb

# Redis - Redis operations
uvx mcp-server-redis

# Neo4j - Graph database operations
uvx mcp-server-neo4j

# BigQuery - Google BigQuery analytics
uvx mcp-server-bigquery

# Snowflake - Snowflake data warehouse
uvx mcp-server-snowflake

# Supabase - Supabase backend services
uvx mcp-server-supabase

# Firebase - Firebase backend services
uvx mcp-server-firebase

# InfluxDB - Time series database
uvx mcp-server-influxdb
```

### Google Services
```bash
# Google Drive - File management and sharing
uvx mcp-server-google-drive

# Google Maps - Location and mapping services
uvx mcp-server-google-maps

# Google Sheets - Spreadsheet operations
uvx mcp-server-google-sheets

# Gmail - Email management
uvx mcp-server-gmail

# Google Calendar - Calendar management
uvx mcp-server-google-calendar

# Google Search - Google search integration
uvx mcp-server-google-search
```

### Communication & Social
```bash
# Slack - Team communication
uvx mcp-server-slack

# Discord - Discord bot integration
uvx mcp-server-discord

# WhatsApp - WhatsApp messaging
uvx mcp-server-whatsapp

# Telegram - Telegram bot integration
uvx mcp-server-telegram

# X (Twitter) - X/Twitter API integration
uvx mcp-server-x

# Mastodon - Mastodon social network
uvx mcp-server-mastodon

# Reddit - Reddit API integration
uvx mcp-server-reddit
```

### File & Document Management
```bash
# PDF Tools - PDF manipulation and extraction
uvx mcp-server-pdf

# Notion - Notion workspace integration
uvx mcp-server-notion

# Obsidian - Obsidian note management
uvx mcp-server-obsidian

# Confluence - Atlassian Confluence
uvx mcp-server-confluence

# SharePoint - Microsoft SharePoint
uvx mcp-server-sharepoint

# OneDrive - Microsoft OneDrive
uvx mcp-server-onedrive

# Dropbox - Dropbox file storage
uvx mcp-server-dropbox

# Box - Box cloud storage
uvx mcp-server-box
```

### E-commerce & Business
```bash
# Shopify - E-commerce platform integration
uvx mcp-server-shopify

# Stripe - Payment processing
uvx mcp-server-stripe

# PayPal - PayPal payment integration
uvx mcp-server-paypal

# Salesforce - CRM integration
uvx mcp-server-salesforce

# HubSpot - Marketing and sales platform
uvx mcp-server-hubspot

# Zendesk - Customer support platform
uvx mcp-server-zendesk

# Freshdesk - Customer support software
uvx mcp-server-freshdesk

# Intercom - Customer messaging platform
uvx mcp-server-intercom
```

### Media & Content
```bash
# Spotify - Music streaming service
uvx mcp-server-spotify

# YouTube - YouTube API integration
uvx mcp-server-youtube

# Twitch - Twitch streaming platform
uvx mcp-server-twitch

# Instagram - Instagram API integration
uvx mcp-server-instagram

# Unsplash - Stock photo service
uvx mcp-server-unsplash

# Pexels - Stock photo and video service
uvx mcp-server-pexels

# GIMP - Image editing automation
uvx mcp-server-gimp

# ImageMagick - Image manipulation
uvx mcp-server-imagemagick
```

### Task & Project Management
```bash
# Todoist - Task management
uvx mcp-server-todoist

# Trello - Project management boards
uvx mcp-server-trello

# Asana - Team project management
uvx mcp-server-asana

# Monday.com - Work management platform
uvx mcp-server-monday

# ClickUp - Productivity platform
uvx mcp-server-clickup

# Basecamp - Project management tool
uvx mcp-server-basecamp

# Airtable - Collaborative database
uvx mcp-server-airtable
```

### Cloud Platforms
```bash
# AWS - Amazon Web Services
uvx mcp-server-aws

# Azure - Microsoft Azure
uvx mcp-server-azure

# GCP - Google Cloud Platform
uvx mcp-server-gcp

# DigitalOcean - Cloud infrastructure
uvx mcp-server-digitalocean

# Vultr - Cloud computing platform
uvx mcp-server-vultr

# Linode - Cloud hosting
uvx mcp-server-linode

# Heroku - Platform as a service
uvx mcp-server-heroku

# Vercel - Deployment platform
uvx mcp-server-vercel

# Netlify - Web development platform
uvx mcp-server-netlify
```

### Analytics & Monitoring
```bash
# Google Analytics - Web analytics
uvx mcp-server-google-analytics

# Mixpanel - Product analytics
uvx mcp-server-mixpanel

# Amplitude - Digital analytics
uvx mcp-server-amplitude

# Segment - Customer data platform
uvx mcp-server-segment

# New Relic - Application monitoring
uvx mcp-server-newrelic

# Datadog - Monitoring and analytics
uvx mcp-server-datadog

# Grafana - Metrics dashboard
uvx mcp-server-grafana

# Prometheus - Monitoring system
uvx mcp-server-prometheus
```

### Utilities & Tools
```bash
# QR Code - QR code generation and reading
uvx mcp-server-qr

# Time - Time and timezone utilities
uvx mcp-server-time

# Weather - Weather information
uvx mcp-server-weather

# RSS - RSS feed reader
uvx mcp-server-rss

# URL Shortener - URL shortening service
uvx mcp-server-url-shortener

# Email Validator - Email validation utilities
uvx mcp-server-email-validator

# Password Generator - Secure password generation
uvx mcp-server-password-generator

# Base64 - Base64 encoding/decoding
uvx mcp-server-base64

# JSON Tools - JSON manipulation utilities
uvx mcp-server-json-tools

# XML Tools - XML manipulation utilities
uvx mcp-server-xml-tools

# CSV Tools - CSV manipulation utilities
uvx mcp-server-csv-tools

# Zip Tools - Archive manipulation
uvx mcp-server-zip-tools
```

### Cryptocurrency & Finance
```bash
# Coinbase - Cryptocurrency exchange
uvx mcp-server-coinbase

# Binance - Cryptocurrency exchange
uvx mcp-server-binance

# CoinGecko - Cryptocurrency data
uvx mcp-server-coingecko

# Alpha Vantage - Financial data
uvx mcp-server-alpha-vantage

# Yahoo Finance - Financial data
uvx mcp-server-yahoo-finance

# IEX Cloud - Financial data
uvx mcp-server-iex-cloud
```

### Meeting & Video
```bash
# Zoom - Video conferencing
uvx mcp-server-zoom

# Google Meet - Video conferencing
uvx mcp-server-google-meet

# Microsoft Teams - Collaboration platform
uvx mcp-server-teams

# Calendly - Scheduling tool
uvx mcp-server-calendly

# Loom - Video messaging
uvx mcp-server-loom
```

### Security & Identity
```bash
# 1Password - Password manager
uvx mcp-server-1password

# Bitwarden - Password manager
uvx mcp-server-bitwarden

# Auth0 - Identity platform
uvx mcp-server-auth0

# Okta - Identity management
uvx mcp-server-okta

# Vault - Secrets management
uvx mcp-server-vault
```

### Specialized Tools
```bash
# IFTTT - Automation platform
uvx mcp-server-ifttt

# Zapier - Workflow automation
uvx mcp-server-zapier

# Webhook - Webhook utilities
uvx mcp-server-webhook

# SSH - Secure shell operations
uvx mcp-server-ssh

# FTP - File transfer protocol
uvx mcp-server-ftp

# SFTP - Secure file transfer
uvx mcp-server-sftp

# Ping - Network connectivity testing
uvx mcp-server-ping

# DNS - DNS lookup utilities
uvx mcp-server-dns

# Whois - Domain information lookup
uvx mcp-server-whois

# SSL Certificate - SSL certificate checking
uvx mcp-server-ssl-cert
```

## Environment Variables Reference

Create a `.env.local` file with the required variables for your chosen servers:

```bash
# Web Services
BRAVE_API_KEY=your_brave_api_key
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Development Platforms
GITHUB_TOKEN=ghp_your_github_token
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_github_token
GITLAB_TOKEN=your_gitlab_token
LINEAR_API_KEY=your_linear_key
JIRA_TOKEN=your_jira_token

# Databases
POSTGRES_CONNECTION_STRING=postgresql://user:pass@localhost:5432/db
MYSQL_CONNECTION_STRING=mysql://user:pass@localhost:3306/db
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/db
REDIS_URL=redis://localhost:6379

# Cloud Platforms
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_secret
GCP_SERVICE_ACCOUNT_KEY=your_gcp_key

# Communication
SLACK_BOT_TOKEN=xoxb_your_slack_token
DISCORD_BOT_TOKEN=your_discord_token
TELEGRAM_BOT_TOKEN=your_telegram_token

# E-commerce & Business
SHOPIFY_API_KEY=your_shopify_key
STRIPE_SECRET_KEY=sk_your_stripe_key
SALESFORCE_TOKEN=your_salesforce_token
HUBSPOT_API_KEY=your_hubspot_key

# Analytics
GOOGLE_ANALYTICS_KEY=your_ga_key
MIXPANEL_TOKEN=your_mixpanel_token
AMPLITUDE_API_KEY=your_amplitude_key

# Media & Content
SPOTIFY_CLIENT_ID=your_spotify_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
YOUTUBE_API_KEY=your_youtube_key
UNSPLASH_ACCESS_KEY=your_unsplash_key

# Finance
COINBASE_API_KEY=your_coinbase_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# Task Management
TODOIST_API_TOKEN=your_todoist_token
TRELLO_API_KEY=your_trello_key
ASANA_ACCESS_TOKEN=your_asana_token

# File Storage
DROPBOX_ACCESS_TOKEN=your_dropbox_token
ONEDRIVE_CLIENT_ID=your_onedrive_id
BOX_CLIENT_ID=your_box_id

# Weather & Utilities
OPENWEATHER_API_KEY=your_weather_key
WEATHER_API_KEY=your_weather_key

# Security
ONEPASSWORD_SECRET_KEY=your_1password_key
BITWARDEN_CLIENT_ID=your_bitwarden_id
VAULT_TOKEN=your_vault_token
```

## Installation Commands by Language

### TypeScript/JavaScript (NPM)
```bash
npm install -g @modelcontextprotocol/server-[name]
npx -y @modelcontextprotocol/server-[name]
```

### Python (UVX - Recommended)
```bash
uvx mcp-server-[name]
```

### Python (PIP)
```bash
pip install mcp-server-[name]
python -m mcp_server_[name]
```

## Security Considerations

⚠️ **Important Security Notes**:

1. **File System Access**: Be very careful with filesystem MCP servers
2. **API Keys**: Never commit API keys to version control
3. **Database Access**: Limit database permissions for MCP servers
4. **Network Access**: Some MCP servers make external network calls
5. **Permissions**: Only install servers you trust and need
6. **Environment Variables**: Use proper secret management

## Troubleshooting

### Server Won't Start
```bash
# Check if package is installed (npm)
npm list -g @modelcontextprotocol/server-[name]

# Check if package is installed (python)
uvx --help

# Check environment variables
echo $API_KEY_NAME

# Run with debug output
DEBUG=* npx @modelcontextprotocol/server-[name]
```

### Connection Errors
- Ensure environment variables are properly set
- Check that the MCP server process can start
- Verify API keys have correct permissions
- Some servers may need additional setup (webhooks, OAuth, etc.)

### Tool Not Available in Chat
- Restart the development server
- Check browser console for errors
- Verify the tool is enabled in Tool Management

## Next Steps

1. **Choose Your Tools**: Start with 1-2 MCP servers you actually need
2. **Get API Keys**: Set up accounts for the services you want to use
3. **Install & Test**: Install the MCP server packages and test them
4. **Configure Client**: Add servers to your MCP client configuration
5. **Start Using**: Ask the AI to use the tools in conversation!

## Popular Server Combinations

### Developer Workflow
- GitHub + Linear + Slack + PostgreSQL

### Content Creator
- YouTube + Notion + Google Drive + Unsplash

### Business Analyst
- Google Sheets + Salesforce + Stripe + Google Analytics

### DevOps Engineer
- AWS + Docker + Kubernetes + Datadog + Slack

### Data Analyst
- BigQuery + Google Sheets + Jupyter + Grafana

Most servers are disabled by default - enable and configure only the ones you need! 