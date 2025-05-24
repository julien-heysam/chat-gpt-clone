"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, Wrench, User, CreditCard } from "lucide-react"
import Link from "next/link"
import { MCPToolsSettings } from "@/components/settings/mcp-tools-settings"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { BillingSettings } from "@/components/settings/billing-settings"

type SettingsTab = 'profile' | 'mcp-tools' | 'billing'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
      description: 'Manage your account and preferences'
    },
    {
      id: 'mcp-tools' as const,
      label: 'MCP Tools',
      icon: Wrench,
      description: 'Enable and configure your AI tools'
    },
    {
      id: 'billing' as const,
      label: 'Billing',
      icon: CreditCard,
      description: 'Manage your subscription and usage'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />
      case 'mcp-tools':
        return <MCPToolsSettings />
      case 'billing':
        return <BillingSettings />
      default:
        return <ProfileSettings />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full glass-effect flex items-center justify-center border border-primary/30 neon-glow">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
              <p className="text-white/70 text-lg">
                Customize your Neural Chat experience
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-lg border border-white/20 p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-primary/20 border border-primary/30 text-white neon-glow'
                          : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/20'
                      }`}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${
                        activeTab === tab.id ? 'text-primary' : 'text-white/60'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-white/50 mt-0.5">{tab.description}</div>
                      </div>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="glass-effect rounded-lg border border-white/20 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 