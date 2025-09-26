"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./useAuth"

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const fetchNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/user/notifications', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.notifications || [])
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [isAuthenticated])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/user/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isRead: true })
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/user/notifications/mark-all-read', {
        method: 'PATCH',
        credentials: 'include'
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}