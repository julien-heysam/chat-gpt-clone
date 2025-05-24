import { NextRequest, NextResponse } from "next/server"
import { mcpManager, MCP_SERVER_CONFIGS } from "@/lib/mcp-client"

export async function GET() {
  try {
    // Test connecting to Brave Search (if API key is available)
    const braveConfig = MCP_SERVER_CONFIGS['brave-search']
    
    if (!process.env.BRAVE_API_KEY) {
      return NextResponse.json({
        status: 'skipped',
        message: 'BRAVE_API_KEY not configured',
        availableServers: Object.keys(MCP_SERVER_CONFIGS)
      })
    }

    try {
      const tools = await mcpManager.connectToServer(braveConfig)
      
      return NextResponse.json({
        status: 'success',
        server: 'brave-search',
        tools: tools.map(t => ({ name: t.name, description: t.description })),
        connectedServers: mcpManager.getConnectedServers()
      })
    } catch (error) {
      return NextResponse.json({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        server: 'brave-search'
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { serverName, toolName, arguments: args } = await request.json()
    
    if (!mcpManager.isConnected(serverName)) {
      return NextResponse.json({
        error: `Not connected to server: ${serverName}`
      }, { status: 400 })
    }

    const result = await mcpManager.callTool(serverName, toolName, args)
    
    return NextResponse.json({
      status: 'success',
      result
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 