"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Package, MapPin, DollarSign, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatPKR } from "@/lib/currency"

interface InventoryCategory {
  _id: string
  projectId: {
    _id: string
    title: string
    location?: {
      city: string
      area: string
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
  updatedAt: string
}

interface InventorySliderProps {
  projectId: string
}

export function InventorySlider({ projectId }: InventorySliderProps) {
  const [inventory, setInventory] = useState<InventoryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  useEffect(() => {
    fetchInventory()
  }, [projectId])

  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (inventory.length <= itemsPerView) return
      
      if (event.key === 'ArrowLeft' && currentIndex > 0) {
        scrollLeft()
      } else if (event.key === 'ArrowRight' && currentIndex < inventory.length - itemsPerView) {
        scrollRight()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, inventory.length, itemsPerView])

  const fetchInventory = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/inventory`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setInventory(data.inventory || [])
        }
      } else {
        console.error('API Error:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollLeft = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const scrollRight = () => {
    setCurrentIndex(prev => Math.min(inventory.length - itemsPerView, prev + 1))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading inventory...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (inventory.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">No inventory available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Available Inventory ({inventory.length})
          </span>
          {inventory.length > itemsPerView && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollLeft}
                disabled={currentIndex === 0}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2 min-w-[80px] text-center">
                {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, inventory.length)} of {inventory.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollRight}
                disabled={currentIndex >= inventory.length - itemsPerView}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="grid gap-6" style={{ 
            gridTemplateColumns: `repeat(${itemsPerView}, minmax(300px, 1fr))`,
            minHeight: '400px'
          }}>
            {inventory.slice(currentIndex, currentIndex + itemsPerView).map((item) => (
              <Card key={item._id} className="h-full">
                <div className="aspect-[4/3] bg-muted rounded-t-lg overflow-hidden relative">
                  {item.inventoryImages && item.inventoryImages.length > 0 ? (
                    <Image
                      src={item.inventoryImages[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{item.area}, {item.city}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">Type</div>
                        <div className="font-medium">{item.propertyType}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Area</div>
                        <div className="font-medium">{item.totalArea} sq ft</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          {formatPKR(item.pricePerSquareFoot * item.totalArea)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.propertySubType}
                      </Badge>
                    </div>

                    <Link href={`/inventory/${item._id}`}>
                      <Button className="w-full" size="sm">
                        Invest Now
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
