import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, MapPin, Clock, TrendingUp, Search } from "lucide-react"
import Link from "next/link"
import { mockProjects, formatCurrency, calculateProgress } from "@/lib/mockData"

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Investment Projects</h1>
        <p className="text-muted-foreground">Discover premium real estate investment opportunities across Pakistan</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Find Your Perfect Investment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search projects..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="karachi">Karachi</SelectItem>
                <SelectItem value="lahore">Lahore</SelectItem>
                <SelectItem value="islamabad">Islamabad</SelectItem>
                <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="mixed">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Investment Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">PKR 5L - 20L</SelectItem>
                <SelectItem value="medium">PKR 20L - 50L</SelectItem>
                <SelectItem value="high">PKR 50L+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted overflow-hidden">
              <img
                src={project.images[0] || "/placeholder.svg"}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    project.status === "active" ? "default" : project.status === "funded" ? "secondary" : "outline"
                  }
                >
                  {project.status}
                </Badge>
                <Badge variant="outline" className="text-green-600">
                  {project.expectedReturn}% Returns
                </Badge>
              </div>
              <div>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Funding Progress</span>
                  <span className="font-medium">{calculateProgress(project.raisedAmount, project.targetAmount)}%</span>
                </div>
                <Progress value={calculateProgress(project.raisedAmount, project.targetAmount)} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(project.raisedAmount)} raised</span>
                  <span>{formatCurrency(project.targetAmount)} target</span>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Min. Investment</div>
                  <div className="font-medium">{formatCurrency(project.minInvestment)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Duration</div>
                  <div className="font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {project.duration} months
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Area</div>
                  <div className="font-medium">{project.area.toLocaleString()} sq ft</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Price/sq ft</div>
                  <div className="font-medium">{formatCurrency(project.pricePerSqFt)}</div>
                </div>
              </div>

              {/* Type & Risk */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  <Building2 className="h-3 w-3 mr-1" />
                  {project.type}
                </Badge>
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
              </div>

              {/* Action Button */}
              <Button asChild className="w-full">
                <Link href={`/projects/${project.id}`}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Details & Invest
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Projects
        </Button>
      </div>
    </div>
  )
}
