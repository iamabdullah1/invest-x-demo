"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, TrendingUp, Calendar, Trash2, ShoppingCart, BarChart3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Project {
  _id: string
  title: string
  description: string
  location: string
  targetAmount: number
  raisedAmount: number
  expectedReturn: number
  duration: number
  riskLevel: string
  status: string
  images?: string[]
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const calculateProgress = (raised: number, target: number) => {
    if (target === 0) return 0
    return Math.min((raised / target) * 100, 100)
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/wishlist')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setWishlistItems(data.wishlist || [])
        } else {
          setError(data.message || 'Failed to fetch wishlist')
        }
      } else {
        setError('Failed to fetch wishlist')
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setError('Failed to fetch wishlist')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (projectId: string) => {
    try {
      const response = await fetch(`/api/user/wishlist?projectId=${projectId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setWishlistItems(prev => prev.filter(item => item._id !== projectId))
        } else {
          alert(data.message || 'Failed to remove from wishlist')
        }
      } else {
        alert('Failed to remove from wishlist')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      alert('Failed to remove from wishlist')
    }
  }

  if (loading) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">Save projects you're interested in for later</p>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (error) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">Save projects you're interested in for later</p>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchWishlist}>Try Again</Button>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">Save projects you're interested in for later</p>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">Start adding projects you're interested in</p>
              <Link href="/projects">
                <Button>Browse Projects</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard requiredRole="investor">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">{wishlistItems.length} saved projects</p>
          </div>

          <div className="flex gap-2">
            <Link href={`/compare?projects=${wishlistItems.map((p) => p._id).join(",")}`}>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Compare All
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((project) => (
            <Card key={project._id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={project.images?.[0] || "/placeholder.jpg"}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => removeFromWishlist(project._id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {project.location}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Expected Return</span>
                  <div className="flex items-center gap-1 text-green-600 font-semibold">
                    <TrendingUp className="h-4 w-4" />
                    {project.expectedReturn}%
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Target Amount</span>
                  <span className="font-semibold">{formatCurrency(project.targetAmount)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Duration</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-semibold">{project.duration} months</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Funding Progress</span>
                    <span>{calculateProgress(project.raisedAmount, project.targetAmount).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(project.raisedAmount, project.targetAmount)}%` } as React.CSSProperties}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge
                    variant={
                      project.riskLevel === "low"
                        ? "default"
                        : project.riskLevel === "medium"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {project.riskLevel} risk
                  </Badge>
                  <Badge variant="outline">{project.status}</Badge>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/projects/${project._id}`} className="w-full">
                    <Button className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Invest Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </RoleGuard>
  )
}
