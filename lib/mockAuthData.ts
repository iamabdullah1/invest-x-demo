// Mock user data for testing without database
export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'guest' | 'investor' | 'admin';
  isEmailVerified: boolean;
  avatar?: string;
  city?: string;
  phone?: string;
  cnicNumber?: string;
  totalInvested: number;
  portfolioValue: number;
  joinDate: string;
  lastLogin?: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  password: string; // For mock login
}

// Mock users database
export const MOCK_USERS: MockUser[] = [
  {
    id: 'admin-1',
    firstName: 'Sarah',
    lastName: 'Ali',
    email: 'admin@investx.com',
    role: 'admin',
    isEmailVerified: true,
    avatar: '/professional-pakistani-woman.png',
    city: 'Karachi',
    phone: '+92-300-1234567',
    cnicNumber: '42101-1234567-8',
    totalInvested: 0,
    portfolioValue: 0,
    joinDate: '2024-01-01',
    lastLogin: new Date().toISOString(),
    notifications: {
      email: true,
      sms: true,
      push: true
    },
    password: 'admin123' // Plain text for demo
  },
  {
    id: 'inv-1',
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed@example.com',
    role: 'investor',
    isEmailVerified: true,
    avatar: '/professional-pakistani-man.png',
    city: 'Lahore',
    phone: '+92-300-9876543',
    cnicNumber: '35202-9876543-2',
    totalInvested: 500000,
    portfolioValue: 550000,
    joinDate: '2024-01-15',
    lastLogin: new Date().toISOString(),
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    password: 'investor123' // Plain text for demo
  },
  {
    id: 'guest-1',
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@example.com',
    role: 'guest',
    isEmailVerified: false,
    totalInvested: 0,
    portfolioValue: 0,
    joinDate: new Date().toISOString(),
    notifications: {
      email: false,
      sms: false,
      push: false
    },
    password: 'guest123' // Plain text for demo
  }
];

// Helper function to find user by email
export function findUserByEmail(email: string): MockUser | undefined {
  return MOCK_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Helper function to find user by id
export function findUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find(user => user.id === id);
}

// Remove password from user object for frontend
export function sanitizeUser(user: MockUser): Omit<MockUser, 'password'> {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}
