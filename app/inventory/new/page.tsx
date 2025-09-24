"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react"
import Link from "next/link"

function AddInventoryCategoryForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const searchParams = useSearchParams()
  const projectIdFromParams = searchParams.get("projectId") || ""

  const [projectData, setProjectData] = useState<any>(null)
  const [loadingProject, setLoadingProject] = useState(false)

  const [formData, setFormData] = useState({
    projectId: projectIdFromParams,
    country: "",
    city: "",
    area: "",
    title: "",
    description: "",
    propertyType: "",
    propertySubType: "",
    totalArea: "",
    minSquareFeet: "",
    pricePerSquareFoot: "",
    inventoryImages: [] as string[],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch project data when projectId is available
  useEffect(() => {
    if (projectIdFromParams) {
      fetchProjectData(projectIdFromParams)
    }
  }, [projectIdFromParams])

  const fetchProjectData = async (projectId: string) => {
    try {
      setLoadingProject(true)
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProjectData(data.project)
          // Pre-fill form with project data
          setFormData(prev => ({
            ...prev,
            country: data.project.location?.country || "",
            city: data.project.location?.city || "",
            area: data.project.location?.area || "",
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching project data:", error)
    } finally {
      setLoadingProject(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.projectId) newErrors.projectId = "Project is required"
    if (!formData.country) newErrors.country = "Country is required"
    if (!formData.city) newErrors.city = "City is required"
    if (!formData.area) newErrors.area = "Area is required"
    if (!formData.title) newErrors.title = "Title is required"
    if (!formData.description) newErrors.description = "Description is required"
    if (!formData.propertyType) newErrors.propertyType = "Property type is required"
    if (!formData.propertySubType) newErrors.propertySubType = "Property sub-type is required"
    if (!formData.totalArea) newErrors.totalArea = "Total area is required"
    if (!formData.minSquareFeet) newErrors.minSquareFeet = "Minimum square feet is required"
    if (!formData.pricePerSquareFoot) newErrors.pricePerSquareFoot = "Price per square foot is required"

    // Numeric validations
    if (formData.totalArea && isNaN(Number(formData.totalArea))) {
      newErrors.totalArea = "Total area must be a number"
    }
    if (formData.minSquareFeet && isNaN(Number(formData.minSquareFeet))) {
      newErrors.minSquareFeet = "Minimum square feet must be a number"
    }
    if (formData.pricePerSquareFoot && isNaN(Number(formData.pricePerSquareFoot))) {
      newErrors.pricePerSquareFoot = "Price per square foot must be a number"
    }

    // Logical validations
    if (formData.totalArea && formData.minSquareFeet &&
        Number(formData.totalArea) < Number(formData.minSquareFeet)) {
      newErrors.totalArea = "Total area cannot be less than minimum square feet"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get auth token
      const token = localStorage.getItem('auth-token') || document.cookie.replace(/(?:(?:^|.*;\s*)auth-token\s*\=\s*([^;]*).*$)|^.*$/, "$1")

      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          totalArea: Number(formData.totalArea),
          minSquareFeet: Number(formData.minSquareFeet),
          pricePerSquareFoot: Number(formData.pricePerSquareFoot),
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("Inventory category created successfully!")
        router.push(`/admin/projects`)
      } else {
        alert(result.message || "Failed to create inventory category")
      }
    } catch (error) {
      console.error("Error creating inventory category:", error)
      alert("Failed to create inventory category")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add Inventory Category</h1>
            {projectData && (
              <p className="text-muted-foreground mt-1">
                Project: {projectData.title}
              </p>
            )}
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Inventory Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectId">Project *</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => handleInputChange("projectId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectData && (
                        <SelectItem value={projectData._id}>
                          {projectData.title}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.projectId && (
                    <p className="text-sm text-red-600 mt-1">{errors.projectId}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Pakistan"
                  />
                  {errors.country && (
                    <p className="text-sm text-red-600 mt-1">{errors.country}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Lahore"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="area">Area *</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="DHA Phase 8"
                  />
                  {errors.area && (
                    <p className="text-sm text-red-600 mt-1">{errors.area}</p>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Premium 2-Bedroom Apartment"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of the property"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Property Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => handleInputChange("propertyType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                      <SelectItem value="Agricultural">Agricultural</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.propertyType && (
                    <p className="text-sm text-red-600 mt-1">{errors.propertyType}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="propertySubType">Property Sub-Type *</Label>
                  <Input
                    id="propertySubType"
                    value={formData.propertySubType}
                    onChange={(e) => handleInputChange("propertySubType", e.target.value)}
                    placeholder="Apartment, Villa, Shop, etc."
                  />
                  {errors.propertySubType && (
                    <p className="text-sm text-red-600 mt-1">{errors.propertySubType}</p>
                  )}
                </div>
              </div>

              {/* Tokenization Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="totalArea">Total Area (sq ft) *</Label>
                  <Input
                    id="totalArea"
                    type="number"
                    value={formData.totalArea}
                    onChange={(e) => handleInputChange("totalArea", e.target.value)}
                    placeholder="1200"
                  />
                  {errors.totalArea && (
                    <p className="text-sm text-red-600 mt-1">{errors.totalArea}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="minSquareFeet">Min Square Feet *</Label>
                  <Input
                    id="minSquareFeet"
                    type="number"
                    value={formData.minSquareFeet}
                    onChange={(e) => handleInputChange("minSquareFeet", e.target.value)}
                    placeholder="600"
                  />
                  {errors.minSquareFeet && (
                    <p className="text-sm text-red-600 mt-1">{errors.minSquareFeet}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="pricePerSquareFoot">Price per sq ft (₨) *</Label>
                  <Input
                    id="pricePerSquareFoot"
                    type="number"
                    value={formData.pricePerSquareFoot}
                    onChange={(e) => handleInputChange("pricePerSquareFoot", e.target.value)}
                    placeholder="8500"
                  />
                  {errors.pricePerSquareFoot && (
                    <p className="text-sm text-red-600 mt-1">{errors.pricePerSquareFoot}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href="/admin/projects">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Inventory"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}

export default function AddInventoryCategoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddInventoryCategoryForm />
    </Suspense>
  )
}
