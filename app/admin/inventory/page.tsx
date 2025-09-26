"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Package, MapPin, Building2, Eye, Edit, Plus, Search, X, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatPKR } from "@/lib/currency"
import { useAuth } from "@/hooks/useAuth"

interface InventoryItem {
  _id: string
  projectId: {
    _id: string
    title: string
    location: {
      city?: string
      area?: string
    }
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
}

export default function AdminInventoryPage() {
  const { hasRole } = useAuth()
  const searchParams = useSearchParams()
  const projectIdFromParams = searchParams.get("projectId")
  
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [projectData, setProjectData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    setIsAdmin(hasRole('admin'))
  }, [hasRole])

  // Fetch project data when projectId is provided
  useEffect(() => {
    if (projectIdFromParams) {
      fetchProjectData(projectIdFromParams)
    }
  }, [projectIdFromParams])

  useEffect(() => {
    if (isAdmin && mounted) {
      fetchInventory()
    }
  }, [isAdmin, mounted, currentPage, searchTerm, propertyTypeFilter, projectIdFromParams])

  const fetchProjectData = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProjectData(data.project)
        }
      }
    } catch (error) {
      console.error("Error fetching project data:", error)
    }
  }

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(propertyTypeFilter && propertyTypeFilter !== 'all' && { propertyType: propertyTypeFilter }),
        ...(projectIdFromParams && { projectId: projectIdFromParams })
      })

      const response = await fetch(`/api/admin/inventory?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setInventory(data.inventory)
          setTotalPages(data.pagination.pages)
        }
      } else {
        console.error('Failed to fetch inventory:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleDeleteInventory = async (inventoryId: string) => {
    if (!confirm('Are you sure you want to delete this inventory item? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('auth-token') || document.cookie.replace(/(?:(?:^|.*;\s*)auth-token\s*\=\s*([^;]*).*$)|^.*$/, "$1")

      const response = await fetch(`/api/admin/inventory?id=${inventoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('Inventory item deleted successfully!')
          // Refresh the inventory list
          fetchInventory()
        } else {
          alert(data.error || 'Failed to delete inventory item')
        }
      } else {
        alert('Failed to delete inventory item')
      }
    } catch (error) {
      console.error('Error deleting inventory:', error)
      alert('Failed to delete inventory item')
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {projectData ? `Inventory for ${projectData.title}` : 'Inventory Management'}
            </h1>
            <p className="text-muted-foreground">
              {projectData ? `Manage inventory items for this project` : 'Manage all property inventory items'}
            </p>
            {projectData && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Project: {projectData.title}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.location.href = '/admin/inventory'}
                  className="text-xs h-6 px-2"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear Filter
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {projectData && (
            <Link href={`/inventory/new?projectId=${projectData._id}`}>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add to Project
              </Button>
            </Link>
          )}
          <Link href="/inventory/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Inventory
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading inventory...</div>
        </div>
      ) : inventory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Inventory Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || propertyTypeFilter ? 'No inventory matches your filters.' : 'No inventory items have been added yet.'}
            </p>
            <Link href="/inventory/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Inventory Item
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {inventory.map((item) => (
              <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  {item.inventoryImages && item.inventoryImages.length > 0 ? (
                    <Image
                      src={item.inventoryImages[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                      <Badge variant="secondary">{item.propertyType}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {item.area}, {item.city}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 mr-1" />
                      {item.propertySubType} • {item.totalArea} sq ft
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Price per sq ft</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(item.pricePerSquareFoot)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/inventory/${item._id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/inventory/${item._id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteInventory(item._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}