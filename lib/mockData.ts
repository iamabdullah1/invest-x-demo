// Mock data for Pakistani real estate investments

export interface Project {
  id: string
  title: string
  location: string
  city: string
  type: "residential" | "commercial" | "mixed"
  status: "active" | "funded" | "completed"
  targetAmount: number
  raisedAmount: number
  minInvestment: number
  expectedReturn: number
  duration: number // in months
  area: number // in sq ft
  pricePerSqFt: number
  images: string[]
  description: string
  developer: string
  amenities: string[]
  riskLevel: "low" | "medium" | "high"
  startDate: string
  endDate: string
}

export interface Investment {
  id: string
  projectId: string
  amount: number
  shares: number
  purchaseDate: string
  currentValue: number
  returns: number
}

export interface CartItem {
  projectId: string
  amount: number
  shares: number
}

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    title: "Emerald Heights Residential Complex",
    location: "DHA Phase 8, Karachi",
    city: "Karachi",
    type: "residential",
    status: "active",
    targetAmount: 500000000, // PKR 50 Crore
    raisedAmount: 325000000, // PKR 32.5 Crore
    minInvestment: 1000000, // PKR 10 Lakh
    expectedReturn: 22,
    duration: 24,
    area: 150000,
    pricePerSqFt: 3333,
    images: ["/modern-residential-complex-karachi.png"],
    description:
      "Premium residential complex featuring 200 luxury apartments with modern amenities in the heart of DHA Karachi.",
    developer: "Emerald Developers",
    amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Generator", "Mosque"],
    riskLevel: "low",
    startDate: "2024-01-15",
    endDate: "2026-01-15",
  },
  {
    id: "proj-2",
    title: "Liberty Commercial Plaza",
    location: "Gulberg III, Lahore",
    city: "Lahore",
    type: "commercial",
    status: "active",
    targetAmount: 750000000, // PKR 75 Crore
    raisedAmount: 450000000, // PKR 45 Crore
    minInvestment: 2000000, // PKR 20 Lakh
    expectedReturn: 28,
    duration: 18,
    area: 80000,
    pricePerSqFt: 9375,
    images: ["/lahore-gulberg-plaza.png"],
    description: "Modern commercial plaza with retail shops and office spaces in prime Gulberg location.",
    developer: "Liberty Construction",
    amenities: ["Central AC", "Elevators", "Security", "Parking", "Food Court", "ATM"],
    riskLevel: "medium",
    startDate: "2024-03-01",
    endDate: "2025-09-01",
  },
  {
    id: "proj-3",
    title: "Blue World City Residential",
    location: "Chakri Road, Rawalpindi",
    city: "Rawalpindi",
    type: "residential",
    status: "active",
    targetAmount: 300000000, // PKR 30 Crore
    raisedAmount: 180000000, // PKR 18 Crore
    minInvestment: 500000, // PKR 5 Lakh
    expectedReturn: 18,
    duration: 36,
    area: 200000,
    pricePerSqFt: 1500,
    images: ["/residential-development-rawalpindi.png"],
    description: "Affordable housing project offering modern living spaces with easy installment plans.",
    developer: "Blue World Developers",
    amenities: ["Parks", "Schools", "Hospital", "Shopping", "Mosque", "Sports Complex"],
    riskLevel: "medium",
    startDate: "2024-02-01",
    endDate: "2027-02-01",
  },
  {
    id: "proj-4",
    title: "Centaurus Mall Extension",
    location: "F-8, Islamabad",
    city: "Islamabad",
    type: "commercial",
    status: "funded",
    targetAmount: 1000000000, // PKR 100 Crore
    raisedAmount: 1000000000, // PKR 100 Crore (fully funded)
    minInvestment: 5000000, // PKR 50 Lakh
    expectedReturn: 25,
    duration: 12,
    area: 120000,
    pricePerSqFt: 8333,
    images: ["/placeholder-enxul.png"],
    description: "Extension of the famous Centaurus Mall with premium retail and entertainment spaces.",
    developer: "Centaurus Developers",
    amenities: ["Cinema", "Food Court", "Parking", "Security", "Central AC", "Escalators"],
    riskLevel: "low",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
  },
]

export const mockInvestments: Investment[] = [
  {
    id: "inv-1",
    projectId: "proj-1",
    amount: 2000000,
    shares: 20,
    purchaseDate: "2024-02-15",
    currentValue: 2200000,
    returns: 200000,
  },
  {
    id: "inv-2",
    projectId: "proj-2",
    amount: 5000000,
    shares: 25,
    purchaseDate: "2024-03-20",
    currentValue: 5750000,
    returns: 750000,
  },
]

export const mockNotifications = [
  {
    id: "notif-1",
    title: "Investment Update",
    message: "Emerald Heights project has reached 65% funding milestone",
    type: "info",
    date: "2024-08-20",
    read: false,
  },
  {
    id: "notif-2",
    title: "Dividend Payment",
    message: "PKR 75,000 dividend credited to your account from Liberty Commercial Plaza",
    type: "success",
    date: "2024-08-18",
    read: false,
  },
  {
    id: "notif-3",
    title: "New Project Available",
    message: "Blue World City Phase 2 is now open for investment",
    type: "info",
    date: "2024-08-15",
    read: true,
  },
]

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-PK").format(num)
}

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((project) => project.id === id)
}

export function calculateProgress(raised: number, target: number): number {
  return Math.round((raised / target) * 100)
}
