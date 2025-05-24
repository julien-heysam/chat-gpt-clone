const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPIDeleteFunctionality() {
  try {
    console.log('🔍 Testing API delete functionality...')
    
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
        title: 'Test Conversation for API Delete',
        userId: testUser.id
      }
    })
    
    console.log('✅ Test conversation created:', testConversation.id)
    
    // Now test the API call with curl (simulating the frontend)
    const { exec } = require('child_process')
    const util = require('util')
    const execPromise = util.promisify(exec)
    
    try {
      // First, let's check if the conversation exists
      console.log('📋 Checking if conversation exists before delete...')
      const existsBefore = await prisma.conversation.findUnique({
        where: { id: testConversation.id }
      })
      
      if (existsBefore) {
        console.log('✅ Conversation exists before delete')
      }
      
      // Test the API endpoint directly (this will fail due to auth, but let's see the error)
      const apiUrl = `http://localhost:3000/api/conversations/${testConversation.id}`
      console.log('🌐 Testing API endpoint:', apiUrl)
      
      const curlCommand = `curl -X DELETE "${apiUrl}" -H "Content-Type: application/json" -w "\\nHTTP_STATUS:%{http_code}\\n" -s`
      
      const { stdout, stderr } = await execPromise(curlCommand)
      console.log('API Response:', stdout)
      
      if (stderr) {
        console.log('API Stderr:', stderr)
      }
      
      // Check if conversation still exists after API call
      const existsAfter = await prisma.conversation.findUnique({
        where: { id: testConversation.id }
      })
      
      if (existsAfter) {
        console.log('📋 Conversation still exists after API call (expected due to auth)')
      } else {
        console.log('📋 Conversation was deleted by API call')
      }
      
    } catch (apiError) {
      console.log('API Error:', apiError.message)
    }
    
    // Clean up - delete the test conversation
    try {
      await prisma.conversation.delete({
        where: { id: testConversation.id }
      })
      console.log('🧹 Cleaned up test conversation')
    } catch (cleanupError) {
      console.log('🧹 Cleanup not needed (conversation already deleted)')
    }
    
  } catch (error) {
    console.error('❌ Error testing API delete functionality:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPIDeleteFunctionality() 