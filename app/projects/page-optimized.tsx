'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"

interface Project {
  _id: string
  title: string
  description?: string
  location?: any
  city?: string
  area?: string
  targetAmount?: number
  raisedAmount?: number
  expectedReturn?: any
  duration?: any
  riskLevel?: 'Low' | 'Medium' | 'High'
  status: 'active' | 'completed' | 'upcoming' | 'funded'
  images?: string[]
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

// Memoized Project Card Component
const ProjectCard = memo(({ project }: { project: Project }) => {
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount)
  }, [])

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'upcoming': return 'bg-yellow-500'
      case 'funded': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }, [])

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold line-clamp-2">{project.title}</h3>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
        
        {project.description && (
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          {project.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {typeof project.location === 'string' ? project.location : `${project.city || ''}, ${project.area || ''}`}
            </div>
          )}
          
          {project.targetAmount && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              Target: {formatCurrency(project.targetAmount)}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${project._id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

ProjectCard.displayName = 'ProjectCard'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Memoized filtered projects
  const filteredProjects = useMemo(() => {
    let filtered = projects

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(search) ||
        project.description?.toLowerCase().includes(search) ||
        project.city?.toLowerCase().includes(search) ||
        project.area?.toLowerCase().includes(search)
      )
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(project => project.status === selectedFilter)
    }

    return filtered
  }, [projects, searchTerm, selectedFilter])

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  const handleFilterChange = useCallback((value: string) => {
    setSelectedFilter(value)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Projects</h1>
          <p className="text-muted-foreground">
            Discover profitable real estate investment opportunities
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects by title, location, or description..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="funded">Funded</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || selectedFilter !== 'all' 
              ? 'No projects match your search criteria.' 
              : 'No projects available at the moment.'
            }
          </p>
        </div>
      )}
    </div>
  )
}
