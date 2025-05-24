import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get tools that are enabled for this user
    const userTools = await prisma.userTool.findMany({
      where: {
        userId: session.user.id,
        enabled: true
      },
      include: {
        tool: true
      },
      orderBy: {
        tool: {
          name: 'asc'
        }
      }
    })

    // Return just the tools
    const tools = userTools.map(ut => ut.tool)
    return NextResponse.json(tools)
  } catch (error) {
    console.error("Error fetching tools:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      name, 
      description, 
      toolType = 'BUILTIN',
      mcpConnectionUrl,
      mcpAuthType,
      mcpAuthToken,
      mcpTimeout = 30000
    } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Tool name is required" }, { status: 400 })
    }

    // Validate MCP fields if it's an MCP tool
    if (toolType === 'MCP') {
      if (!mcpConnectionUrl) {
        return NextResponse.json({ error: "MCP Connection URL is required for MCP tools" }, { status: 400 })
      }
      if (mcpAuthType !== 'NONE' && !mcpAuthToken) {
        return NextResponse.json({ error: "Authentication token is required for the selected auth type" }, { status: 400 })
      }
    }

    const toolData: any = {
      name: name.trim(),
      description: description?.trim() || null,
      toolType
    }

    // Add MCP fields if it's an MCP tool
    if (toolType === 'MCP') {
      toolData.mcpConnectionUrl = mcpConnectionUrl.trim()
      toolData.mcpAuthType = mcpAuthType
      toolData.mcpAuthToken = mcpAuthType !== 'NONE' ? mcpAuthToken.trim() : null
      toolData.mcpTimeout = mcpTimeout
    }

    const tool = await prisma.tool.create({
      data: toolData
    })

    return NextResponse.json(tool)
  } catch (error) {
    console.error("Error creating tool:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 