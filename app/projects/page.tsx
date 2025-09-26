'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, DollarSign, Calendar, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ImageCarousel } from "@/components/image-carousel"
import { formatPKR, formatPKRPercentage } from "@/lib/currency"

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
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Early return if project is invalid
  if (!project || !project._id) {
    console.warn('Invalid project data:', project)
    return null
  }
  
  // Check if project is in wishlist on load
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const response = await fetch('/api/user/wishlist')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.wishlist) {
            const isInList = data.wishlist.some((item: any) => item._id === project._id)
            setIsInWishlist(isInList)
          }
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error)
      }
    }
    
    checkWishlistStatus()
  }, [project._id])
  
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'upcoming': return 'bg-yellow-500'
      case 'funded': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }, [])

  const getProjectImage = useCallback((project: Project) => {
    try {
      // If project has images, use the first one
      if (project.images && Array.isArray(project.images) && project.images.length > 0 && project.images[0]) {
        return project.images[0]
      }

      // Fallback images based on project type or location
      const fallbackImages = [
        '/modern-apartments-islamabad.png',
        '/luxury-residential-karachi.png',
        '/commercial-plaza-lahore.png',
        '/modern-residential-complex-karachi.png',
        '/residential-development-rawalpindi.png',
        '/lahore-gulberg-plaza.png'
      ]

      // Use project ID or title to consistently select the same fallback image
      const seed = (project._id || project.title || 'default').toString()
      const index = seed.length % fallbackImages.length
      return fallbackImages[index]
    } catch (error) {
      console.error('Error getting project image:', error)
      return '/placeholder.jpg'
    }
  }, [])

  const toggleWishlist = async () => {
    try {
      setWishlistLoading(true)
      
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/user/wishlist?projectId=${project._id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setIsInWishlist(false)
        } else {
          alert('Failed to remove from wishlist')
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ projectId: project._id })
        })
        
        if (response.ok) {
          setIsInWishlist(true)
        } else {
          alert('Failed to add to wishlist')
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      alert('Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

  return (
    <Card className="h-full overflow-hidden">
      {/* Project Image/Carousel */}
      <div className="relative h-48 w-full bg-gray-100">
        {project.images && project.images.length > 1 ? (
          // Use ImageCarousel for multiple images
          <ImageCarousel
            images={project.images}
            alt={project.title}
            className="w-full h-48"
            aspectRatio="video"
            showDots={true}
            showArrows={true}
          />
        ) : (
          // Use single Image for one or no images
          <Image
            src={getProjectImage(project)}
            alt={project.title || 'Project Image'}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            onError={(e) => {
              // If image fails to load, show placeholder
              const target = e.currentTarget
              target.src = '/placeholder.jpg'
            }}
          />
        )}
        
        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white z-10"
          onClick={toggleWishlist}
          disabled={wishlistLoading}
        >
          <Heart 
            className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </Button>
      </div>

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
          
          {project.targetAmount && !isNaN(Number(project.targetAmount)) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 mr-2" />
              Target: {formatPKR(Number(project.targetAmount), { compact: true })}
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

  // Utility functions
  const calculateProgress = useCallback((raised: number, target: number) => {
    if (target === 0) return 0
    return Math.min((raised / target) * 100, 100)
  }, [])

  const getStatusBadgeColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'funded': return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }, [])

  const getRiskBadgeColor = useCallback((risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }, [])

  // Memoized filtered projects
  const filteredProjects = useMemo(() => {
    try {
      let filtered = projects.filter(project => project && project._id) // Filter out invalid projects

      // Apply search filter
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase()
        filtered = filtered.filter(project =>
          (project.title?.toLowerCase() || '').includes(search) ||
          (project.description?.toLowerCase() || '').includes(search) ||
          (project.city?.toLowerCase() || '').includes(search) ||
          (project.area?.toLowerCase() || '').includes(search)
        )
      }

      // Apply status filter
      if (selectedFilter !== 'all') {
        filtered = filtered.filter(project => project.status === selectedFilter)
      }

      return filtered
    } catch (error) {
      console.error('Error filtering projects:', error)
      return []
    }
  }, [projects, searchTerm, selectedFilter])

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects')

      if (response.ok) {
        const data = await response.json()

        // Make sure we're setting the projects correctly
        if (data.success && data.projects) {
          setProjects(data.projects)
        } else {
          setProjects([])
        }
      } else {
        console.error('Failed to fetch projects:', response.status, response.statusText)
        setProjects([])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Debug filter state changes
  useEffect(() => {
    console.log('Filter state changed:', { searchTerm, selectedFilter, projectsCount: projects.length, filteredCount: filteredProjects.length })
  }, [searchTerm, selectedFilter, projects, filteredProjects])

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Investment Projects</h1>
        <p className="text-gray-600 mb-6">
          Discover exciting investment opportunities across various sectors and locations.
        </p>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search projects by title, location, or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Simple filter options for investors */}
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => handleFilterChange('all')}
              size="sm"
            >
              All Projects
            </Button>
            <Button
              variant={selectedFilter === 'active' ? 'default' : 'outline'}
              onClick={() => handleFilterChange('active')}
              size="sm"
            >
              Available Now
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || selectedFilter !== 'all' 
              ? 'No projects match your current filters.' 
              : 'No projects available at the moment.'}
          </p>
          {(searchTerm || selectedFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedFilter('all')
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
