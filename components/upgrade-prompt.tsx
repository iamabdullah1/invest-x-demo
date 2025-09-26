"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, ShieldCheck, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

interface UpgradePromptProps {
  title?: string
  message?: string
  features?: string[]
  className?: string
}

export function UpgradePrompt({ 
  title = "Become an Investor", 
  message = "To invest in projects, you need to upgrade to an investor account.",
  features = [
    "Invest in verified real estate projects",
    "Track your portfolio performance", 
    "Access detailed financial reports",
    "Receive priority project notifications"
  ],
  className = ""
}: UpgradePromptProps) {
  return (
    <Card className={`border-2 border-dashed border-primary/20 bg-primary/5 ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
        <p className="text-muted-foreground">{message}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Investor Benefits:</h4>
          <div className="grid gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/auth/register" className="flex-1">
            <Button className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Register as Investor
            </Button>
          </Link>
          <Link href="/auth/login" className="flex-1">
            <Button variant="outline" className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />
              Login
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            Free • Secure • No Hidden Fees
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}