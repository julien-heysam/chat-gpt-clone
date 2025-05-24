# ChatGPT Clone

A full-featured ChatGPT clone built with Next.js 15, featuring user authentication, conversation management, folders, and model selection.

## Features

- 🔐 **Authentication**: Email/password and OAuth (Google, GitHub)
- 💬 **Real-time Chat**: Interactive chat interface with message history
- 📁 **Folder Management**: Organize conversations into folders
- 🤖 **Model Selection**: Choose between different AI models
- 🛠️ **Tools Integration**: Add and manage tools for enhanced functionality
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Styling**: CSS Variables for theming

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd chat-gpt-clone
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chatgpt_clone?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main models:

- **User**: User accounts with authentication
- **Conversation**: Chat conversations
- **Message**: Individual messages within conversations
- **Folder**: Organization folders for conversations
- **Tool**: Available tools for enhanced functionality

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── chat/              # Chat interface components
│   ├── sidebar/           # Sidebar components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── prisma/                # Database schema and migrations
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Features in Detail

### Authentication
- Email/password registration and login
- OAuth integration with Google and GitHub
- Secure session management with NextAuth.js

### Chat Interface
- Real-time message sending and receiving
- Markdown support for AI responses
- Auto-scrolling to latest messages
- Typing indicators

### Conversation Management
- Create new conversations
- View conversation history
- Organize conversations in folders
- Search and filter conversations

### Model Selection
- Choose between different AI models
- Model-specific settings and configurations
- Tool integration for enhanced capabilities

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy

### Docker

```bash
# Build the image
docker build -t chatgpt-clone .

# Run the container
docker run -p 3000:3000 chatgpt-clone
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.
