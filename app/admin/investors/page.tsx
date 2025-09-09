'use client'

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, Mail, Phone, MapPin, TrendingUp, MoreHorizontal, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/mockData"

interface Investor {
  id: string
  name: string
  email: string
  phone: string
  city: string
  joinDate: string
  totalInvested: number
  portfolioValue: number
  activeInvestments: number
  status: 'active' | 'pending' | 'suspended'
  verificationStatus: string
  role: string
  avatar?: string
  isEmailVerified: boolean
  lastLogin?: string
}

interface InvestorStats {
  totalInvestors: number
  activeInvestors: number
  pendingInvestors: number
  totalInvested: number
}

export default function AdminInvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [stats, setStats] = useState<InvestorStats>({
    totalInvestors: 0,
    activeInvestors: 0,
    pendingInvestors: 0,
    totalInvested: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')

  const fetchInvestors = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (cityFilter !== 'all') params.set('city', cityFilter)

      const response = await fetch(`/api/admin/investors?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setInvestors(data.data.investors)
        setStats(data.data.stats)
      } else {
        console.error('Failed to fetch investors:', data.error)
      }
    } catch (error) {
      console.error('Error fetching investors:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvestors()
  }, [searchTerm, statusFilter, cityFilter])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investor Management</h1>
          <p className="text-muted-foreground">Manage and oversee all platform investors</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvestors}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeInvestors}</div>
              <p className="text-xs text-green-600">Currently investing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingInvestors}</div>
              <p className="text-xs text-yellow-600">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
              <p className="text-xs text-muted-foreground">Platform total</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search investors..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  <SelectItem value="karachi">Karachi</SelectItem>
                  <SelectItem value="lahore">Lahore</SelectItem>
                  <SelectItem value="islamabad">Islamabad</SelectItem>
                  <SelectItem value="rawalpindi">Rawalpindi</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={fetchInvestors}
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Investors List */}
        <Card>
          <CardHeader>
            <CardTitle>All Investors</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading investors...</span>
              </div>
            ) : investors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No investors found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {investors.map((investor) => (
                  <div key={investor.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={investor.avatar || "/placeholder.svg"} alt={investor.name} />
                          <AvatarFallback>{getInitials(investor.name)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-lg font-semibold">{investor.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {investor.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {investor.phone}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {investor.city}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                investor.status === "active"
                                  ? "default"
                                  : investor.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {investor.status}
                            </Badge>
                            <Badge variant="outline">{investor.role}</Badge>
                            {investor.isEmailVerified && (
                              <Badge variant="outline" className="text-green-600">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem>View Investments</DropdownMenuItem>
                          {investor.status === "pending" && <DropdownMenuItem>Approve Account</DropdownMenuItem>}
                          <DropdownMenuItem className="text-red-600">Suspend Account</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4 pt-4 border-t">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Invested</div>
                        <div className="font-semibold">{formatCurrency(investor.totalInvested)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Active Investments</div>
                        <div className="font-semibold">{investor.activeInvestments}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Join Date</div>
                        <div className="font-semibold">{new Date(investor.joinDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Portfolio Value</div>
                        <div className="font-semibold">{formatCurrency(investor.portfolioValue)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
