"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, CheckCircle, User, MapPin, Camera } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function InvestorVerificationPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    frontIdCard: null as File | null,
    backIdCard: null as File | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [frontIdPreview, setFrontIdPreview] = useState<string | null>(null)
  const [backIdPreview, setBackIdPreview] = useState<string | null>(null)
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        city: user.city || "",
      }));

      // Check if user already has verification data
      if (user.verificationStatus && user.verificationStatus !== 'none') {
        // User already has verification status
        if (user.verificationStatus === 'pending') {
          setError('You already have a verification request pending review.');
        } else if (user.verificationStatus === 'approved') {
          setError('Your verification is already approved. You are now an investor!');
        } else if (user.verificationStatus === 'rejected') {
          setError('Your previous verification was rejected. You can submit a new request below.');
        }
      }
    }
  }, [user]);

  // Show loading while checking auth
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: 'frontIdCard' | 'backIdCard', file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload only image files')
        return
      }
      
      // Validate file size (5MB limit for ID cards)
      if (file.size > 5 * 1024 * 1024) {
        setError('ID card file size must be less than 5MB')
        return
      }

      setFormData((prev) => ({ ...prev, [field]: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        if (field === 'frontIdCard') {
          setFrontIdPreview(e.target?.result as string)
        } else {
          setBackIdPreview(e.target?.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      return "Please fill in all personal information fields"
    }

    if (!formData.address || !formData.city || !formData.postalCode) {
      return "Please fill in all address fields"
    }

    if (!formData.frontIdCard || !formData.backIdCard) {
      return "Please upload both front and back ID card images"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitData.append(key, value)
        } else if (value) {
          submitData.append(key, value)
        }
      })

      const response = await fetch('/api/auth/investor-verification', {
        method: 'POST',
        body: submitData,
        credentials: 'include', // Include cookies for authentication
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard?verified=pending')
        }, 2000)
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verification Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              Your investor verification request has been submitted successfully. We'll review your documents and contact you within 2-3 business days.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Become an Investor</CardTitle>
          <CardDescription>
            Complete your verification to start investing in premium real estate projects
          </CardDescription>
          <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Link>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div>
                  <Label>Registered Email</Label>
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Using your account email address
                  </p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Address Information</h3>
              </div>
              
              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter your complete address"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter your city"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    placeholder="Enter postal code"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ID Card Upload */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <Camera className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Identity Verification</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Front ID Card */}
                <div>
                  <Label htmlFor="frontIdCard">Front ID Card *</Label>
                  <div className="mt-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      {frontIdPreview ? (
                        <div className="space-y-2">
                          <img
                            src={frontIdPreview}
                            alt="Front ID Card Preview"
                            className="max-h-32 mx-auto rounded"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFrontIdPreview(null)
                              setFormData(prev => ({ ...prev, frontIdCard: null }))
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload front ID card</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                      <Input
                        id="frontIdCard"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('frontIdCard', e.target.files?.[0] || null)}
                        className="hidden"
                        required
                      />
                      {!frontIdPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('frontIdCard')?.click()}
                          className="mt-2"
                        >
                          Choose File
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Back ID Card */}
                <div>
                  <Label htmlFor="backIdCard">Back ID Card *</Label>
                  <div className="mt-1">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      {backIdPreview ? (
                        <div className="space-y-2">
                          <img
                            src={backIdPreview}
                            alt="Back ID Card Preview"
                            className="max-h-32 mx-auto rounded"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBackIdPreview(null)
                              setFormData(prev => ({ ...prev, backIdCard: null }))
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload back ID card</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                      <Input
                        id="backIdCard"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('backIdCard', e.target.files?.[0] || null)}
                        className="hidden"
                        required
                      />
                      {!backIdPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('backIdCard')?.click()}
                          className="mt-2"
                        >
                          Choose File
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Verification...
                </>
              ) : (
                "Submit for Verification"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By submitting this form, you agree to our Terms of Service and Privacy Policy. 
              Your documents will be securely processed for verification purposes only.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
