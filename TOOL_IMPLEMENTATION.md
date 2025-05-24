# Tool Implementation in Chat GPT Clone

## Overview

This application now supports tool calling, allowing the AI to execute functions and tools during conversations. Tools can be either built-in or external via MCP (Model Context Protocol).

## How Tool Calling Works

### 1. Tool Selection
- Users can select tools via the tool picker interface (+ button in the chat input)
- Selected tools are displayed as pills above the input area
- Tools can be enabled/disabled in the Tools Management page

### 2. Tool Integration with AI
- When a message is sent with selected tools, they are:
  1. Converted to Anthropic's tool format with appropriate schemas
  2. Sent to the Anthropic API alongside the conversation
  3. Associated with the conversation in the database

### 3. Tool Execution Flow
- When Anthropic decides to use a tool, it returns tool use blocks
- The system processes these blocks in real-time during streaming
- Tools are executed and results are shown inline
- For built-in tools: Executed locally
- For MCP tools: Would connect to external MCP servers (placeholder currently)

### 4. Built-in Tools Available

#### Calculator
- **Purpose**: Perform mathematical calculations
- **Input**: Mathematical expression (e.g., "2 + 3 * 4", "sqrt(16)")
- **Schema**: `{ expression: string }`

#### Current Time
- **Purpose**: Get current date and time
- **Input**: None required
- **Schema**: `{}`

#### Password Generator
- **Purpose**: Generate secure random passwords
- **Input**: Length (optional, default: 12)
- **Schema**: `{ length?: string }`

#### Hash Calculator
- **Purpose**: Calculate SHA256 hash of text
- **Input**: Text to hash
- **Schema**: `{ text: string }`

#### Web Search (Disabled)
- **Purpose**: Search the web (requires API key)
- **Input**: Search query
- **Schema**: `{ query: string }`

#### Weather (Disabled)
- **Purpose**: Get weather info (requires API key)
- **Input**: Location
- **Schema**: `{ location: string }`

## Implementation Details

### Tool Schema Generation
The `convertToolsToAnthropicFormat()` function creates appropriate schemas for each tool type:
- Calculator: Uses `expression` parameter
- Password: Uses optional `length` parameter
- Hash: Uses `text` parameter
- Time: No parameters required

### Tool Execution
The `executeToolCall()` function routes tool calls to appropriate handlers:
- Built-in tools: Executed via `executeBuiltinTool()`
- MCP tools: Placeholder for MCP protocol integration

### Database Schema
```sql
-- Many-to-many relationship between conversations and tools
model Conversation {
  tools Tool[]
}

model Tool {
  conversations Conversation[]
}
```

## Security Considerations

1. **Input Validation**: All tool inputs are validated before execution
2. **Math Evaluation**: Uses Function constructor instead of eval for safer math calculations
3. **MCP Authentication**: Supports various auth types (API_KEY, BEARER_TOKEN, etc.)
4. **Tool Permissions**: Tools are disabled by default and must be explicitly enabled

## Future Enhancements

1. **Real MCP Integration**: Connect to actual MCP servers
2. **Custom Tool Creation**: Allow users to define custom tools
3. **Tool Result Caching**: Cache expensive tool results
4. **Tool Analytics**: Track tool usage and performance
5. **Advanced Tool Schemas**: Support more complex input schemas

## Testing Tool Calling

1. Start a new conversation
2. Click the + button to open tool picker
3. Select "Calculator" or "Current Time"
4. Send a message like "What's 15 * 23?" or "What time is it?"
5. The AI should use the appropriate tool and show results

## Example Tool Call Flow

```
User: "Calculate 15 * 23 and generate a 16-character password"

AI Response:
🔧 Using calculator tool...
Tool Result: Calculation result: 15*23 = 345

🔧 Using password_generator tool...
Tool Result: Generated password (16 characters): Xk9#mP2vQ8rL$3tN

The calculation result is 345, and here's your 16-character password: Xk9#mP2vQ8rL$3tN
``` 