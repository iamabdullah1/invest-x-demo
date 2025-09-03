"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, MapPin, Shield, Calendar, Calculator, ShoppingCart, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getProjectById, formatCurrency, calculateProgress } from "@/lib/mockData"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)

  const project = getProjectById(params.id as string)

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <p className="text-muted-foreground mt-2">The project you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link href="/projects">Back to Projects</Link>
        </Button>
      </div>
    )
  }

  const progressPercentage = calculateProgress(project.raisedAmount, project.targetAmount)
  const remainingAmount = project.targetAmount - project.raisedAmount
  const investmentValue = Number.parseFloat(investmentAmount) || 0
  const shares = investmentValue > 0 ? Math.floor((investmentValue / project.minInvestment) * 100) : 0
  const projectedReturns = investmentValue * (project.expectedReturn / 100)

  const handleAddToCart = () => {
    if (investmentValue < project.minInvestment) {
      alert(`Minimum investment is ${formatCurrency(project.minInvestment)}`)
      return
    }
    // Add to cart logic here
    router.push("/cart")
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/projects">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
      </Button>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="aspect-video bg-muted rounded-2xl overflow-hidden">
            <img
              src={project.images[0] || "/placeholder.svg"}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {project.images.slice(1, 4).map((image, index) => (
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
              {project.location}
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
                  <span className="font-bold">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
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
                    <span>Shares:</span>
                    <span className="font-medium">{shares}</span>
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
                    <span className="font-medium">{project.developer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Project Type:</span>
                    <span className="font-medium capitalize">{project.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{project.city}</span>
                  </div>
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
                {project.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{amenity}</span>
                  </div>
                ))}
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
                      {new Date(project.startDate).toLocaleDateString()}
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
                      {new Date(project.endDate).toLocaleDateString()}
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
