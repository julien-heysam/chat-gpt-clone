const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestConversations() {
  try {
    console.log('🔍 Creating test conversations...')
    
    // Find the test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    if (!testUser) {
      console.error('❌ Test user not found')
      return
    }
    
    console.log('✅ Test user found:', testUser.id)
    
    // Create test conversations
    const conversations = [
      'Test Conversation 1 - Delete Me!',
      'Test Conversation 2 - Also Delete Me!',
      'Test Conversation 3 - And Me Too!'
    ]
    
    for (const title of conversations) {
      const conversation = await prisma.conversation.create({
        data: {
          title,
          userId: testUser.id
        }
      })
      
      // Add a sample message to each conversation
      await prisma.message.create({
        data: {
          content: `Hello, this is a test message in ${title}`,
          role: 'USER',
          conversationId: conversation.id
        }
      })
      
      console.log(`✅ Created conversation: ${title} (${conversation.id})`)
    }
    
    // List all conversations for the user
    const allConversations = await prisma.conversation.findMany({
      where: { userId: testUser.id },
      select: { id: true, title: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('\n📋 All conversations for test user:')
    allConversations.forEach((conv, index) => {
      console.log(`${index + 1}. ${conv.title} (${conv.id})`)
    })
    
    console.log('\n🎯 Test setup complete! You can now:')
    console.log('1. Sign in with: test@example.com / testpass123')
    console.log('2. Try to delete the test conversations using the UI')
    console.log('3. Check the browser console for logs')
    console.log('4. Check the server console for API logs')
    
  } catch (error) {
    console.error('❌ Error creating test conversations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestConversations() 