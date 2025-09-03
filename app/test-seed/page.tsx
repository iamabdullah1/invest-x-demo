'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SeedTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Database Seeding Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={handleSeed} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Seeding Database...' : 'Seed Database with Sample Users'}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800">Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800">Success!</h3>
              <p className="text-green-700">{result.message}</p>
              <p className="text-sm text-green-600 mt-2">
                Created {result.usersCreated} users
              </p>
              
              {result.users && (
                <div className="mt-4">
                  <h4 className="font-medium text-green-800">Sample Login Credentials:</h4>
                  <div className="mt-2 space-y-1 text-sm text-green-700">
                    <div>📧 <strong>Admin:</strong> sarah@investx.com / admin123</div>
                    <div>📧 <strong>Investor:</strong> ahmed@example.com / investor123</div>
                    <div>📧 <strong>Investor:</strong> hassan@example.com / investor456</div>
                    <div>📧 <strong>Investor:</strong> fatima@example.com / investor789</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
