import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { spawn } from 'child_process'

export interface MCPTool {
  name: string
  description?: string
  inputSchema: any
}

export interface MCPServerConfig {
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
}

export class MCPManager {
  private clients: Map<string, { client: Client; transport: StdioClientTransport }> = new Map()

  async connectToServer(config: MCPServerConfig): Promise<MCPTool[]> {
    try {
      // Parse command (handle npx commands)
      const [command, ...args] = config.command.split(' ')
      
      // Create transport with the MCP server process
      const envVars = Object.fromEntries(
        Object.entries({ ...process.env, ...config.env })
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      )
      
      const transport = new StdioClientTransport({
        command,
        args: [...args, ...(config.args || [])],
        env: envVars
      })

      // Create MCP client
      const client = new Client(
        {
          name: `chat-app-${config.name}`,
          version: '1.0.0'
        },
        {
          capabilities: {
            tools: {}
          }
        }
      )

      // Connect to the server
      await client.connect(transport)

      // Store the connection
      this.clients.set(config.name, { client, transport })

      // Get available tools from the server
      const tools = await client.listTools()
      
      return tools.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))

    } catch (error) {
      console.error(`Failed to connect to MCP server ${config.name}:`, error)
      throw error
    }
  }

  async callTool(serverName: string, toolName: string, arguments_: any): Promise<any> {
    const connection = this.clients.get(serverName)
    if (!connection) {
      throw new Error(`No connection to MCP server: ${serverName}`)
    }

    try {
      const result = await connection.client.callTool({
        name: toolName,
        arguments: arguments_
      })

      return result.content
    } catch (error) {
      console.error(`Failed to call tool ${toolName} on server ${serverName}:`, error)
      throw error
    }
  }

  async disconnectFromServer(serverName: string): Promise<void> {
    const connection = this.clients.get(serverName)
    if (connection) {
      await connection.client.close()
      this.clients.delete(serverName)
    }
  }

  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.clients.keys()).map(serverName =>
      this.disconnectFromServer(serverName)
    )
    await Promise.all(disconnectPromises)
  }

  isConnected(serverName: string): boolean {
    return this.clients.has(serverName)
  }

  getConnectedServers(): string[] {
    return Array.from(this.clients.keys())
  }
}

// Singleton instance
export const mcpManager = new MCPManager()

// Example server configurations
export const MCP_SERVER_CONFIGS: Record<string, MCPServerConfig> = {
  'brave-search': {
    name: 'brave-search',
    command: 'npx @modelcontextprotocol/server-brave-search',
    env: {
      BRAVE_API_KEY: process.env.BRAVE_API_KEY || ''
    }
  },
  'github': {
    name: 'github',
    command: 'npx @modelcontextprotocol/server-github',
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || ''
    }
  },
  'postgres': {
    name: 'postgres',
    command: 'npx @modelcontextprotocol/server-postgres',
    env: {
      POSTGRES_CONNECTION_STRING: process.env.DATABASE_URL || ''
    }
  }
} 