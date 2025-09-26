"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Building2, Mail, Clock, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

function OTPVerificationWrapper() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const email = searchParams.get('email')
  const type = searchParams.get('type')

  return <OTPVerificationContent sessionId={sessionId} email={email} type={type} />
}

function OTPVerificationContent({ sessionId, email, type }: { sessionId: string | null, email: string | null, type: string | null }) {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [canResend, setCanResend] = useState(false)

  const router = useRouter()
  const { refreshUser } = useAuth()

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  // Redirect if no session
  useEffect(() => {
    if (!sessionId || !email) {
      router.push('/auth/login')
    }
  }, [sessionId, email, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          otp,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Email verified successfully!")
        
        if (type === 'signup') {
          // Handle signup completion - create user in database
          const signupData = sessionStorage.getItem('signupData')
          if (signupData) {
            try {
              const userData = JSON.parse(signupData)
              
              // Call register API to create user
              const registerResponse = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ...userData,
                  isEmailVerified: true, // Mark as verified since OTP was successful
                }),
              })

              const registerData = await registerResponse.json()
              
              if (registerData.success) {
                sessionStorage.removeItem('signupData')
                setSuccess("Account created successfully! Welcome to InvestX!")
                
                // Refresh user context to get the new user state
                await refreshUser()
                
                // All new signups are guests, redirect to projects
                setTimeout(() => {
                  router.push('/projects') // guest users go to projects
                }, 1500)
              } else {
                setError(registerData.error || 'Failed to create account')
              }
            } catch (regError) {
              setError('Failed to create account. Please try again.')
            }
          } else {
            setError('Signup data not found. Please start over.')
            setTimeout(() => router.push('/auth/signup'), 2000)
          }
        } else {
          // This should only be signup flow now
          setError('Invalid verification type')
        }
      } else {
        setError(data.error)
        setOtp("") // Clear OTP input on error
      }
    } catch (error) {
      setError("Failed to verify OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    setError("")

    try {
      const response = await fetch('/api/auth/otp/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("New verification code sent!")
        setTimeLeft(300) // Reset timer
        setCanResend(false)
        setOtp("") // Clear current OTP
        
        // Update session ID if new one is provided
        if (data.sessionId) {
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.set('sessionId', data.sessionId)
          window.history.replaceState({}, '', newUrl.toString())
        }
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  if (!sessionId || !email) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">InvestX</span>
          </div>
          <CardTitle className="text-2xl">
            {type === 'signup' ? 'Complete Your Registration' : 'Verify Your Email'}
          </CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to
            <br />
            <strong>{email}</strong>
            {type === 'signup' && (
              <>
                <br />
                <span className="text-sm">Verify your email to complete account creation</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                value={otp}
                onChange={(value) => setOtp(value)}
                maxLength={6}
                containerClassName="group flex items-center has-[:disabled]:opacity-50"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <div className="flex items-center mx-2">
                  <div className="w-2 h-0.5 bg-border"></div>
                </div>
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              
              <p className="text-sm text-muted-foreground text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <Button 
              onClick={handleVerifyOTP} 
              className="w-full" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading 
                ? (type === 'signup' ? "Creating account..." : "Verifying...") 
                : (type === 'signup' ? "Create Account" : "Verify Code")
              }
            </Button>
          </div>

          {/* Timer and Resend */}
          <div className="text-center space-y-4">
            {!canResend ? (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Resend available in {formatTime(timeLeft)}</span>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={handleResendOTP}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Didn't receive the email? Check your spam folder.</p>
            <div className="mt-2">
              <Link 
                href={type === 'signup' ? '/auth/signup' : '/auth/login'} 
                className="text-primary hover:underline"
              >
                {type === 'signup' ? 'Back to Sign Up' : 'Back to Login'}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OTPVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPVerificationWrapper />
    </Suspense>
  )
}
