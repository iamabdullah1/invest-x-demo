"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, Search, Mail, Phone, MapPin, Calendar, 
  Eye, Check, X, FileText, Image, Clock 
} from "lucide-react"

interface VerificationRequest {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  frontIdCardPath?: string  // Legacy support
  backIdCardPath?: string   // Legacy support
  frontIdCard?: string      // Legacy support
  backIdCard?: string       // Legacy support
  frontIdUrl?: string       // Cloudinary URL for front ID
  backIdUrl?: string        // Cloudinary URL for back ID
  frontIdPublicId?: string  // Cloudinary public ID for front ID
  backIdPublicId?: string   // Cloudinary public ID for back ID
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  notes?: string
  createdAt?: string        // Additional field your colleague might use
  updatedAt?: string        // Additional field your colleague might use
}

export default function AdminInvestorsPage() {
  const [verifications, setVerifications] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  // Fetch verification requests
  useEffect(() => {
    fetchVerifications()
  }, [statusFilter])

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      // Fetch verification requests from users collection
      const response = await fetch(`/api/admin/investor-verifications?status=${statusFilter}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setVerifications(data.verifications || [])
      } else {
        setError('Failed to fetch verification requests')
      }
    } catch (error) {
      setError('Error fetching verification requests')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      setIsProcessing(true)
      setError('')

      const response = await fetch(`/api/admin/investor-verifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
          notes: notes || undefined
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update the verification in the list
        setVerifications(prev => 
          prev.map(v => 
            v._id === id 
              ? { ...v, status: action === 'approve' ? 'approved' : 'rejected' }
              : v
          )
        )
        setSelectedVerification(null)
        setRejectionReason('')
        setNotes('')
        // Refresh the list to get updated data
        fetchVerifications()
      } else {
        setError(data.error || 'Failed to process verification')
      }
    } catch (error) {
      setError('Error processing verification')
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter verifications based on search and status
  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = searchTerm === '' || 
      verification.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || verification.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Investor Verifications</h1>
            <p className="text-muted-foreground">Manage investor verification requests</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              <Users className="h-4 w-4 mr-1" />
              {verifications.length} Total
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Verifications List */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading verifications...</p>
              </CardContent>
            </Card>
          ) : filteredVerifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No verification requests found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'No verification requests have been submitted yet'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredVerifications.map((verification) => (
              <Card key={verification._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {verification.firstName[0]}{verification.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {verification.firstName} {verification.lastName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {verification.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {verification.phone}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {verification.city}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {getStatusBadge(verification.status)}
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            Submitted {new Date(verification.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVerification(verification)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Verification Request - {verification.firstName} {verification.lastName}
                            </DialogTitle>
                            <DialogDescription>
                              Review the verification details and ID documents
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedVerification && (
                            <div className="space-y-6">
                              {/* Personal Information */}
                              <div>
                                <h4 className="font-semibold mb-3">Personal Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Name:</span> {selectedVerification.firstName} {selectedVerification.lastName}
                                  </div>
                                  <div>
                                    <span className="font-medium">Email:</span> {selectedVerification.email}
                                  </div>
                                  <div>
                                    <span className="font-medium">Phone:</span> {selectedVerification.phone}
                                  </div>
                                  <div>
                                    <span className="font-medium">City:</span> {selectedVerification.city}
                                  </div>
                                  <div className="col-span-2">
                                    <span className="font-medium">Address:</span> {selectedVerification.address}
                                  </div>
                                  <div>
                                    <span className="font-medium">Postal Code:</span> {selectedVerification.postalCode}
                                  </div>
                                  <div>
                                    <span className="font-medium">Status:</span> {getStatusBadge(selectedVerification.status)}
                                  </div>
                                </div>
                              </div>

                              {/* ID Card Images */}
                              <div>
                                <h4 className="font-semibold mb-3">ID Card Documents</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium mb-2">Front ID Card</p>
                                    {(selectedVerification.frontIdUrl || selectedVerification.frontIdCardPath || selectedVerification.frontIdCard) ? (
                                      <img
                                        src={selectedVerification.frontIdUrl || selectedVerification.frontIdCardPath || selectedVerification.frontIdCard || ''}
                                        alt="Front ID Card"
                                        className="w-full h-48 object-cover border rounded-lg"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className="hidden w-full h-48 border rounded-lg flex items-center justify-center bg-gray-100">
                                      <p className="text-gray-500">Front ID image not available</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium mb-2">Back ID Card</p>
                                    {(selectedVerification.backIdUrl || selectedVerification.backIdCardPath || selectedVerification.backIdCard) ? (
                                      <img
                                        src={selectedVerification.backIdUrl || selectedVerification.backIdCardPath || selectedVerification.backIdCard || ''}
                                        alt="Back ID Card"
                                        className="w-full h-48 object-cover border rounded-lg"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className="hidden w-full h-48 border rounded-lg flex items-center justify-center bg-gray-100">
                                      <p className="text-gray-500">Back ID image not available</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Notes Section */}
                              <div>
                                <Label htmlFor="notes">Admin Notes (Optional)</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Add any notes about this verification..."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              {/* Rejection Reason */}
                              <div>
                                <Label htmlFor="rejectionReason">Rejection Reason (Required for rejection)</Label>
                                <Textarea
                                  id="rejectionReason"
                                  placeholder="Enter reason for rejection..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              {/* Action Buttons */}
                              {selectedVerification.status === 'pending' && (
                                <div className="flex space-x-3 pt-4">
                                  <Button
                                    onClick={() => handleVerificationAction(selectedVerification._id, 'approve')}
                                    disabled={isProcessing}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleVerificationAction(selectedVerification._id, 'reject')}
                                    disabled={isProcessing || !rejectionReason.trim()}
                                    variant="destructive"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}

                              {/* Review Information */}
                              {selectedVerification.reviewedAt && (
                                <div className="bg-muted p-4 rounded-lg">
                                  <h5 className="font-medium mb-2">Review Information</h5>
                                  <div className="text-sm space-y-1">
                                    <div>Reviewed by: {selectedVerification.reviewedBy}</div>
                                    <div>Reviewed at: {new Date(selectedVerification.reviewedAt).toLocaleString()}</div>
                                    {selectedVerification.rejectionReason && (
                                      <div>Rejection reason: {selectedVerification.rejectionReason}</div>
                                    )}
                                    {selectedVerification.notes && (
                                      <div>Notes: {selectedVerification.notes}</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </RoleGuard>
  )
}
