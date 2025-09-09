"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, CheckCircle, Info, AlertTriangle, TrendingUp, Building2, DollarSign, Settings, X } from "lucide-react"

interface Notification {
  _id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: string
  relatedProjectId?: string
  actionUrl?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/notifications')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(data.notifications || [])
        } else {
          setError(data.message || 'Failed to fetch notifications')
        }
      } else {
        setError('Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setError('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId, markAsRead: true })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'POST'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "success":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const investmentNotifications = notifications.filter(
    (n) => n.title.includes("Investment") || n.title.includes("Dividend") || n.title.includes("Project"),
  )
  const marketNotifications = notifications.filter(
    (n) => n.title.includes("Market") || n.title.includes("Update") || n.title.includes("News"),
  )
  const systemNotifications = notifications.filter(
    (n) => n.title.includes("Payment") || n.title.includes("Account") || n.title.includes("Security"),
  )

  if (loading) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading notifications...</div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (error) {
    return (
      <RoleGuard requiredRole="investor">
        <div className="space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard requiredRole="investor">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Bell className="h-8 w-8 mr-3" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-3">
                  {unreadCount} new
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Stay updated with your investments and market news</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Mark All Read
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{notifications.length}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{investmentNotifications.length}</div>
                  <div className="text-sm text-muted-foreground">Investment</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{marketNotifications.length}</div>
                  <div className="text-sm text-muted-foreground">Market</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold">{systemNotifications.length}</div>
                  <div className="text-sm text-muted-foreground">System</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? "border-primary/50 bg-primary/5" : ""
                  }`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {getIcon(notification.type)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getBadgeVariant(notification.type)}>{notification.type}</Badge>
                            {!notification.read && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{notification.message}</p>
                        <div className="text-sm text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="investment">
            <div className="space-y-4">
              {investmentNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? "border-primary/50 bg-primary/5" : ""
                  }`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {getIcon(notification.type)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getBadgeVariant(notification.type)}>{notification.type}</Badge>
                            {!notification.read && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{notification.message}</p>
                        <div className="text-sm text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="market">
            <div className="space-y-4">
              {marketNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? "border-primary/50 bg-primary/5" : ""
                  }`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {getIcon(notification.type)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getBadgeVariant(notification.type)}>{notification.type}</Badge>
                            {!notification.read && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{notification.message}</p>
                        <div className="text-sm text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system">
            <div className="space-y-4">
              {systemNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? "border-primary/50 bg-primary/5" : ""
                  }`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {getIcon(notification.type)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getBadgeVariant(notification.type)}>{notification.type}</Badge>
                            {!notification.read && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{notification.message}</p>
                        <div className="text-sm text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
