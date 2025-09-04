'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Building2,
  TrendingUp,
  Shield,
  Users,
  MapPin,
  Calculator,
  CheckCircle,
  Star,
  ArrowRight,
  Mail,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.role === "admin") {
      router.replace("/admin")
    }
  }, [user, router])

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl p-8 md:p-16">
        <div className="absolute inset-0 bg-[url('/modern-pakistani-cityscape.png')] bg-cover bg-center opacity-10" />
        <div className="relative text-center space-y-8">
          <div className="space-y-6">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              🇵🇰 Pakistan's Leading Real Estate Investment Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Invest in Pakistan's
              <span className="text-primary block"> Real Estate Future</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Discover premium real estate investment opportunities across Pakistan's major cities. From luxury
              residential complexes in Karachi to commercial developments in Lahore and Islamabad. Start with as little
              as PKR 50,000.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/projects">
                Explore Projects <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
              <Link href="/auth/signup">Start Investing Today</Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              No Hidden Fees
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Shariah Compliant
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Regulated Platform
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <Building2 className="h-8 w-8 text-primary" />
            <CardTitle>Premium Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Carefully vetted real estate projects across major Pakistani cities</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-primary" />
            <CardTitle>High Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Target returns of 15-25% annually on your real estate investments</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary" />
            <CardTitle>Secure Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Bank-grade security and transparent investment processes</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary" />
            <CardTitle>Community</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Join thousands of smart investors growing their wealth</CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* Rest of the landing page content */}
    </div>
  )
}
