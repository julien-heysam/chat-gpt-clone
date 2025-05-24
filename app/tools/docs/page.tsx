import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Github, Settings, Zap, Link, Key, Globe } from "lucide-react"
import NextLink from "next/link"

export default function MCPDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <NextLink href="/tools">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tools
              </Button>
            </NextLink>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">MCP Tools Documentation</h1>
          <p className="text-white/70 text-lg">
            Learn how to set up and use Model Context Protocol (MCP) tools in your chat conversations.
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12 bg-white/5 border border-white/20 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <Link className="h-6 w-6 text-primary" />
            What is MCP?
          </h2>
          <p className="text-white/80 mb-4">
            Model Context Protocol (MCP) is an open standard that enables secure connections between AI assistants and external tools and data sources. 
            The tools are sourced from the official{" "}
            <a 
              href="https://github.com/modelcontextprotocol/servers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
            >
              MCP Servers Repository
              <ExternalLink className="h-3 w-3" />
            </a>
            .
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <Settings className="h-8 w-8 text-blue-400 mb-2" />
              <h3 className="font-semibold text-white mb-2">Secure</h3>
              <p className="text-white/60 text-sm">Controlled access with authentication and permissions</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <Zap className="h-8 w-8 text-green-400 mb-2" />
              <h3 className="font-semibold text-white mb-2">Fast</h3>
              <p className="text-white/60 text-sm">Direct connections to data sources and APIs</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <Globe className="h-8 w-8 text-purple-400 mb-2" />
              <h3 className="font-semibold text-white mb-2">Extensible</h3>
              <p className="text-white/60 text-sm">Connect to any service that supports MCP</p>
            </div>
          </div>
        </section>

        {/* Available Tools */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Available MCP Tools</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Development Tools */}
            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Github className="h-5 w-5 text-orange-400" />
                Development & Git
              </h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• GitHub - Repository management, issues, commits</li>
                <li>• GitLab - Project management, merge requests</li>
                <li>• Git - Local repository operations</li>
                <li>• Docker - Container management</li>
                <li>• Kubernetes - Cluster operations</li>
              </ul>
            </div>

            {/* Data & Storage */}
            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-400" />
                Data & Storage
              </h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• PostgreSQL - Database queries</li>
                <li>• SQLite - Local database management</li>
                <li>• Google Drive - File management</li>
                <li>• AWS S3 - Cloud storage</li>
                <li>• Filesystem - Local file operations</li>
              </ul>
            </div>

            {/* Web & Search */}
            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-400" />
                Web & Search
              </h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• Brave Search - Web search with API</li>
                <li>• Fetch - Web content retrieval</li>
                <li>• Puppeteer - Web automation</li>
                <li>• Google Maps - Location services</li>
                <li>• Weather - Current conditions</li>
              </ul>
            </div>

            {/* Communication */}
            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-400" />
                Communication
              </h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>• Slack - Team messaging</li>
                <li>• Discord - Community chat</li>
                <li>• Twilio - SMS and calls</li>
                <li>• SendGrid - Email campaigns</li>
                <li>• Reddit - Community interaction</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Setup Instructions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Setting Up MCP Tools</h2>
          
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Enable Tools
              </h3>
              <p className="text-white/80 mb-4">
                Go to the <NextLink href="/tools" className="text-primary hover:text-primary/80">Tools Management</NextLink> page 
                and enable the MCP tools you want to use. All MCP tools are disabled by default for security.
              </p>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Configure Authentication
              </h3>
              <p className="text-white/80 mb-4">
                Many MCP tools require API keys or authentication tokens. Click the edit button on each tool to configure:
              </p>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-yellow-400" />
                    <span className="text-white/60">API Key:</span>
                    <span className="text-white">For services like GitHub, Brave Search, OpenWeather</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-green-400" />
                    <span className="text-white/60">Bearer Token:</span>
                    <span className="text-white">For OAuth services like Slack, Discord</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-blue-400" />
                    <span className="text-white/60">No Auth:</span>
                    <span className="text-white">For tools like Memory, QR Code, Calculator</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Use in Chat
              </h3>
              <p className="text-white/80 mb-4">
                In any chat conversation, click the "+" button next to the message input to select which tools to use. 
                You can filter between Built-in and MCP tools, and select multiple tools for a single conversation.
              </p>
            </div>
          </div>
        </section>

        {/* API Keys Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Getting API Keys</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">GitHub</h4>
              <p className="text-white/60 text-sm mb-2">
                Go to Settings → Developer settings → Personal access tokens
              </p>
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm inline-flex items-center gap-1"
              >
                Get GitHub Token
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Brave Search</h4>
              <p className="text-white/60 text-sm mb-2">
                Sign up for Brave Search API to get web search capabilities
              </p>
              <a 
                href="https://api.search.brave.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm inline-flex items-center gap-1"
              >
                Get Brave API Key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">OpenWeather</h4>
              <p className="text-white/60 text-sm mb-2">
                Free weather data API with current conditions and forecasts
              </p>
              <a 
                href="https://openweathermap.org/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm inline-flex items-center gap-1"
              >
                Get Weather API Key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Google Maps</h4>
              <p className="text-white/60 text-sm mb-2">
                Google Cloud Console for Maps, Places, and Geocoding APIs
              </p>
              <a 
                href="https://console.cloud.google.com/apis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 text-sm inline-flex items-center gap-1"
              >
                Get Google API Key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </section>

        {/* Security Note */}
        <section className="mb-12">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-4">🔒 Security Best Practices</h3>
            <ul className="space-y-2 text-yellow-200/80 text-sm">
              <li>• Never share your API keys or authentication tokens</li>
              <li>• Use environment variables for production deployments</li>
              <li>• Regularly rotate your API keys</li>
              <li>• Only enable tools that you actually need</li>
              <li>• Review tool permissions and scopes before use</li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-white/10">
          <p className="text-white/60 mb-4">
            MCP tools are powered by the{" "}
            <a 
              href="https://github.com/modelcontextprotocol/servers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1"
            >
              Model Context Protocol
              <ExternalLink className="h-3 w-3" />
            </a>
            {" "}community.
          </p>
          <NextLink href="/tools">
            <Button className="bg-primary hover:bg-primary/90">
              Go to Tools Management
            </Button>
          </NextLink>
        </div>
      </div>
    </div>
  )
} 