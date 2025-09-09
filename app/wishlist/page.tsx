"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockProjects, formatCurrency, calculateProgress, type Project } from "@/lib/mockData"
import { Heart, MapPin, TrendingUp, Calendar, Trash2, ShoppingCart, BarChart3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<Project[]>([])

  useEffect(() => {
    // In a real app, this would come from localStorage or API
    const savedWishlist = localStorage.getItem("investx-wishlist")
    if (savedWishlist) {
      const wishlistIds = JSON.parse(savedWishlist)
      const items = mockProjects.filter((p) => wishlistIds.includes(p.id))
      setWishlistItems(items)
    }
  }, [])

  const removeFromWishlist = (projectId: string) => {
    const updatedItems = wishlistItems.filter((item) => item.id !== projectId)
    setWishlistItems(updatedItems)

    // Update localStorage
    const wishlistIds = updatedItems.map((item) => item.id)
    localStorage.setItem("investx-wishlist", JSON.stringify(wishlistIds))
  }

  const addToCart = (project: Project) => {
    // In a real app, this would add to cart state/API
    // TODO: Implement cart functionality
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
            <Link href={`/compare?projects=${wishlistItems.map((p) => p.id).join(",")}`}>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Compare All
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={project.images[0] || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => removeFromWishlist(project.id)}
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
                  <span className="text-sm">Min Investment</span>
                  <span className="font-semibold">{formatCurrency(project.minInvestment)}</span>
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
                    <span>{calculateProgress(project.raisedAmount, project.targetAmount)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${calculateProgress(project.raisedAmount, project.targetAmount)}%` }}
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
                  <Badge variant="outline">{project.type}</Badge>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/projects/${project.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      View Details
                    </Button>
                  </Link>
                  <Button className="flex-1" onClick={() => addToCart(project)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Invest
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </RoleGuard>
  )
}
