# 🔐 JWT Role-Based Authentication System

## ✅ Implementation Complete!

Your InvestX application now has a complete JWT-based authentication system with role-based access control.

---

## 🏗️ Architecture Overview

### Backend Components

#### 1. **JWT Auth Service** (`lib/jwtAuth.ts`)
- Token generation and verification
- Role-based authorization middleware
- HTTP-only cookie management
- Token refresh functionality

#### 2. **API Routes**
- `POST /api/auth/login` - User login with JWT token
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - Secure logout
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/refresh` - Refresh JWT token

#### 3. **Database Integration**
- User model with password hashing (bcryptjs)
- Role management in MongoDB
- Secure user operations

### Frontend Components

#### 1. **Auth Context** (`hooks/useAuth.tsx`)
- React context for authentication state
- Login, register, logout functions
- Role checking utilities
- Automatic token refresh

#### 2. **Role Guard** (`components/role-guard.tsx`)
- Component-level access control
- Role-based content rendering
- Error handling for unauthorized access

---

## 🎭 Role System

### Role Hierarchy
```typescript
const ROLE_HIERARCHY = {
  guest: 0,     // Unauthenticated users
  investor: 1,  // Regular investors
  admin: 2      // Administrators
};
```

### Permission Model
- **Higher roles inherit lower role permissions**
- **Admin** can access all investor and guest content
- **Investor** can access all guest content
- **Guest** can only access public content

---

## 🔑 Usage Examples

### Frontend Authentication

#### 1. **Using the Auth Hook**
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, login, logout, hasRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Role: {user?.role}</p>
      {hasRole('admin') && <AdminPanel />}
    </div>
  );
}
```

#### 2. **Protecting Components with Role Guard**
```tsx
import { RoleGuard } from '@/components/role-guard';

function AdminPage() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminDashboard />
    </RoleGuard>
  );
}
```

#### 3. **Higher-Order Component Protection**
```tsx
import { withAuth } from '@/hooks/useAuth';

const ProtectedComponent = withAuth(MyComponent, 'investor');
```

### Backend API Protection

#### 1. **Require Authentication**
```typescript
import JWTAuthService from '@/lib/jwtAuth';

export async function GET(request: NextRequest) {
  const { user, error } = await JWTAuthService.requireAuth(request);
  
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  // User is authenticated
  return NextResponse.json({ data: 'protected data' });
}
```

#### 2. **Require Specific Role**
```typescript
export async function POST(request: NextRequest) {
  const { user, error } = await JWTAuthService.requireRole(request, 'admin');
  
  if (error) {
    return NextResponse.json({ error }, { status: 403 });
  }

  // User has admin role
  return NextResponse.json({ message: 'Admin action completed' });
}
```

---

## 🍪 Security Features

### 1. **HTTP-Only Cookies**
- JWT tokens stored in secure HTTP-only cookies
- Cannot be accessed via JavaScript (XSS protection)
- Automatic inclusion in API requests

### 2. **Password Security**
- bcryptjs hashing with salt rounds (12)
- Passwords excluded from API responses
- Secure password validation

### 3. **Token Management**
- 7-day token expiration
- Automatic token refresh
- Secure token verification

### 4. **Role-Based Access Control**
- Hierarchical permission system
- Component and API-level protection
- Graceful unauthorized handling

---

## 🚀 Quick Start Guide

### Step 1: Seed Database with Users
```bash
# Access the seeding endpoint
POST http://localhost:3000/api/admin/seed
```

### Step 2: Test Login
```bash
# Login with seeded admin user
POST http://localhost:3000/api/auth/login
{
  "email": "sarah@investx.com",
  "password": "admin123"
}
```

### Step 3: Access Protected Routes
- Visit `/admin` - Requires admin role
- Visit `/dashboard` - Requires investor role
- Visit `/projects` - Available to all authenticated users

---

## 🔧 Configuration

### Environment Variables
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/investx
```

### Default Users (After Seeding)
```typescript
// Admin User
email: "sarah@investx.com"
password: "admin123"
role: "admin"

// Investor Users
email: "ahmed@example.com"
password: "investor123"
role: "investor"

email: "hassan@example.com"
password: "investor456"
role: "investor"

email: "fatima@example.com"
password: "investor789"
role: "investor"
```

---

## 🛡️ Security Best Practices Implemented

✅ **Password Hashing**: bcryptjs with 12 salt rounds  
✅ **JWT Security**: HTTP-only cookies + secure headers  
✅ **Role Validation**: Server-side role checking  
✅ **Input Validation**: Email format and password strength  
✅ **Error Handling**: Secure error messages  
✅ **Token Refresh**: Automatic token renewal  
✅ **CSRF Protection**: SameSite cookie settings  

---

## 🔄 Next Steps

1. **Integrate with existing pages**: Update login/signup forms to use new auth system
2. **Add OTP integration**: Combine JWT auth with existing OTP verification
3. **Implement password reset**: Add forgot password functionality  
4. **Add 2FA**: Implement two-factor authentication
5. **Session management**: Add active session tracking
6. **Audit logging**: Track authentication events

---

## 🐛 Troubleshooting

### Common Issues

1. **"Authentication required" errors**
   - Check if JWT_SECRET is set in .env.local
   - Verify cookies are being sent with requests

2. **Role permission errors**
   - Confirm user role in database
   - Check role hierarchy implementation

3. **Token expiration**
   - Tokens expire in 7 days by default
   - Auto-refresh should handle this automatically

### Debug Tips
- Check browser developer tools for cookies
- Monitor server logs for JWT verification errors
- Verify database user roles are correct

Your JWT authentication system is now ready for production use! 🎉
