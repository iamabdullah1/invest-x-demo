"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Building2, Package } from "lucide-react"
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
          console.log('Cart data received:', data)
          console.log('Cart items:', data.cart)
          
          // Log inventory details for each cart item
          data.cart.forEach((item: CartItem, index: number) => {
            console.log(`Cart Item ${index + 1}:`, {
              inventoryId: item.inventoryId,
              amount: item.amount,
              sqft: item.sqft,
              pricePerSqFt: item.pricePerSqFt,
              addedAt: item.addedAt,
              inventory: item.inventory ? {
                _id: item.inventory._id,
                title: item.inventory.title,
                propertyType: item.inventory.propertyType,
                propertySubType: item.inventory.propertySubType,
                totalArea: item.inventory.totalArea,
                minSquareFeet: item.inventory.minSquareFeet,
                pricePerSquareFoot: item.inventory.pricePerSquareFoot,
                area: item.inventory.area,
                city: item.inventory.city,
                inventoryImages: item.inventory.inventoryImages
              } : 'No inventory data (invalid item)',
              project: item.project ? {
                _id: item.project._id,
                title: item.project.title,
                status: item.project.status,
                location: item.project.location
              } : 'No project data'
            })
          })
          
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

  const removeCartItem = async (inventoryId: string, itemIndex?: number) => {
    console.log('Removing cart item:', { inventoryId, itemIndex })
    
    if (!inventoryId) {
      // For items without inventoryId, call cleanup API to remove all invalid items
      try {
        console.log('Cleaning up invalid cart items...')
        const response = await fetch('/api/user/cart?cleanupInvalid=true', {
          method: 'DELETE'
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Refresh cart data after cleanup
            await fetchCart()
            alert('Invalid cart items have been cleaned up.')
          } else {
            alert(data.message || 'Failed to clean up cart')
          }
        } else {
          alert('Failed to clean up cart')
        }
      } catch (error) {
        console.error('Error cleaning up cart:', error)
        alert('Failed to clean up cart')
      }
      return
    }
    
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

  const hasInvalidItems = cartItems.some(item => !item.inventoryId || !item.inventory)

  const cleanInvalidItems = async () => {
    try {
      const response = await fetch('/api/user/cart?cleanupInvalid=true', {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Refresh cart data after cleanup
          await fetchCart()
          alert(data.message || 'Cart cleaned successfully')
        } else {
          alert(data.message || 'Failed to clean cart')
        }
      } else {
        alert('Failed to clean cart')
      }
    } catch (error) {
      console.error('Error cleaning cart:', error)
      alert('Failed to clean cart')
    }
  }

  const clearAllCartItems = async () => {
    if (!confirm('Are you sure you want to clear all items from your cart? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/user/cart?clearAll=true', {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Refresh cart data after clearing
          await fetchCart()
          alert(data.message || 'Cart cleared successfully')
        } else {
          alert(data.message || 'Failed to clear cart')
        }
      } else {
        alert('Failed to clear cart')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      alert('Failed to clear cart')
    }
  }

  const handleCheckout = () => {
    router.push("/checkout")
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.amount, 0)
  const totalSqft = cartItems.reduce((sum, item) => sum + item.sqft, 0)
  const processingFee = totalAmount * 0.01

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
          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive font-medium">Error loading cart: {error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setError(null);
                  fetchCart();
                }}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Investment Cart</h1>
              <p className="text-muted-foreground">Review your selected investments before checkout</p>
            </div>
            <div className="flex gap-2">
              {cartItems.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllCartItems}
                  className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Cart
                </Button>
              )}
              {hasInvalidItems && (
                <Button
                  variant="outline"
                  onClick={cleanInvalidItems}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clean Invalid Items
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item, index) => {
                console.log(`Rendering Cart Item ${index + 1}:`, {
                  inventoryId: item.inventoryId,
                  hasInventory: !!item.inventory,
                  inventoryTitle: item.inventory?.title || 'No inventory',
                  inventoryType: item.inventory?.propertyType || 'N/A',
                  inventoryArea: item.inventory?.area || 'N/A',
                  inventoryCity: item.inventory?.city || 'N/A',
                  projectTitle: item.project?.title || 'No project',
                  amount: item.amount,
                  sqft: item.sqft,
                  pricePerSqFt: item.pricePerSqFt
                })
                
                return (
                <Card key={`${item.inventoryId || `invalid-${index}`}-${index}`}>
                  <CardContent className="p-6">
                    {!item.inventory ? (
                      // Invalid cart item (inventory no longer exists)
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-muted-foreground">Item No Longer Available</h3>
                            <p className="text-sm text-muted-foreground">
                              This inventory item is no longer available for investment.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCartItem(item.inventoryId, index)}
                          disabled={!item.inventoryId}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      // Valid cart item
                      <div className="flex items-start space-x-4">
                        {(() => {
                          // Console log the cart item data
                          console.log(`${item.inventory.title} inventory item`);
                          console.log(`${item.sqft} sq ft at PKR ${item.pricePerSqFt} per sq ft`);
                          console.log(`Total investment: PKR ${formatPKR(item.amount)}`);
                          console.log(`Project: ${item.project.title} (${item.project.status})`);
                          console.log(`Location: ${item.inventory.area}, ${item.inventory.city}`);
                          return null;
                        })()}

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
                              <Badge variant="secondary">{item.project.status}</Badge>
                            </div>
                          </div>

                          {/* Investment Details */}
                          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Investment Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-muted-foreground">Square Feet</div>
                                <div className="font-semibold text-lg">{item.sqft} sq ft</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Price per Sq Ft</div>
                                <div className="font-semibold">{formatPKR(item.pricePerSqFt)}</div>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-border/50">
                              <div className="text-xs text-muted-foreground">Total Investment</div>
                              <div className="font-bold text-xl text-primary">{formatPKR(item.amount)}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Investment Amount</label>
                              <div className="flex items-center space-x-2">
                             
                                 
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Min: {formatPKR((item.inventory.minSquareFeet || 0) * (item.pricePerSqFt || 0))}
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="text-sm text-muted-foreground">Total Amount</div>
                              <div className="font-bold text-xl text-primary">{formatPKR(item.amount)}</div>
                              <div className="text-sm text-muted-foreground">
                                ~{formatPKR(item.amount * 0.12)} projected annual returns
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
                    )}
                  </CardContent>
                </Card>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Investment Breakdown */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-sm">Investment Breakdown</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Square Feet</div>
                        <div className="font-semibold text-lg">{totalSqft} sq ft</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Number of Items</div>
                        <div className="font-semibold text-lg">{cartItems.length}</div>
                      </div>
                    </div>
                  </div>

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
