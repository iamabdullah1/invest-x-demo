"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Building2, Package, Edit, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatPKR } from "@/lib/currency"

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
  tokensAvailable: number
  totalTokens: number
  createdAt: string
  bookingAmount?: number
  discount?: number
  rebatePrice?: number
  paymentType?: string
  sizeType?: string
  size?: string
  misc?: string
}

interface Project {
  _id: string
  title: string
  location: string
  city: string
  type: string
}

export default function InventoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const inventoryId = params.id as string

  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (inventoryId) {
      fetchInventoryDetail()
    }
  }, [inventoryId])

  const fetchInventoryDetail = async () => {
    try {
      setLoading(true)

      // Fetch inventory item details
      const inventoryResponse = await fetch(`/api/admin/inventory/${inventoryId}`)
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        if (inventoryData.success) {
          setInventoryItem(inventoryData.inventory)
          // Project is already populated in the inventory response
          setProject(inventoryData.inventory.projectId)
        }
      }
    } catch (error) {
      console.error('Error fetching inventory details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!inventoryItem) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Inventory Item Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested inventory item could not be found.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{inventoryItem.title}</h1>
          {project && (
            <p className="text-muted-foreground mt-1">
              Project: {project.title} • {project.location}
            </p>
          )}
        </div>
        <Button onClick={() => router.push(`/admin/inventory/${inventoryId}/edit`)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Inventory
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {inventoryItem.inventoryImages && inventoryItem.inventoryImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inventoryItem.inventoryImages.map((image, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${inventoryItem.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{inventoryItem.description}</p>
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
                  <Label className="text-sm font-medium">Property Type</Label>
                  <p className="text-sm text-muted-foreground">{inventoryItem.propertyType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sub-Type</Label>
                  <p className="text-sm text-muted-foreground">{inventoryItem.propertySubType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Area</Label>
                  <p className="text-sm text-muted-foreground">{inventoryItem.totalArea} sq ft</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Min Square Feet</Label>
                  <p className="text-sm text-muted-foreground">{inventoryItem.minSquareFeet} sq ft</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{inventoryItem.area}</p>
              <p className="text-sm text-muted-foreground">{inventoryItem.city}, {inventoryItem.country}</p>
            </CardContent>
          </Card>

          {/* Token Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Token Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Available Tokens</span>
                <Badge variant="secondary">{inventoryItem.tokensAvailable}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Tokens</span>
                <Badge variant="outline">{inventoryItem.totalTokens}</Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${(inventoryItem.tokensAvailable / inventoryItem.totalTokens) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {Math.round((inventoryItem.tokensAvailable / inventoryItem.totalTokens) * 100)}% available
              </p>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Price per sq ft</span>
                <span className="text-sm font-medium">{formatPKR(inventoryItem.pricePerSquareFoot)}</span>
              </div>
              {inventoryItem.bookingAmount && (
                <div className="flex justify-between">
                  <span className="text-sm">Booking Amount</span>
                  <span className="text-sm font-medium">{formatPKR(inventoryItem.bookingAmount)}</span>
                </div>
              )}
              {inventoryItem.discount && (
                <div className="flex justify-between">
                  <span className="text-sm">Discount</span>
                  <span className="text-sm font-medium text-green-600">{inventoryItem.discount}%</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          {(inventoryItem.paymentType || inventoryItem.sizeType || inventoryItem.misc) && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {inventoryItem.paymentType && (
                  <div className="flex justify-between">
                    <span className="text-sm">Payment Type</span>
                    <Badge variant="outline">{inventoryItem.paymentType}</Badge>
                  </div>
                )}
                {inventoryItem.sizeType && (
                  <div className="flex justify-between">
                    <span className="text-sm">Size Type</span>
                    <Badge variant="outline">{inventoryItem.sizeType}</Badge>
                  </div>
                )}
                {inventoryItem.misc && (
                  <div>
                    <Label className="text-sm font-medium">Additional Notes</Label>
                    <p className="text-sm text-muted-foreground mt-1">{inventoryItem.misc}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Created Date */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {new Date(inventoryItem.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}