"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, MapPin, Shield, Calendar, Calculator, ShoppingCart, ArrowLeft, CheckCircle, Users, Target, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { ImageCarousel } from "@/components/image-carousel"

interface Project {
  _id: string
  title: string
  description: string
  location: {
    city: string
    area: string
    address: string
  }
  type: string
  status: string
  targetAmount: number
  raisedAmount: number
  minInvestment: number
  expectedReturn: number
  duration: number
  area: number
  pricePerSqFt: number
  totalValue: number
  timeline: {
    projectStart: string
    expectedCompletion: string
    phases: Array<{
      name: string
      duration: string
      status: string
    }>
  }
  developer: {
    name: string
    experience: string
    rating: number
    completedProjects: number
  }
  images: string[]
  riskLevel: string
  riskFactors: string[]
  amenities: string[]
  specifications: {
    bedrooms?: number
    bathrooms?: number
    parking: boolean
    floor: number
    facing: string
  }
  complianceStatus: {
    noc: boolean
    environmentalClearance: boolean
    buildingApproval: boolean
    utilityConnections: boolean
  }
  totalInvestors: number
  createdAt: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [investing, setInvesting] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      // Use admin API to get project details (in real app, create a public endpoint)
      const response = await fetch(`/api/admin/projects?id=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        const projectData = data.projects[0]
        if (projectData) {
          setProject(projectData)
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const calculateProgress = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100)
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'upcoming': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'funded': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleInvest = () => {
    setInvesting(true)
    // TODO: Implement actual investment flow
    alert('Investment feature coming soon! This would redirect to the investment flow.')
    setInvesting(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading project details...</div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  const progress = calculateProgress(project.raisedAmount, project.targetAmount)
  const remainingAmount = project.targetAmount - project.raisedAmount
  const investmentValue = Number.parseFloat(investmentAmount) || 0
  const projectedReturns = investmentValue * (project.expectedReturn / 100)

  const handleAddToCart = () => {
    if (investmentValue < project.minInvestment) {
      alert(`Minimum investment is ${formatCurrency(project.minInvestment)}`)
      return
    }

    // Create cart item
    const cartItem = {
      projectId: project._id,
      projectTitle: project.title,
      amount: investmentValue,
      projectImage: project.images && project.images.length > 0 ? project.images[0] : "/placeholder.svg",
      expectedReturn: project.expectedReturn,
      location: `${project.location?.area || ''}, ${project.location?.city || ''}`,
      addedAt: new Date().toISOString()
    }

    // Get existing cart from localStorage
    const existingCart = localStorage.getItem('investmentCart')
    let cartItems = existingCart ? JSON.parse(existingCart) : []

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex((item: any) => item.projectId === project._id)
    
    if (existingItemIndex >= 0) {
      // Update existing item
      cartItems[existingItemIndex].amount = investmentValue
      cartItems[existingItemIndex].addedAt = new Date().toISOString()
      alert('Investment amount updated in cart!')
    } else {
      // Add new item
      cartItems.push(cartItem)
      alert('Investment added to cart successfully!')
    }

    // Save to localStorage
    localStorage.setItem('investmentCart', JSON.stringify(cartItems))

    // Redirect to cart
    router.push("/cart")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="aspect-video bg-muted rounded-2xl overflow-hidden">
              <img
                src={project.images && project.images.length > 0 ? project.images[0] : "/placeholder.svg"}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(project.images || []).slice(1, 4).map((image, index) => (
              <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${project.title} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Project Images Carousel */}
          {project.images && project.images.length > 0 && (
            <div className="w-full">
              <ImageCarousel
                images={project.images}
                alt={project.title}
                className="w-full h-96"
                aspectRatio="video"
                showDots={true}
                showArrows={true}
              />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
              <Badge variant="outline">{project.type}</Badge>
              <Badge
                variant={
                  project.riskLevel === "low" ? "default" : project.riskLevel === "medium" ? "secondary" : "destructive"
                }
              >
                {project.riskLevel} risk
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground flex items-center mt-2">
              <MapPin className="h-4 w-4 mr-1" />
              {project.location?.area || 'N/A'}, {project.location?.city || 'N/A'}
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{project.expectedReturn}%</div>
                <div className="text-sm text-muted-foreground">Expected Returns</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{project.duration}m</div>
                <div className="text-sm text-muted-foreground">Investment Period</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{formatCurrency(project.minInvestment)}</div>
                <div className="text-sm text-muted-foreground">Min. Investment</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{project.area.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Area (sq ft)</div>
              </CardContent>
            </Card>
          </div>

          {/* Funding Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Funding Progress</span>
                  <span className="font-bold">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatCurrency(project.raisedAmount)} raised</span>
                  <span>{formatCurrency(remainingAmount)} remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Investment Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="investment">Investment Amount (PKR)</Label>
                <Input
                  id="investment"
                  type="number"
                  placeholder={`Min. ${formatCurrency(project.minInvestment)}`}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                />
              </div>
              {investmentValue > 0 && (
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between">
                    <span>Investment Share:</span>
                    <span className="font-medium">{((investmentValue / project.targetAmount) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Projected Returns:</span>
                    <span className="font-medium text-green-600">{formatCurrency(projectedReturns)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-bold">{formatCurrency(investmentValue + projectedReturns)}</span>
                  </div>
                </div>
              )}
              <Button onClick={handleAddToCart} className="w-full" disabled={investmentValue < project.minInvestment}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{project.description}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Developer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Developer:</span>
                    <span className="font-medium">
                      {typeof project.developer === 'string' 
                        ? project.developer 
                        : project.developer?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Project Type:</span>
                    <span className="font-medium capitalize">{project.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{project.location?.city || project.city}</span>
                  </div>
                  {typeof project.developer === 'object' && project.developer && (
                    <>
                      <div className="flex justify-between">
                        <span>Experience:</span>
                        <span className="font-medium">{project.developer.experience || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Projects:</span>
                        <span className="font-medium">{project.developer.completedProjects || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="font-medium">{project.developer.rating || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Risk Level:</span>
                    <Badge
                      variant={
                        project.riskLevel === "low"
                          ? "default"
                          : project.riskLevel === "medium"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {project.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Returns:</span>
                    <span className="font-medium text-green-600">{project.expectedReturn}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investment Period:</span>
                    <span className="font-medium">{project.duration} months</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financials">
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Target Amount:</span>
                    <span className="font-medium">{formatCurrency(project.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Raised:</span>
                    <span className="font-medium">{formatCurrency(project.raisedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-medium">{formatCurrency(remainingAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Min Investment:</span>
                    <span className="font-medium">{formatCurrency(project.minInvestment)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Area:</span>
                    <span className="font-medium">{project.area.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per sq ft:</span>
                    <span className="font-medium">{formatCurrency(project.pricePerSqFt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Returns:</span>
                    <span className="font-medium text-green-600">{project.expectedReturn}% annually</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Investment Period:</span>
                    <span className="font-medium">{project.duration} months</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities">
          <Card>
            <CardHeader>
              <CardTitle>Project Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(project.amenities && project.amenities.length > 0) ? (
                  project.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{amenity}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No amenities listed for this project
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  <div>
                    <div className="font-medium">Project Launch</div>
                    <div className="text-sm text-muted-foreground">
                      {project.timeline?.projectStart 
                        ? new Date(project.timeline.projectStart).toLocaleDateString()
                        : 'TBD'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  <div>
                    <div className="font-medium">Construction Phase</div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-muted rounded-full"></div>
                  <div>
                    <div className="font-medium">Project Completion</div>
                    <div className="text-sm text-muted-foreground">
                      {project.timeline?.expectedCompletion 
                        ? new Date(project.timeline.expectedCompletion).toLocaleDateString()
                        : 'TBD'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
