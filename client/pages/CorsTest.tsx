import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function CorsTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApiConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🧪 Testing API connection...");
      const response = await api.get("ping");
      console.log("✅ API test successful:", response);
      setResult(response.data);
    } catch (err: any) {
      console.error("❌ API test failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAuthLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🧪 Testing auth endpoint...");
      const response = await api.post("auth/login", {
        email: "admin@ashishproperty.com",
        password: "admin123",
      });
      console.log("✅ Auth test successful:", response);
      setResult(response.data);
    } catch (err: any) {
      console.error("❌ Auth test failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>CORS & API Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={testApiConnection}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Testing..." : "Test Ping API"}
            </Button>

            <Button
              onClick={testAuthLogin}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Testing..." : "Test Auth API"}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-green-800 mb-2">Success</h3>
              <pre className="text-sm text-green-600 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Current Environment Info</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <Badge variant="outline">Location</Badge>
                <span className="ml-2">{window.location.href}</span>
              </div>
              <div>
                <Badge variant="outline">Origin</Badge>
                <span className="ml-2">{window.location.origin}</span>
              </div>
              <div>
                <Badge variant="outline">Protocol</Badge>
                <span className="ml-2">{window.location.protocol}</span>
              </div>
              <div>
                <Badge variant="outline">Host</Badge>
                <span className="ml-2">{window.location.host}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
