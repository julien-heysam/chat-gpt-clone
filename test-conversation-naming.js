// Test script for conversation naming functionality
// This script tests the automatic conversation title generation

const { generateConversationTitle } = require('./lib/conversation-naming.ts')

async function testConversationNaming() {
  console.log('🧪 Testing Conversation Naming Functionality\n')

  const testCases = [
    {
      content: "How do I create a React component with TypeScript?",
      role: "user",
      expected: "React TypeScript Component Creation"
    },
    {
      content: "What's the weather like in New York today?",
      role: "user", 
      expected: "Weather in New York"
    },
    {
      content: "Explain the difference between let, const, and var in JavaScript",
      role: "user",
      expected: "JavaScript Variable Declarations"
    },
    {
      content: "I can help you create a React component with TypeScript. Here's a basic example...",
      role: "assistant",
      expected: "React TypeScript Component Help"
    },
    {
      content: "Write a Python function to calculate fibonacci numbers",
      role: "user",
      expected: "Python Fibonacci Function"
    }
  ]

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`Test ${i + 1}: ${testCase.role} message`)
    console.log(`Input: "${testCase.content.slice(0, 50)}..."`)
    
    try {
      const generatedTitle = await generateConversationTitle(testCase.content, testCase.role)
      console.log(`Generated: "${generatedTitle}"`)
      console.log(`✅ Success\n`)
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`)
    }
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testConversationNaming().catch(console.error)
}

module.exports = { testConversationNaming } 