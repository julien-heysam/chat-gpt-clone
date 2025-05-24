import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { 
      name, 
      description, 
      enabled,
      toolType,
      mcpConnectionUrl,
      mcpAuthType,
      mcpAuthToken,
      mcpTimeout
    } = await request.json()

    const tool = await prisma.tool.findUnique({
      where: { id }
    })

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    // Validate MCP fields if it's being updated to an MCP tool
    if (toolType === 'MCP') {
      if (!mcpConnectionUrl) {
        return NextResponse.json({ error: "MCP Connection URL is required for MCP tools" }, { status: 400 })
      }
      if (mcpAuthType !== 'NONE' && !mcpAuthToken) {
        return NextResponse.json({ error: "Authentication token is required for the selected auth type" }, { status: 400 })
      }
    }

    const updateData: any = {}

    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (enabled !== undefined) updateData.enabled = enabled
    if (toolType !== undefined) updateData.toolType = toolType

    // Handle MCP fields
    if (toolType === 'MCP') {
      if (mcpConnectionUrl !== undefined) updateData.mcpConnectionUrl = mcpConnectionUrl.trim()
      if (mcpAuthType !== undefined) updateData.mcpAuthType = mcpAuthType
      if (mcpAuthToken !== undefined) updateData.mcpAuthToken = mcpAuthType !== 'NONE' ? mcpAuthToken.trim() : null
      if (mcpTimeout !== undefined) updateData.mcpTimeout = mcpTimeout
    } else if (toolType === 'BUILTIN') {
      // Clear MCP fields if switching to built-in
      updateData.mcpConnectionUrl = null
      updateData.mcpAuthType = null
      updateData.mcpAuthToken = null
      updateData.mcpTimeout = null
    }

    const updatedTool = await prisma.tool.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedTool)
  } catch (error) {
    console.error("Error updating tool:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const tool = await prisma.tool.findUnique({
      where: { id }
    })

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    await prisma.tool.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tool:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 