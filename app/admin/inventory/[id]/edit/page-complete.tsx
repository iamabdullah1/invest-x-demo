"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, X, Upload, Package, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"

interface InventoryItem {
  _id: string
  projectId: {
    _id: string
    title: string
    location: string
  }
  country: string
  city: string
  area: string
  title: string
  description: string
  propertyType: string
  propertySubType: string
  totalArea: number
  minSquareFeet: number
  pricePerSquareFoot: number
  inventoryImages: string[]
  createdAt: string
  updatedAt: string
}

export default function EditInventoryPage() {
  const params = useParams()
  const router = useRouter()
  const inventoryId = params.id as string
  const { hasRole } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [project, setProject] = useState<any>(null)
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    country: 'Pakistan',
    city: '',
    area: '',
    propertyType: '',
    propertySubType: '',
    totalArea: '',
    minSquareFeet: '',
    pricePerSquareFoot: ''
  })

  useEffect(() => {
    if (inventoryId) {
      fetchInventoryItem()
    }
  }, [inventoryId])

  const fetchInventoryItem = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/inventory/${inventoryId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const item = data.inventory
          setInventoryItem(item)
          setFormData({
            title: item.title || '',
            description: item.description || '',
            country: item.country || 'Pakistan',
            city: item.city || '',
            area: item.area || '',
            propertyType: item.propertyType || '',
            propertySubType: item.propertySubType || '',
            totalArea: item.totalArea?.toString() || '',
            minSquareFeet: item.minSquareFeet?.toString() || '',
            pricePerSquareFoot: item.pricePerSquareFoot?.toString() || ''
          })
          setImagePreviewUrls(item.inventoryImages || [])
          if (item.projectId) {
            fetchProject(item.projectId._id || item.projectId)
          }
        } else {
          setError(data.error || 'Failed to fetch inventory item')
        }
      } else {
        setError('Failed to fetch inventory item')
      }
    } catch (error) {
      console.error('Error fetching inventory item:', error)
      setError('Error fetching inventory item')
    } finally {
      setLoading(false)
    }
  }

  const fetchProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProject(data.project)
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setImageFiles(prev => [...prev, ...files])

    // Create preview URLs
    files.forEach(file => {
      const url = URL.createObjectURL(file)
      setImagePreviewUrls(prev => [...prev, url])
    })
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index)
      // Revoke object URL to prevent memory leaks
      if (imagePreviewUrls[index].startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrls[index])
      }
      return newUrls
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.title || !formData.city || !formData.area || !formData.propertyType || !formData.propertySubType) {
        setError('Please fill in all required fields')
        return
      }

      // Upload new images first
      let uploadedImageUrls: string[] = [...imagePreviewUrls]

      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const formDataUpload = new FormData()
          formDataUpload.append('file', file)

          const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formDataUpload
          })

          if (response.ok) {
            const data = await response.json()
            return data.url
          }
          return null
        })

        const newImageUrls = await Promise.all(uploadPromises)
        uploadedImageUrls = [...imagePreviewUrls, ...newImageUrls.filter(Boolean)]
      }

      // Prepare update data
      const updateData = {
        ...formData,
        totalArea: parseFloat(formData.totalArea) || 0,
        minSquareFeet: parseFloat(formData.minSquareFeet) || 0,
        pricePerSquareFoot: parseFloat(formData.pricePerSquareFoot) || 0,
        inventoryImages: uploadedImageUrls
      }

      // Update inventory item
      const response = await fetch(`/api/admin/inventory/${inventoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          router.push(`/projects/${inventoryItem?.projectId._id || inventoryItem?.projectId}/inventory`)
        } else {
          setError(data.error || 'Failed to update inventory item')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update inventory item')
      }
    } catch (error) {
      console.error('Error updating inventory item:', error)
      setError('Error updating inventory item')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading inventory item...</div>
        </div>
      </div>
    )
  }

  if (!inventoryItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Inventory item not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/projects/${inventoryItem.projectId._id || inventoryItem.projectId}/inventory`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Inventory
          </Button>
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Project Info */}
      {project && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Inventory Item</h1>
          <p className="text-muted-foreground">
            Project: {project.title}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="area">Area *</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="propertySubType">Property Sub Type *</Label>
                    <Select value={formData.propertySubType} onValueChange={(value) => handleInputChange('propertySubType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Shop">Shop</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Plot">Plot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalArea">Total Area (sq ft) *</Label>
                    <Input
                      id="totalArea"
                      type="number"
                      value={formData.totalArea}
                      onChange={(e) => handleInputChange('totalArea', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minSquareFeet">Min Investment (sq ft) *</Label>
                    <Input
                      id="minSquareFeet"
                      type="number"
                      value={formData.minSquareFeet}
                      onChange={(e) => handleInputChange('minSquareFeet', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pricePerSquareFoot">Price per sq ft (PKR) *</Label>
                  <Input
                    id="pricePerSquareFoot"
                    type="number"
                    value={formData.pricePerSquareFoot}
                    onChange={(e) => handleInputChange('pricePerSquareFoot', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="imageUpload">Upload Images</Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </div>

                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Link href={`/projects/${inventoryItem.projectId._id || inventoryItem.projectId}/inventory`}>
            <Button type="button" variant="outline" disabled={saving}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
