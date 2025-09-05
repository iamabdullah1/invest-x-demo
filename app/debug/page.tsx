"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function DebugPage() {
  const [results, setResults] = useState<string>('');
  const [email, setEmail] = useState('test@debug.com');
  const [password, setPassword] = useState('password123');

  const runTest = async (action: string) => {
    try {
      setResults(prev => prev + `\n🔍 Running ${action}...\n`);
      
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email, password }),
      });
      
      const data = await response.json();
      setResults(prev => prev + `✅ ${action}: ${JSON.stringify(data, null, 2)}\n\n`);
    } catch (error) {
      setResults(prev => prev + `❌ ${action} Error: ${error}\n\n`);
    }
  };

  const runFullTest = async () => {
    setResults('🚀 Starting Full Authentication Debug Test...\n\n');
    
    // Test each step
    await runTest('test-db');
    await runTest('test-hash');
    await runTest('create-test-user');
    await runTest('test-login');
    
    setResults(prev => prev + '🏁 Full test completed!\n');
  };

  const checkExistingUser = async () => {
    setResults('🔍 Checking your existing user...\n\n');
    await runTest('check-user');
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>🐛 Authentication Debug Center</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="email"
              placeholder="Test Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Test Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => runTest('test-db')}>Test Database</Button>
            <Button onClick={() => runTest('test-hash')}>Test Hashing</Button>
            <Button onClick={() => runTest('create-test-user')}>Create Test User</Button>
            <Button onClick={() => runTest('test-login')}>Test Login</Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={runFullTest} className="bg-blue-600">
              🚀 Run Full Test
            </Button>
            <Button onClick={checkExistingUser} className="bg-orange-600">
              🔍 Check Your User
            </Button>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap">
              {results || 'Click a test button to see results...'}
            </pre>
          </div>
          
          <Button 
            onClick={() => setResults('')} 
            variant="outline"
          >
            Clear Results
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
