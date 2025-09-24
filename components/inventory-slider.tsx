"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Package, MapPin, DollarSign } from "lucide-react"
import Image from "next/image"
import { formatPKR } from "@/lib/currency"

interface InventoryCategory {
  _id: string
  title: string
  country: string
  city: string
  area: string
  propertyType: string
  propertySubType: string
  sizeType: string
  size: string
  paymentType: string
  price: number
  discount: number
  rebatePrice: number
  bookingAmount: number
  image: string
  inventoryImages: string[]
  misc: string
}

interface InventorySliderProps {
  projectId: string
}

export function InventorySlider({ projectId }: InventorySliderProps) {
  const [inventory, setInventory] = useState<InventoryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchInventory()
  }, [projectId])

  const fetchInventory = async () => {
    try {
      const response = await fetch(`/api/admin/inventory?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setInventory(data.inventory || [])
        }
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % inventory.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + inventory.length) % inventory.length)
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

  const currentItem = inventory[currentIndex]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Available Inventory ({inventory.length})
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={inventory.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={inventory.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden relative">
            {currentItem.image ? (
              <Image
                src={currentItem.image}
                alt={currentItem.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Inventory Details */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{currentItem.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {currentItem.area}, {currentItem.city}, {currentItem.country}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Property Type</div>
                <div className="font-medium">{currentItem.propertyType}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Sub Type</div>
                <div className="font-medium">{currentItem.propertySubType}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Size</div>
                <div className="font-medium">{currentItem.size} {currentItem.sizeType}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Payment Type</div>
                <div className="font-medium">{currentItem.paymentType}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                <span className="text-lg font-bold text-green-600">
                  {formatPKR(currentItem.price)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Booking</div>
                <div className="font-medium">{formatPKR(currentItem.bookingAmount)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="outline">{currentItem.propertyType}</Badge>
              <Badge variant="outline">{currentItem.propertySubType}</Badge>
            </div>
          </div>

          {/* Dots Indicator */}
          {inventory.length > 1 && (
            <div className="flex justify-center space-x-2">
              {inventory.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
