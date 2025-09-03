import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Search, Mail, Phone, MapPin, TrendingUp, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/mockData"

// Mock investor data
const mockInvestors = [
  {
    id: "inv-1",
    name: "Ahmed Khan",
    email: "ahmed@example.com",
    phone: "+92 300 1234567",
    city: "Karachi",
    joinDate: "2024-01-15",
    totalInvested: 7000000,
    activeInvestments: 3,
    status: "active",
    riskProfile: "moderate",
    avatar: "/professional-pakistani-man.png",
  },
  {
    id: "inv-2",
    name: "Fatima Ali",
    email: "fatima@example.com",
    phone: "+92 321 9876543",
    city: "Lahore",
    joinDate: "2024-02-20",
    totalInvested: 12000000,
    activeInvestments: 5,
    status: "active",
    riskProfile: "aggressive",
    avatar: "/professional-pakistani-woman.png",
  },
  {
    id: "inv-3",
    name: "Hassan Sheikh",
    email: "hassan@example.com",
    phone: "+92 333 5555555",
    city: "Islamabad",
    joinDate: "2024-03-10",
    totalInvested: 3500000,
    activeInvestments: 2,
    status: "pending",
    riskProfile: "conservative",
  },
  {
    id: "inv-4",
    name: "Ayesha Malik",
    email: "ayesha@example.com",
    phone: "+92 345 7777777",
    city: "Rawalpindi",
    joinDate: "2024-04-05",
    totalInvested: 8500000,
    activeInvestments: 4,
    status: "active",
    riskProfile: "moderate",
  },
]

export default function AdminInvestorsPage() {
  const totalInvestors = mockInvestors.length
  const activeInvestors = mockInvestors.filter((inv) => inv.status === "active").length
  const pendingInvestors = mockInvestors.filter((inv) => inv.status === "pending").length
  const totalInvested = mockInvestors.reduce((sum, inv) => sum + inv.totalInvested, 0)

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
              <div className="text-2xl font-bold">{totalInvestors}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInvestors}</div>
              <p className="text-xs text-green-600">Currently investing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingInvestors}</div>
              <p className="text-xs text-yellow-600">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
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
                <Input placeholder="Search investors..." className="pl-10" />
              </div>
              <Select>
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
              <Select>
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Risk Profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Investors List */}
        <Card>
          <CardHeader>
            <CardTitle>All Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInvestors.map((investor) => (
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
                          <Badge variant="outline">{investor.riskProfile}</Badge>
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
                      <div className="text-sm text-muted-foreground">Risk Profile</div>
                      <div className="font-semibold capitalize">{investor.riskProfile}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
