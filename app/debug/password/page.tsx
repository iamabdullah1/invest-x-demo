'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PasswordTestPage() {
  const [email, setEmail] = useState('iamabdullahakram1@gmail.com');
  const [passwordToTest, setPasswordToTest] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPasswordFunction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/test-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, testPassword: passwordToTest })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Password Debug Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            placeholder="Test Password"
            value={passwordToTest}
            onChange={(e) => setPasswordToTest(e.target.value)}
          />
          <Button onClick={testPasswordFunction} disabled={loading}>
            {loading ? 'Testing...' : 'Test Password'}
          </Button>
          
          {result && (
            <pre className="bg-gray-100 p-4 rounded text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
