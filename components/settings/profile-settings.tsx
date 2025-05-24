"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, 
  Mail, 
  Settings,
  Save,
  Loader2,
  CheckCircle,
  Key,
  Edit
} from "lucide-react"

export function ProfileSettings() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [globalSystemPrompt, setGlobalSystemPrompt] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    loadUserSettings()
  }, [])

  const loadUserSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        setGlobalSystemPrompt(data.globalSystemPrompt || '')
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ globalSystemPrompt })
      })

      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        console.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
          <h2 className="text-2xl font-bold text-white">Loading Profile...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Settings</h2>
        <p className="text-white/70">
          Manage your account information and AI assistant preferences.
        </p>
      </div>

      {/* Profile Information */}
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Name
              </label>
              <div className="relative">
                <Input
                  value={session?.user?.name || ''}
                  disabled
                  className="bg-white/5 border-white/20 text-white/60 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Edit className="h-4 w-4 text-white/30" />
                </div>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Contact support to change your name
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  value={session?.user?.email || ''}
                  disabled
                  className="pl-10 bg-white/5 border-white/20 text-white/60 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Edit className="h-4 w-4 text-white/30" />
                </div>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Contact support to change your email
              </p>
            </div>
          </div>
        </div>

        {/* AI Assistant Settings */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            AI Assistant Preferences
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Global System Prompt
              </label>
              <Textarea
                value={globalSystemPrompt}
                onChange={(e) => setGlobalSystemPrompt(e.target.value)}
                placeholder="Enter instructions that will be applied to all your conversations..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[120px] resize-y"
              />
              <p className="text-xs text-white/50 mt-1">
                These instructions will be applied to all new conversations. You can override them for specific folders.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <div className="flex items-center gap-2">
                {showSuccess && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400">Settings saved successfully!</span>
                  </>
                )}
              </div>
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Security & Privacy
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/20 rounded-lg">
              <div>
                <div className="font-medium text-white">Authentication Method</div>
                <div className="text-sm text-white/60">
                  {session?.user?.email ? 'Email & Password' : 'OAuth Provider'}
                </div>
              </div>
              <Button variant="outline" size="sm" disabled className="text-white/60 border-white/20">
                Manage
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/20 rounded-lg">
              <div>
                <div className="font-medium text-white">Tool Authentication</div>
                <div className="text-sm text-white/60">
                  API keys and tokens are encrypted at rest
                </div>
              </div>
              <span className="text-sm text-green-400 font-medium">Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 