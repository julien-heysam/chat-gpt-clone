import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create default tools
  const tools = [
    {
      name: 'Web Search',
      description: 'Search the web for real-time information',
    },
    {
      name: 'Code Interpreter',
      description: 'Execute Python code and analyze data',
    },
    {
      name: 'DALL-E',
      description: 'Generate images from text descriptions',
    },
    {
      name: 'Document Analysis',
      description: 'Analyze and extract information from documents',
    },
    {
      name: 'Calculator',
      description: 'Perform mathematical calculations',
    }
  ]

  console.log('📦 Creating default tools...')
  
  // Clear existing tools first (optional)
  await prisma.tool.deleteMany()
  
  // Create all tools
  for (const tool of tools) {
    await prisma.tool.create({
      data: tool,
    })
    console.log(`✓ Created tool: ${tool.name}`)
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