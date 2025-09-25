'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"

interface Project {
  _id: string
  title: string
  description: string
  location: { city: string; area: string; address: string }
  type: string
  status: string
  targetAmount: number
  minInvestment: number
  expectedReturn: number
  duration: number
  area: number
  pricePerSqFt: number
  timeline: {
    projectStart: string
    expectedCompletion: string
  }
  developer: { name: string }
  images: string[]
  riskLevel: string
  amenities: string[]
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [amenities, setAmenities] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    type: '',
    status: '',
    developer: '',
    startDate: '',
    endDate: '',
    riskLevel: ''
  })

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/admin/projects?id=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        const projectData = data.projects[0]
        
        if (projectData) {
          setProject(projectData)
          setAmenities(projectData.amenities || [])
          setFormData({
            title: projectData.title || '',
            description: projectData.description || '',
            location: projectData.location?.area || '',
            city: projectData.location?.city || '',
            type: projectData.type || '',
            status: projectData.status || '',
            developer: projectData.developer?.name || '',
            startDate: projectData.timeline?.projectStart ? 
              new Date(projectData.timeline.projectStart).toISOString().split('T')[0] : '',
            endDate: projectData.timeline?.expectedCompletion ? 
              new Date(projectData.timeline.expectedCompletion).toISOString().split('T')[0] : '',
            riskLevel: projectData.riskLevel || ''
          })
          
          if (projectData.images && projectData.images.length > 0) {
            setImagePreview(projectData.images[0])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview('')
  }

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities((prev) => [...prev, newAmenity.trim()])
      setNewAmenity('')
    }
  }

  const removeAmenity = (amenity: string) => {
    setAmenities((prev) => prev.filter((a) => a !== amenity))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData = new FormData()
      
      // Add project ID
      submitData.append('projectId', projectId)
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })

      // Add amenities as JSON
      submitData.append('amenities', JSON.stringify(amenities))

      // Add existing image URL if no new image selected
      if (!selectedImage && project?.images?.[0]) {
        submitData.append('existingImageUrl', project.images[0])
      }

      // Add new image if selected
      if (selectedImage) {
        submitData.append('image', selectedImage)
      }

      const response = await fetch('/api/admin/projects', {
        method: 'PUT',
        body: submitData,
      })

      if (response.ok) {
        router.push('/admin/projects')
        router.refresh()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading project...</div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (!project) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <Link href="/admin/projects">
              <Button>Back to Projects</Button>
            </Link>
          </div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Project</h1>
            <p className="text-gray-600">Update project details and information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the project..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Project Type</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="mixed-use">Mixed Use</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lahore">Lahore</SelectItem>
                          <SelectItem value="karachi">Karachi</SelectItem>
                          <SelectItem value="islamabad">Islamabad</SelectItem>
                          <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="location">Area/Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., DHA Phase 5"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="developer">Developer Name</Label>
                    <Input
                      id="developer"
                      value={formData.developer}
                      onChange={(e) => handleInputChange('developer', e.target.value)}
                      placeholder="Developer Company Name"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate">Expected Completion</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Project preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No image selected</p>
                    </div>
                  )}

                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <Select value={formData.riskLevel} onValueChange={(value) => handleInputChange('riskLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low Risk</SelectItem>
                        <SelectItem value="Medium">Medium Risk</SelectItem>
                        <SelectItem value="High">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Amenities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an amenity (e.g., Swimming Pool, Gym, etc.)"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    />
                    <Button type="button" onClick={addAmenity}>
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity) => (
                      <Badge
                        key={amenity}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {amenity}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeAmenity(amenity)}
                        />
                      </Badge>
                    ))}
                  </div>
                  
                  {amenities.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No amenities added yet. Add some amenities to make your project more attractive.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? 'Updating Project...' : 'Update Project'}
                  </Button>

                  <Link href="/admin/projects" className="block">
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </RoleGuard>
  )
}
