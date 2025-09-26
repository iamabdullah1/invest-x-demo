"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Target, TrendingUp, MapPin, Calendar, Heart, Sparkles } from "lucide-react"
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
  const [investmentAmount, setInvestmentAmount] = useState([5000000]) // PKR 50 Lakh
  const [preferredCity, setPreferredCity] = useState<string>("all")
  const [propertyType, setPropertyType] = useState<string>("all")
  const [duration, setDuration] = useState<string>("all")
  const [allProjects, setAllProjects] = useState<Project[]>([]) // Store all projects
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all projects once on component mount
  useEffect(() => {
    fetchAllProjects()
  }, [])

  const fetchAllProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/projects', {
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        // Transform projects to match the expected format
        const transformedProjects = result.projects.map((project: any) => {
          // Calculate progress
          const progress = project.targetAmount > 0 ? 
            Math.min((project.raisedAmount / project.targetAmount) * 100, 100) : 0;

          // Calculate minimum investment (1% of target, minimum PKR 100,000, maximum PKR 5,000,000)
          const minInvestmentCalc = Math.max(
            100000, // Minimum PKR 1 Lakh
            Math.min(
              project.targetAmount * 0.01, // 1% of target
              5000000 // Maximum PKR 50 Lakh
            )
          );

          // Map risk level based on expected return
          let riskLevel: 'low' | 'medium' | 'high' = 'medium';
          if (project.expectedReturn <= 10) {
            riskLevel = 'low';
          } else if (project.expectedReturn >= 18) {
            riskLevel = 'high';
          }

          return {
            _id: project._id,
            id: project._id.toString(),
            title: project.title,
            location: project.location?.address || `${project.location?.area}, ${project.location?.city}` || project.city || 'Location TBD',
            city: project.location?.city || project.city || 'Unknown',
            type: project.type,
            status: project.status,
            targetAmount: project.targetAmount,
            raisedAmount: project.raisedAmount,
            minInvestment: Math.round(minInvestmentCalc),
            expectedReturn: project.expectedReturn,
            duration: project.duration || 24, // Default 2 years
            images: project.images || ['/placeholder.svg'],
            description: project.description || 'No description available',
            riskLevel,
            progress: Math.round(progress),
            category: project.category || project.type,
            features: project.features || []
          };
        });

        setAllProjects(transformedProjects.filter((p: Project) => p.status === 'active'));
      } else {
        setError(result.error || 'Failed to fetch projects')
        console.error('Failed to fetch projects:', result.error)
      }
    } catch (error) {
      setError('Network error occurred')
      console.error('Error fetching projects:', error)
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

  // Client-side filtering function
  const getFilteredRecommendations = (): Project[] => {
    let filtered = [...allProjects];

    // Filter by risk tolerance
    if (riskTolerance !== "all") {
      filtered = filtered.filter((project) => project.riskLevel === riskTolerance);
    }

    // Filter by minimum investment amount
    filtered = filtered.filter((project) => project.minInvestment <= investmentAmount[0]);

    // Filter by city
    if (preferredCity !== "all") {
      filtered = filtered.filter((project) => 
        project.city.toLowerCase().includes(preferredCity.toLowerCase())
      );
    }

    // Filter by property type
    if (propertyType !== "all") {
      filtered = filtered.filter((project) => project.type === propertyType);
    }

    // Filter by duration
    if (duration !== "all") {
      const maxDuration = parseInt(duration);
      filtered = filtered.filter((project) => project.duration <= maxDuration);
    }

    // Sort by expected return (descending), then by progress (ascending), then by newest first
    return filtered.sort((a, b) => {
      // Primary sort: Expected return (descending)
      if (a.expectedReturn !== b.expectedReturn) {
        return b.expectedReturn - a.expectedReturn;
      }
      
      // Secondary sort: Progress (ascending - prefer newer projects)
      if (a.progress !== b.progress) {
        return a.progress - b.progress;
      }
      
      // Tertiary sort: Alphabetical by title
      return a.title.localeCompare(b.title);
    });
  }

  const getRecommendations = (): Project[] => {
    return getFilteredRecommendations()
  }

  const filteredRecommendations = getRecommendations()

  const [wishlistItems, setWishlistItems] = useState<string[]>([])

  // Load wishlist items on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("investx-wishlist")
    const wishlistIds = savedWishlist ? JSON.parse(savedWishlist) : []
    setWishlistItems(wishlistIds)
  }, [])

  const addToWishlist = (projectId: string) => {
    const savedWishlist = localStorage.getItem("investx-wishlist")
    const wishlistIds = savedWishlist ? JSON.parse(savedWishlist) : []

    if (!wishlistIds.includes(projectId)) {
      wishlistIds.push(projectId)
      localStorage.setItem("investx-wishlist", JSON.stringify(wishlistIds))
      setWishlistItems(wishlistIds)
      // You can add a toast notification here if you have a toast system
    }
  }

  const removeFromWishlist = (projectId: string) => {
    const savedWishlist = localStorage.getItem("investx-wishlist")
    const wishlistIds = savedWishlist ? JSON.parse(savedWishlist) : []
    const updatedWishlist = wishlistIds.filter((id: string) => id !== projectId)
    
    localStorage.setItem("investx-wishlist", JSON.stringify(updatedWishlist))
    setWishlistItems(updatedWishlist)
  }

  const toggleWishlist = (projectId: string) => {
    if (wishlistItems.includes(projectId)) {
      removeFromWishlist(projectId)
    } else {
      addToWishlist(projectId)
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
              <Button onClick={fetchAllProjects}>Try Again</Button>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {filteredRecommendations.length} Recommended Projects
              {allProjects.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (of {allProjects.length} total)
                </span>
              )}
            </h2>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Loading projects...</span>
              </div>
            )}
          </div>

          {!loading && filteredRecommendations.length === 0 && allProjects.length > 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground">Try adjusting your preferences to see more options</p>
              </CardContent>
            </Card>
          ) : !loading && allProjects.length > 0 ? (
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
                      <Button 
                        variant={wishlistItems.includes(project.id) ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => toggleWishlist(project.id)}
                        className={wishlistItems.includes(project.id) ? "text-white bg-red-500 hover:bg-red-600" : ""}
                      >
                        <Heart className={`h-4 w-4 ${wishlistItems.includes(project.id) ? 'fill-current' : ''}`} />
                      </Button>
                      <Link href={`/projects/${project.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !loading && allProjects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No projects available</h3>
                <p className="text-muted-foreground">Check back later for new investment opportunities</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </RoleGuard>
  )
}
