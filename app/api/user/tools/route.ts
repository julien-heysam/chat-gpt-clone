import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all tools with user's configurations
    const userTools = await prisma.userTool.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            description: true,
            toolType: true,
            mcpConnectionUrl: true,
            mcpAuthType: true,
            mcpTimeout: true
          }
        }
      },
      orderBy: {
        tool: {
          name: 'asc'
        }
      }
    })

    // If user has no tool configurations yet, create them for all available tools
    if (userTools.length === 0) {
      const allTools = await prisma.tool.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          toolType: true,
          mcpConnectionUrl: true,
          mcpAuthType: true,
          mcpTimeout: true
        },
        orderBy: {
          name: 'asc'
        }
      })

      // Create UserTool records for all tools (disabled by default)
      const userToolsToCreate = allTools.map(tool => ({
        userId: session.user.id,
        toolId: tool.id,
        enabled: false
      }))

      await prisma.userTool.createMany({
        data: userToolsToCreate,
        skipDuplicates: true
      })

      // Fetch the newly created user tools
      const newUserTools = await prisma.userTool.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          tool: {
            select: {
              id: true,
              name: true,
              description: true,
              toolType: true,
              mcpConnectionUrl: true,
              mcpAuthType: true,
              mcpTimeout: true
            }
          }
        },
        orderBy: {
          tool: {
            name: 'asc'
          }
        }
      })

      return NextResponse.json(newUserTools)
    }

    return NextResponse.json(userTools)
  } catch (error) {
    console.error("Error fetching user tools:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 