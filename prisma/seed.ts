import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create default built-in tools
  const tools = [
    {
      name: 'Calculator',
      description: 'Perform mathematical calculations and evaluate expressions',
      toolType: 'BUILTIN' as const,
      enabled: true
    },
    {
      name: 'Current Time',
      description: 'Get the current date and time',
      toolType: 'BUILTIN' as const,
      enabled: true
    },
    {
      name: 'Password Generator',
      description: 'Generate secure random passwords',
      toolType: 'BUILTIN' as const,
      enabled: true
    },
    {
      name: 'Hash Calculator',
      description: 'Calculate SHA256 hash values for text input',
      toolType: 'BUILTIN' as const,
      enabled: true
    },
    {
      name: 'Web Search',
      description: 'Search the web for real-time information (requires API key)',
      toolType: 'BUILTIN' as const,
      enabled: false
    },
    {
      name: 'Weather',
      description: 'Get weather information for locations (requires API key)',
      toolType: 'BUILTIN' as const,
      enabled: false
    },
    {
      name: 'URL Shortener',
      description: 'Create shortened URLs',
      toolType: 'BUILTIN' as const,
      enabled: false
    }
  ]

  console.log('📦 Creating built-in tools...')
  
  // Only create tools that don't already exist
  for (const tool of tools) {
    const existingTool = await prisma.tool.findFirst({
      where: { name: tool.name }
    })

    if (!existingTool) {
      await prisma.tool.create({
        data: tool,
      })
      console.log(`✓ Created built-in tool: ${tool.name}`)
    } else {
      console.log(`⏭️  Skipped: ${tool.name} (already exists)`)
    }
  }

  console.log('✅ Seed completed successfully!')
  console.log(`Created ${tools.length} tools`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 