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
import { Building2, MapPin, Shield, Calendar, Calculator, ShoppingCart, ArrowLeft, CheckCircle, Users, Target, TrendingUp, Clock, Eye, Package, List } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ImageCarousel } from "@/components/image-carousel"
import { InventorySlider } from "@/components/inventory-slider"
import { formatPKR, formatPKRPercentage, validatePKRAmount, parsePKR, amountToWordsPKR } from "@/lib/currency"
import { useAuth } from "@/hooks/useAuth"

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
};



export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { user, hasRole } = useAuth()
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user can invest (only investor role, not admin)
  const canInvest = hasRole('investor') && !hasRole('admin')
  const isGuest = !user || user.role === 'guest'

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      console.log('Fetching project with ID:', projectId);
      
      // Use public API endpoint for project details
      const response = await fetch(`/api/projects/${projectId}`)
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json()
      console.log('Response data:', data);
      
      if (data.success && data.project) {
        console.log('Project data received:', data.project)
        console.log('Project images:', data.project.images)
        setProject(data.project)
      } else {
        console.error('Project not found or API error:', data)
        throw new Error(data.message || 'Project not found')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      // Show user-friendly error
      alert(`Failed to load project details: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[4/3] bg-muted rounded-2xl overflow-hidden relative">
              {project.images && project.images.length > 0 ? (
                <ImageCarousel
                  images={project.images}
                  alt={project.title}
                  className="w-full h-full"
                  aspectRatio="video"
                  showDots={true}
                  showArrows={true}
                />
              ) : (
                <Image
                  src="/placeholder.jpg"
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Inventory Slider - Displayed beneath the project image */}
            <div id="inventory-slider" className="" style={{
              minHeight: '500px',
              minWidth: '500px',
              padding: '1rem 0'
            }}>
              <InventorySlider projectId={projectId} />
            </div>

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
                {isGuest && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview Mode
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground flex items-center mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                {project.location?.area || 'N/A'}, {project.location?.city || 'N/A'}
              </p>
              {isGuest && (
                <p className="text-sm text-blue-600 mt-2 flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  You're viewing this project as a guest. Register as an investor to invest.
                </p>
              )}
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
                  <div className="text-2xl font-bold">{formatPKR(project.minInvestment)}</div>
                  <div className="text-sm text-muted-foreground">Min. Investment</div>
                </CardContent>
              </Card>
              <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{project.area ? project.area.toLocaleString() : 'N/A'}</div>
                <div className="text-sm text-muted-foreground">Total Area (sq ft)</div>
              </CardContent>
              </Card>
            </div>
          </div>

          {/* Right: Sidebar with Project Info */}
          <div className="space-y-6">
            Funding Progress
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Funding Progress</span>
                    <span className="font-bold">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPKR(project.raisedAmount, { compact: true })} raised</span>
                    <span>{formatPKR(remainingAmount, { compact: true })} remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Actions - For all users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Available Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Invest in specific inventory items below. Each item represents available units in this project.
                </p>
                <Link href="#inventory-slider">
                  <Button variant="outline" className="w-full">
                    <List className="w-4 h-4 mr-2" />
                    View Available Inventory
                  </Button>
                </Link>
                {hasRole('admin') && (
                  <Link href={`/inventory/new?projectId=${projectId}`}>
                    <Button variant="outline" className="w-full">
                      <Package className="w-4 h-4 mr-2" />
                      Add Inventory
                    </Button>
                  </Link>
                )}
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
                    <span className="font-medium">{project.location?.city || 'N/A'}</span>
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
                    <span className="font-medium">{formatPKR(project.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Raised:</span>
                    <span className="font-medium">{formatPKR(project.raisedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-medium">{formatPKR(remainingAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Min Investment:</span>
                    <span className="font-medium">{formatPKR(project.minInvestment)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Area:</span>
                    <span className="font-medium">{project.area} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per sq ft:</span>
                    <span className="font-medium">{formatPKR(project.pricePerSqFt)}</span>
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
    </div>
  )
}
