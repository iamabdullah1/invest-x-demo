"use client"

import { useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { mockProjects, formatCurrency, calculateProgress, type Project } from "@/lib/mockData"
import { Target, TrendingUp, MapPin, Calendar, Heart, ShoppingCart, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function RecommendationsPage() {
  const [riskTolerance, setRiskTolerance] = useState<string>("medium")
  const [investmentAmount, setInvestmentAmount] = useState([5000000]) // PKR 50 Lakh
  const [preferredCity, setPreferredCity] = useState<string>("all")
  const [propertyType, setPropertyType] = useState<string>("all")
  const [duration, setDuration] = useState<string>("all")

  const getRecommendations = (): Project[] => {
    let filtered = mockProjects.filter((project) => project.status === "active")

    // Filter by risk tolerance
    if (riskTolerance !== "all") {
      filtered = filtered.filter((project) => project.riskLevel === riskTolerance)
    }

    // Filter by minimum investment
    filtered = filtered.filter((project) => project.minInvestment <= investmentAmount[0])

    // Filter by city
    if (preferredCity !== "all") {
      filtered = filtered.filter((project) => project.city === preferredCity)
    }

    // Filter by property type
    if (propertyType !== "all") {
      filtered = filtered.filter((project) => project.type === propertyType)
    }

    // Filter by duration
    if (duration !== "all") {
      const maxDuration = Number.parseInt(duration)
      filtered = filtered.filter((project) => project.duration <= maxDuration)
    }

    // Sort by expected return (descending)
    return filtered.sort((a, b) => b.expectedReturn - a.expectedReturn)
  }

  const recommendations = getRecommendations()

  const addToWishlist = (projectId: string) => {
    const savedWishlist = localStorage.getItem("investx-wishlist")
    const wishlistIds = savedWishlist ? JSON.parse(savedWishlist) : []

    if (!wishlistIds.includes(projectId)) {
      wishlistIds.push(projectId)
      localStorage.setItem("investx-wishlist", JSON.stringify(wishlistIds))
    }
  }

  return (
    <RoleGuard allowedRoles={["investor"]}>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Investment Recommendations</h1>
            <p className="text-muted-foreground">Personalized suggestions based on your preferences</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Customize Your Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Risk Tolerance</label>
                <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred City</label>
                <Select value={preferredCity} onValueChange={setPreferredCity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="Karachi">Karachi</SelectItem>
                    <SelectItem value="Lahore">Lahore</SelectItem>
                    <SelectItem value="Islamabad">Islamabad</SelectItem>
                    <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Property Type</label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="mixed">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Maximum Investment Amount: {formatCurrency(investmentAmount[0])}
                </label>
                <Slider
                  value={investmentAmount}
                  onValueChange={setInvestmentAmount}
                  max={50000000}
                  min={500000}
                  step={500000}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Duration</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Duration</SelectItem>
                    <SelectItem value="12">Up to 1 year</SelectItem>
                    <SelectItem value="24">Up to 2 years</SelectItem>
                    <SelectItem value="36">Up to 3 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div>
          <h2 className="text-xl font-semibold mb-4">{recommendations.length} Recommended Projects</h2>

          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground">Try adjusting your preferences to see more options</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((project, index) => (
                <Card key={project.id} className="overflow-hidden relative">
                  {index === 0 && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Top Pick
                      </Badge>
                    </div>
                  )}

                  <div className="relative h-48">
                    <Image
                      src={project.images[0] || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
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
                      <Button variant="outline" size="sm" onClick={() => addToWishlist(project.id)}>
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Link href={`/projects/${project.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          View Details
                        </Button>
                      </Link>
                      <Button className="flex-1">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Invest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  )
}
