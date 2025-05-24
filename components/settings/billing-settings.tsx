"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Zap,
  Clock,
  CheckCircle,
  Crown,
  Star
} from "lucide-react"

export function BillingSettings() {
  const [currentPlan] = useState('free') // This would come from your subscription system

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Up to 10 MCP tools',
        'Basic AI models',
        '100 messages/month',
        'Community support'
      ],
      limitations: [
        'Limited tool configurations',
        'No premium models',
        'Basic features only'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$20',
      period: 'month',
      popular: true,
      features: [
        'All MCP tools (133+)',
        'Advanced AI models',
        'Unlimited messages',
        'Priority support',
        'Custom configurations',
        'API access'
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      period: 'month',
      features: [
        'Everything in Pro',
        'Custom MCP servers',
        'Team collaboration',
        'SSO integration',
        'Dedicated support',
        'Custom deployment'
      ],
      limitations: []
    }
  ]

  const usageStats = [
    {
      label: 'Messages this month',
      value: '47',
      limit: '100',
      percentage: 47,
      icon: TrendingUp,
      color: 'text-blue-400'
    },
    {
      label: 'Enabled tools',
      value: '3',
      limit: '10',
      percentage: 30,
      icon: Zap,
      color: 'text-green-400'
    },
    {
      label: 'API calls',
      value: '127',
      limit: '1,000',
      percentage: 12.7,
      icon: Clock,
      color: 'text-purple-400'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
        <p className="text-white/70">
          Manage your subscription plan and monitor your usage.
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Current Plan
        </h3>
        
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-white text-lg">
                {plans.find(p => p.id === currentPlan)?.name} Plan
              </div>
              <div className="text-white/60">
                {plans.find(p => p.id === currentPlan)?.price} {plans.find(p => p.id === currentPlan)?.period && `/ ${plans.find(p => p.id === currentPlan)?.period}`}
              </div>
            </div>
          </div>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            {currentPlan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
          </Button>
        </div>
      </div>

      {/* Usage Stats */}
      {currentPlan === 'free' && (
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Usage This Month
          </h3>
          
          <div className="space-y-4">
            {usageStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-white/80">{stat.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {stat.value} / {stat.limit}
                      </div>
                      <div className="text-xs text-white/50">
                        {stat.percentage}% used
                      </div>
                    </div>
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          stat.percentage > 80 ? 'bg-red-400' :
                          stat.percentage > 60 ? 'bg-yellow-400' :
                          'bg-green-400'
                        } transition-all duration-300`}
                        style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Available Plans
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-6 rounded-lg border transition-all duration-300 ${
                plan.id === currentPlan
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-white/20 bg-white/5 hover:border-white/30'
              } ${
                plan.popular ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                <div className="text-3xl font-bold text-white">
                  {plan.price}
                  {plan.period && (
                    <span className="text-sm text-white/60 font-normal">/{plan.period}</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full ${
                  plan.id === currentPlan
                    ? 'bg-white/10 text-white cursor-not-allowed'
                    : plan.popular
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
                disabled={plan.id === currentPlan}
              >
                {plan.id === currentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Information */}
      {currentPlan !== 'free' && (
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Billing Information
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/20 rounded-lg">
              <div>
                <div className="font-medium text-white">Payment Method</div>
                <div className="text-sm text-white/60">•••• •••• •••• 4242</div>
              </div>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                Update
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/20 rounded-lg">
              <div>
                <div className="font-medium text-white">Next Billing Date</div>
                <div className="text-sm text-white/60">March 15, 2024</div>
              </div>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                View Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Support */}
      <div className="bg-white/5 border border-white/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
        <p className="text-white/70 mb-4">
          Have questions about your subscription or need assistance? Our support team is here to help.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Contact Support
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            View Documentation
          </Button>
        </div>
      </div>
    </div>
  )
} 