/*
  Warnings:

  - You are about to drop the column `enabled` on the `Tool` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ToolType" AS ENUM ('BUILTIN', 'MCP');

-- CreateEnum
CREATE TYPE "McpAuthType" AS ENUM ('NONE', 'API_KEY', 'BEARER_TOKEN', 'BASIC_AUTH');

-- AlterTable
ALTER TABLE "Tool" DROP COLUMN "enabled",
ADD COLUMN     "mcpAuthToken" TEXT,
ADD COLUMN     "mcpAuthType" "McpAuthType",
ADD COLUMN     "mcpConnectionUrl" TEXT,
ADD COLUMN     "mcpSchema" JSONB,
ADD COLUMN     "mcpTimeout" INTEGER DEFAULT 30000,
ADD COLUMN     "toolType" "ToolType" NOT NULL DEFAULT 'BUILTIN';

-- CreateTable
CREATE TABLE "UserTool" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "userMcpAuthToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTool_userId_toolId_key" ON "UserTool"("userId", "toolId");

-- AddForeignKey
ALTER TABLE "UserTool" ADD CONSTRAINT "UserTool_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTool" ADD CONSTRAINT "UserTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
