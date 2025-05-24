import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userToolId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userToolId } = await params
    const body = await request.json()
    const { enabled, userMcpAuthToken } = body

    // Verify the user tool belongs to the current user
    const existingUserTool = await prisma.userTool.findFirst({
      where: {
        id: userToolId,
        userId: session.user.id
      }
    })

    if (!existingUserTool) {
      return NextResponse.json({ error: "User tool not found" }, { status: 404 })
    }

    // Update the user tool
    const updatedUserTool = await prisma.userTool.update({
      where: {
        id: userToolId
      },
      data: {
        ...(typeof enabled === 'boolean' && { enabled }),
        ...(userMcpAuthToken !== undefined && { userMcpAuthToken })
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
      }
    })

    return NextResponse.json(updatedUserTool)
  } catch (error) {
    console.error("Error updating user tool:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 