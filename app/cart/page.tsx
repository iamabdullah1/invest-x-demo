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

interface CartItem {
  projectId: string
  projectTitle: string
  amount: number
  projectImage: string
  expectedReturn: number
  location: string
  addedAt: string
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  useEffect(() => {
    // Load cart items from localStorage
    const savedCart = localStorage.getItem('investmentCart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
    setLoading(false)
  }, [])

  const updateCartItem = (projectId: string, newAmount: number) => {
    const updatedItems = cartItems.map((item) => {
      if (item.projectId === projectId) {
        return { ...item, amount: newAmount }
      }
      return item
    })
    setCartItems(updatedItems)
    localStorage.setItem('investmentCart', JSON.stringify(updatedItems))
  }

  const removeCartItem = (projectId: string) => {
    const updatedItems = cartItems.filter((item) => item.projectId !== projectId)
    setCartItems(updatedItems)
    localStorage.setItem('investmentCart', JSON.stringify(updatedItems))
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
                <Card key={item.projectId}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.projectImage}
                          alt={item.projectTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{item.projectTitle}</h3>
                          <p className="text-muted-foreground">{item.location}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{item.expectedReturn}% Returns</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Investment Amount</label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateCartItem(item.projectId, Math.max(1000, item.amount - 1000))}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                value={item.amount}
                                onChange={(e) => updateCartItem(item.projectId, Number(e.target.value))}
                                className="text-center"
                                min={1000}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateCartItem(item.projectId, item.amount + 1000)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Projected Returns</label>
                            <div className="text-lg font-semibold text-green-600 mt-1">
                              {formatCurrency(item.amount * (item.expectedReturn / 100))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-lg font-semibold">Total: {formatCurrency(item.amount)}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCartItem(item.projectId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
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
                      <span className="font-medium">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee (1%)</span>
                      <span className="font-medium">{formatCurrency(processingFee)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>{formatCurrency(totalAmount + processingFee)}</span>
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
