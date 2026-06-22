'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CreditCard, CheckCircle2, ExternalLink, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { 
  createConnectAccount, 
  createConnectOnboardingLink, 
  getConnectAccountStatus,
  createConnectLoginLink
} from '@/app/actions/stripe'

export const dynamic = 'force-dynamic'

function ConnectLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </div>
  )
}

export default function ConnectOnboardingPage() {
  return (
    <Suspense fallback={<ConnectLoading />}>
      <ConnectOnboardingContent />
    </Suspense>
  )
}

function ConnectOnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<{
    isAuthenticated?: boolean
    hasAccount: boolean
    isOnboarded: boolean
    chargesEnabled: boolean
    payoutsEnabled: boolean
    accountId?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const success = searchParams.get('success')
  const refresh = searchParams.get('refresh')
  
  useEffect(() => {
    loadStatus()
  }, [])
  
  async function loadStatus() {
    try {
      const accountStatus = await getConnectAccountStatus()
      
      // Redirect to sign-in if not authenticated
      if (!accountStatus.isAuthenticated) {
        router.push('/sign-in')
        return
      }
      
      setStatus(accountStatus)
    } catch (err) {
      setError('Failed to load account status')
    } finally {
      setLoading(false)
    }
  }
  
  async function handleSetupAccount() {
    setActionLoading(true)
    setError(null)
    try {
      // Create account if needed
      if (!status?.hasAccount) {
        const created = await createConnectAccount()
        if (!created.ok) {
          setError(created.error)
          setActionLoading(false)
          return
        }
      }
      
      // Get onboarding link
      const currentUrl = window.location.origin + window.location.pathname
      const link = await createConnectOnboardingLink(currentUrl)
      if (!link.ok) {
        setError(link.error)
        setActionLoading(false)
        return
      }
      
      // Redirect to Stripe
      window.location.href = link.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start onboarding')
      setActionLoading(false)
    }
  }
  
  async function handleOpenDashboard() {
    setActionLoading(true)
    setError(null)
    try {
      const link = await createConnectLoginLink()
      if (!link.ok) {
        setError(link.error)
        return
      }
      window.open(link.url, '_blank')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open dashboard')
    } finally {
      setActionLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Seller Payments Setup</CardTitle>
                <CardDescription>
                  Connect your account to receive payments for your guides
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {success && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Onboarding complete!</p>
                  <p className="text-sm text-green-700">
                    Your account is now set up to receive payments.
                  </p>
                </div>
              </div>
            )}
            
            {refresh && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Onboarding incomplete</p>
                  <p className="text-sm text-amber-700">
                    Please complete the onboarding process to start receiving payments.
                  </p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            {/* Status indicators */}
            <div className="space-y-3">
              <h3 className="font-medium">Account Status</h3>
              <div className="grid gap-3">
                <StatusItem 
                  label="Stripe Account" 
                  status={status?.hasAccount ? 'complete' : 'pending'} 
                />
                <StatusItem 
                  label="Identity Verified" 
                  status={status?.isOnboarded ? 'complete' : 'pending'} 
                />
                <StatusItem 
                  label="Can Accept Payments" 
                  status={status?.chargesEnabled ? 'complete' : 'pending'} 
                />
                <StatusItem 
                  label="Can Receive Payouts" 
                  status={status?.payoutsEnabled ? 'complete' : 'pending'} 
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="pt-4 border-t space-y-3">
              {!status?.isOnboarded ? (
                <>
                  <Button 
                    onClick={handleSetupAccount} 
                    disabled={actionLoading}
                    className="w-full"
                    size="lg"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    {status?.hasAccount ? 'Continue Setup' : 'Start Setup with Stripe'}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    You&apos;ll be redirected to Stripe to securely verify your identity and set up payouts.
                  </p>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-lg bg-green-50 text-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-800">You&apos;re all set!</p>
                    <p className="text-sm text-green-700">
                      You&apos;ll receive 85% of each sale directly to your bank account.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleOpenDashboard}
                    disabled={actionLoading}
                    className="w-full"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Open Stripe Dashboard
                  </Button>
                </>
              )}
            </div>
            
            {/* Info section */}
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-3">How it works</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">1.</span>
                  Complete the Stripe onboarding to verify your identity
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">2.</span>
                  Add your bank account for receiving payouts
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">3.</span>
                  When someone buys your guide, you receive 85% automatically
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">4.</span>
                  Payouts are sent to your bank within 2-7 business days
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function StatusItem({ label, status }: { label: string; status: 'complete' | 'pending' }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <span className="text-sm">{label}</span>
      {status === 'complete' ? (
        <span className="flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          Complete
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
          Pending
        </span>
      )}
    </div>
  )
}
