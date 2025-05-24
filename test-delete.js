const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDeleteFunctionality() {
  try {
    console.log('🔍 Testing conversation delete functionality...')
    
    // Find the test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    if (!testUser) {
      console.error('❌ Test user not found')
      return
    }
    
    console.log('✅ Test user found:', testUser.id)
    
    // Create a test conversation
    const testConversation = await prisma.conversation.create({
      data: {
        title: 'Test Conversation for Delete',
        userId: testUser.id
      }
    })
    
    console.log('✅ Test conversation created:', testConversation.id)
    
    // Create a test message
    await prisma.message.create({
      data: {
        content: 'This is a test message',
        role: 'USER',
        conversationId: testConversation.id
      }
    })
    
    console.log('✅ Test message created')
    
    // List conversations before deletion
    const conversationsBefore = await prisma.conversation.findMany({
      where: { userId: testUser.id },
      select: { id: true, title: true }
    })
    
    console.log('📋 Conversations before delete:', conversationsBefore.length)
    
    // Test deletion
    await prisma.conversation.delete({
      where: { id: testConversation.id }
    })
    
    console.log('✅ Conversation deleted successfully')
    
    // List conversations after deletion
    const conversationsAfter = await prisma.conversation.findMany({
      where: { userId: testUser.id },
      select: { id: true, title: true }
    })
    
    console.log('📋 Conversations after delete:', conversationsAfter.length)
    
    if (conversationsBefore.length === conversationsAfter.length + 1) {
      console.log('✅ Delete functionality works correctly!')
    } else {
      console.log('❌ Delete functionality may have issues')
    }
    
  } catch (error) {
    console.error('❌ Error testing delete functionality:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDeleteFunctionality() 