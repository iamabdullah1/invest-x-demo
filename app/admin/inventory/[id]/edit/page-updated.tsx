"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface InventoryItem {
  _id: string
  projectId: string
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

export default function EditInventoryPage() {
  const router = useRouter()
  const params = useParams()
  const inventoryId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [inventoryData, setInventoryData] = useState<InventoryItem | null>(null)

  const [formData, setFormData] = useState({
    projectId: "",
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
    tokensAvailable: "",
    totalTokens: "",
    bookingAmount: "",
    discount: "",
    rebatePrice: "",
    paymentType: "",
    sizeType: "",
    size: "",
    misc: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch inventory data
  useEffect(() => {
    if (inventoryId) {
      fetchInventoryData()
    }
  }, [inventoryId])

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/inventory/${inventoryId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const item = data.inventory
          setInventoryData(item)
          setFormData({
            projectId: item.projectId || "",
            country: item.country || "",
            city: item.city || "",
            area: item.area || "",
            title: item.title || "",
            description: item.description || "",
            propertyType: item.propertyType || "",
            propertySubType: item.propertySubType || "",
            totalArea: item.totalArea?.toString() || "",
            minSquareFeet: item.minSquareFeet?.toString() || "",
            pricePerSquareFoot: item.pricePerSquareFoot?.toString() || "",
            inventoryImages: item.inventoryImages || [],
            tokensAvailable: item.tokensAvailable?.toString() || "",
            totalTokens: item.totalTokens?.toString() || "",
            bookingAmount: item.bookingAmount?.toString() || "",
            discount: item.discount?.toString() || "",
            rebatePrice: item.rebatePrice?.toString() || "",
            paymentType: item.paymentType || "",
            sizeType: item.sizeType || "",
            size: item.size || "",
            misc: item.misc || "",
          })
        }
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error)
    } finally {
      setLoading(false)
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
      const token = localStorage.getItem('auth-token') || document.cookie.replace(/(?:(?:^|.*;\s*)auth-token\s*\=\s*([^;]*).*$)|^.*$/, "$1")

      const response = await fetch(`/api/admin/inventory/${inventoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          totalArea: Number(formData.totalArea),
          minSquareFeet: Number(formData.minSquareFeet),
          pricePerSquareFoot: Number(formData.pricePerSquareFoot),
          tokensAvailable: Number(formData.tokensAvailable),
          totalTokens: Number(formData.totalTokens),
          bookingAmount: formData.bookingAmount ? Number(formData.bookingAmount) : undefined,
          discount: formData.discount ? Number(formData.discount) : undefined,
          rebatePrice: formData.rebatePrice ? Number(formData.rebatePrice) : undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("Inventory updated successfully!")
        router.push(`/projects/${formData.projectId}/inventory`)
      } else {
        alert(result.message || "Failed to update inventory")
      }
    } catch (error) {
      console.error("Error updating inventory:", error)
      alert("Failed to update inventory")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading inventory data...</div>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/projects/${formData.projectId}/inventory`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Inventory
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Inventory</h1>
            {inventoryData && (
              <p className="text-muted-foreground mt-1">
                {inventoryData.title}
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

              {/* Token Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tokensAvailable">Available Tokens</Label>
                  <Input
                    id="tokensAvailable"
                    type="number"
                    value={formData.tokensAvailable}
                    onChange={(e) => handleInputChange("tokensAvailable", e.target.value)}
                    placeholder="80"
                  />
                </div>
                <div>
                  <Label htmlFor="totalTokens">Total Tokens</Label>
                  <Input
                    id="totalTokens"
                    type="number"
                    value={formData.totalTokens}
                    onChange={(e) => handleInputChange("totalTokens", e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bookingAmount">Booking Amount (₨)</Label>
                  <Input
                    id="bookingAmount"
                    type="number"
                    value={formData.bookingAmount}
                    onChange={(e) => handleInputChange("bookingAmount", e.target.value)}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) => handleInputChange("discount", e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rebatePrice">Rebate Price (₨)</Label>
                  <Input
                    id="rebatePrice"
                    type="number"
                    value={formData.rebatePrice}
                    onChange={(e) => handleInputChange("rebatePrice", e.target.value)}
                    placeholder="8000"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Input
                    id="paymentType"
                    value={formData.paymentType}
                    onChange={(e) => handleInputChange("paymentType", e.target.value)}
                    placeholder="Cash, Installment, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sizeType">Size Type</Label>
                  <Input
                    id="sizeType"
                    value={formData.sizeType}
                    onChange={(e) => handleInputChange("sizeType", e.target.value)}
                    placeholder="Marla, Kanal, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                    placeholder="5 Marla"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="misc">Additional Information</Label>
                <Input
                  id="misc"
                  value={formData.misc}
                  onChange={(e) => handleInputChange("misc", e.target.value)}
                  placeholder="Any additional information"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href={`/projects/${formData.projectId}/inventory`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Inventory"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
