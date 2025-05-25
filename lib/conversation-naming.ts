import Anthropic from "@anthropic-ai/sdk"

// Initialize Anthropic client for name generation
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

/**
 * Generate a concise, descriptive conversation title based on the first user/assistant message
 * @param content The message content to analyze
 * @param role The role of the message sender (user or assistant)
 * @returns A promise that resolves to a generated title
 */
export async function generateConversationTitle(content: string, role: 'user' | 'assistant'): Promise<string> {
  try {
    // Truncate very long messages to avoid token limits
    const truncatedContent = content.length > 1000 ? content.slice(0, 1000) + '...' : content
    
    const prompt = role === 'user' 
      ? `Based on this user question/request, generate a concise, descriptive title (max 6 words) that captures the main topic or intent:

"${truncatedContent}"

Generate only the title, no quotes or explanations. Make it specific and clear.`
      : `Based on this AI assistant response, generate a concise, descriptive title (max 6 words) that captures the main topic being discussed:

"${truncatedContent}"

Generate only the title, no quotes or explanations. Make it specific and clear.`

    const completion = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022", // Use faster, cheaper model for title generation
      max_tokens: 50,
      temperature: 0.3, // Lower temperature for more consistent results
      messages: [{
        role: "user",
        content: prompt
      }]
    })

    const generatedTitle = completion.content[0]?.type === 'text' 
      ? completion.content[0].text.trim()
      : 'New Conversation'

    // Clean up the title - remove quotes and ensure reasonable length
    const cleanTitle = generatedTitle
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/[^\w\s-]/g, ' ') // Replace special chars with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()

    // Fallback to default if generation failed or is too short
    if (!cleanTitle || cleanTitle.length < 3) {
      return getSimpleTitle(content, role)
    }

    // Limit length to 60 characters
    return cleanTitle.length > 60 ? cleanTitle.slice(0, 60).trim() + '...' : cleanTitle
  } catch (error) {
    console.error('Error generating conversation title:', error)
    // Fallback to simple title extraction
    return getSimpleTitle(content, role)
  }
}

/**
 * Simple fallback title generation that doesn't require AI
 * @param content The message content
 * @param role The role of the message sender
 * @returns A simple title based on the content
 */
function getSimpleTitle(content: string, role: 'user' | 'assistant'): string {
  // Remove markdown, code blocks, and other formatting
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/[*_~]/g, '') // Remove markdown formatting
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()

  if (!cleanContent) {
    return 'New Conversation'
  }

  // For user messages, try to extract the main question or topic
  if (role === 'user') {
    // Look for question patterns
    const questionMatch = cleanContent.match(/(?:how|what|why|when|where|who|can|could|would|should|is|are|do|does|did|will|won't|can't|couldn't|wouldn't|shouldn't)\s+[^?]*\??/i)
    if (questionMatch) {
      const question = questionMatch[0].trim()
      return question.length > 60 ? question.slice(0, 60).trim() + '...' : question
    }

    // Look for imperative statements (commands/requests)
    const imperativeMatch = cleanContent.match(/^(help|explain|tell|show|create|make|write|generate|analyze|compare|find|search|calculate|solve|fix|debug|review|summarize|translate)\s+[^.!?]*[.!?]?/i)
    if (imperativeMatch) {
      const imperative = imperativeMatch[0].trim()
      return imperative.length > 60 ? imperative.slice(0, 60).trim() + '...' : imperative
    }
  }

  // For any message, extract the first meaningful sentence or phrase
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0)
  if (sentences.length > 0) {
    const firstSentence = sentences[0].trim()
    if (firstSentence.length > 5) {
      return firstSentence.length > 60 ? firstSentence.slice(0, 60).trim() + '...' : firstSentence
    }
  }

  // Last resort: take first 60 characters
  return content.length > 60 ? content.slice(0, 60).trim() + '...' : content.trim() || 'New Conversation'
}

/**
 * Update a conversation's title automatically
 * @param conversationId The ID of the conversation to update
 * @param newTitle The new title to set
 * @returns Promise that resolves when the update is complete
 */
export async function updateConversationTitle(conversationId: string, newTitle: string): Promise<void> {
  try {
    const response = await fetch(`/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: newTitle }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update conversation title: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Error updating conversation title:', error)
    throw error
  }
} 