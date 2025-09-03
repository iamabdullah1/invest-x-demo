export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to InvestX</h1>
        <p className="text-xl text-muted-foreground">
          Pakistan's Leading Real Estate Investment Platform
        </p>
        <div className="space-x-4">
          <a 
            href="/auth/login" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Login
          </a>
          <a 
            href="/auth/signup" 
            className="inline-block border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  )
}
