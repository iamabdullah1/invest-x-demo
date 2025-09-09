"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Target, TrendingUp, MapPin, Calendar, Heart, ShoppingCart, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Project {
  _id: string
  id: string
  title: string
  location: string
  city: string
  type: "residential" | "commercial" | "mixed"
  status: "active" | "funded" | "completed"
  targetAmount: number
  raisedAmount: number
  minInvestment: number
  expectedReturn: number
  duration: number
  images: string[]
  description: string
  riskLevel: "low" | "medium" | "high"
  progress: number
  category: string
  features: string[]
}

interface RecommendationsData {
  recommendations: Project[]
  filters: {
    riskTolerance: string
    investmentAmount: number
    preferredCity: string
    propertyType: string
    duration: string
  }
  totalProjects: number
  filteredCount: number
}

export default function RecommendationsPage() {
  const [riskTolerance, setRiskTolerance] = useState<string>("medium")
  const [investmentAmount, setInvestmentAmount] = useState([5000000]) // PKR 50 Lakh - for API calls
  const [sliderValue, setSliderValue] = useState([5000000]) // PKR 50 Lakh - for slider display
  const [preferredCity, setPreferredCity] = useState<string>("all")
  const [propertyType, setPropertyType] = useState<string>("all")
  const [duration, setDuration] = useState<string>("all")
  const [recommendations, setRecommendations] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateTimer, setUpdateTimer] = useState<number | null>(null)

  // Debounced effect for investment amount changes
  useEffect(() => {
    if (sliderValue[0] !== investmentAmount[0]) {
      setUpdateTimer(5) // Start 5 second countdown
      
      const countdownInterval = setInterval(() => {
        setUpdateTimer(prev => {
          if (prev && prev > 1) {
            return prev - 1
          } else {
            clearInterval(countdownInterval)
            return null
          }
        })
      }, 100) // Update every 100ms for smooth countdown

      const timeoutId = setTimeout(() => {
        setInvestmentAmount(sliderValue)
        setUpdateTimer(null)
        clearInterval(countdownInterval)
      }, 500) // 500ms delay

      return () => {
        clearTimeout(timeoutId)
        clearInterval(countdownInterval)
      }
    }
  }, [sliderValue, investmentAmount])

  // Fetch recommendations when filters change (except sliderValue)
  useEffect(() => {
    fetchRecommendations()
  }, [riskTolerance, investmentAmount, preferredCity, propertyType, duration])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        riskTolerance,
        investmentAmount: investmentAmount[0].toString(),
        preferredCity,
        propertyType,
        duration
      })

      const response = await fetch(`/api/recommendations?${params}`, {
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setRecommendations(result.data.recommendations)
      } else {
        setError(result.error || 'Failed to fetch recommendations')
        console.error('Failed to fetch recommendations:', result.error)
      }
    } catch (error) {
      setError('Network error occurred')
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRecommendations = (): Project[] => {
    return recommendations
  }

  const filteredRecommendations = getRecommendations()

  const addToWishlist = (projectId: string) => {
    const savedWishlist = localStorage.getItem("investx-wishlist")
    const wishlistIds = savedWishlist ? JSON.parse(savedWishlist) : []

    if (!wishlistIds.includes(projectId)) {
      wishlistIds.push(projectId)
      localStorage.setItem("investx-wishlist", JSON.stringify(wishlistIds))
    }
  }

  if (loading) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Investment Recommendations</h1>
              <p className="text-muted-foreground">Personalized suggestions based on your preferences</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading recommendations...</p>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (error) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Investment Recommendations</h1>
              <p className="text-muted-foreground">Personalized suggestions based on your preferences</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchRecommendations}>Try Again</Button>
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard requiredRole="investor">
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
                    <SelectItem value="Faisalabad">Faisalabad</SelectItem>
                    <SelectItem value="Multan">Multan</SelectItem>
                    <SelectItem value="Peshawar">Peshawar</SelectItem>
                    <SelectItem value="Quetta">Quetta</SelectItem>
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Maximum Investment Amount: {formatCurrency(sliderValue[0])}
                  </label>
                  {updateTimer && (
                    <span className="text-xs text-blue-600 font-medium animate-pulse">
                      Updating in 0.{updateTimer}s...
                    </span>
                  )}
                </div>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={50000000}
                  min={500000}
                  step={500000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rs 5 Lakh</span>
                  <span>Rs 5 Crore</span>
                </div>
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
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">{filteredRecommendations.length} Recommended Projects</h2>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>

          {!loading && filteredRecommendations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground">Try adjusting your preferences to see more options</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((project, index) => (
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
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
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
