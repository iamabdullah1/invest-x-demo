"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Building2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatPKR, validatePKRAmount, parsePKR } from "@/lib/currency"

interface CartItem {
  inventoryId: string
  amount: number
  sqft: number
  pricePerSqFt: number
  addedAt: string
  inventory: {
    _id: string
    title: string
    propertyType: string
    propertySubType: string
    totalArea: number
    minSquareFeet: number
    pricePerSquareFoot: number
    inventoryImages?: string[]
    area: string
    city: string
  }
  project: {
    _id: string
    title: string
    location: {
      city: string
      area: string
    }
    status: string
  }
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/cart')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCartItems(data.cart || [])
        } else {
          setError(data.message || 'Failed to fetch cart')
        }
      } else {
        setError('Failed to fetch cart')
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      setError('Failed to fetch cart')
    } finally {
      setLoading(false)
    }
  }

  const updateCartItem = async (inventoryId: string, newAmount: number) => {
    try {
      const response = await fetch('/api/user/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inventoryId, amount: newAmount })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state
          setCartItems(prev => prev.map(item => 
            item.inventoryId === inventoryId 
              ? { ...item, amount: newAmount }
              : item
          ))
        } else {
          alert(data.message || 'Failed to update cart item')
        }
      } else {
        alert('Failed to update cart item')
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      alert('Failed to update cart item')
    }
  }

  const removeCartItem = async (inventoryId: string) => {
    try {
      const response = await fetch(`/api/user/cart?inventoryId=${inventoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state
          setCartItems(prev => prev.filter(item => item.inventoryId !== inventoryId))
        } else {
          alert(data.message || 'Failed to remove cart item')
        }
      } else {
        alert('Failed to remove cart item')
      }
    } catch (error) {
      console.error('Error removing cart item:', error)
      alert('Failed to remove cart item')
    }
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.amount, 0)
  const processingFee = totalAmount * 0.01

  const handleCheckout = () => {
    router.push("/checkout")
  }

  if (loading) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading cart...</div>
        </div>
      </RoleGuard>
    )
  }

  if (cartItems.length === 0) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some investment projects to get started</p>
            <Button asChild>
              <Link href="/projects">Browse Projects</Link>
            </Button>
          </div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard requiredRole="investor">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Cart</h1>
            <p className="text-muted-foreground">Review your selected investments before checkout</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <Card key={item.inventoryId}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.inventory.inventoryImages?.[0] || "/placeholder.jpg"}
                          alt={item.inventory.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{item.inventory.title}</h3>
                          <p className="text-muted-foreground">
                            {item.inventory.area}, {item.inventory.city} • {item.inventory.propertyType} • {item.inventory.propertySubType}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{item.project.title}</Badge>
                            <Badge variant="secondary">{item.sqft} sq ft</Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItem(item.inventoryId, Math.max(item.inventory.minSquareFeet * item.pricePerSqFt, item.amount - 1000))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.amount}
                              onChange={(e) => updateCartItem(item.inventoryId, Number(e.target.value))}
                              className="w-24 text-center"
                              min={item.inventory.minSquareFeet * item.pricePerSqFt}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCartItem(item.inventoryId, item.amount + 1000)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatPKR(item.amount)}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatPKR(item.amount * 0.12)} projected returns
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCartItem(item.inventoryId)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                          <div className="text-sm text-muted-foreground">
                            Added {new Date(item.addedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Investment</span>
                      <span className="font-medium">{formatPKR(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee (1%)</span>
                      <span className="font-medium">{formatPKR(processingFee)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>{formatPKR(totalAmount + processingFee)}</span>
                  </div>

                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/projects">Continue Shopping</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Building2 className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Secure Investment</p>
                      <p className="text-muted-foreground">
                        Your investments are protected by bank-grade security and regulatory compliance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
