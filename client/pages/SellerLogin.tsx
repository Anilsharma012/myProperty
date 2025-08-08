import { useState } from "react";
import { ArrowLeft, Store, Mail, Phone, AlertCircle, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ApiResponse } from "@shared/types";
import { useAuth } from "../hooks/useAuth";
import { createApiUrl } from "../lib/api";

export default function SellerLogin() {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginData: any = {
        password,
        userType: "seller",
      };

      if (loginMethod === "email") {
        loginData.email = email;
      } else {
        loginData.phone = phone;
      }

      const response = await fetch(createApiUrl("auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginData),
      });

      const data: ApiResponse<any> = await response.json();

      if (data.success) {
        login(data.data.token, data.data.user);
        window.location.href = "/seller-dashboard";
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>

          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-[#C70000] to-[#A60000] rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Store className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900">Seller Login</h2>
          <p className="mt-2 text-gray-600">
            Sign in to manage your properties and listings
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            {/* Login Method Selector */}
            <div className="flex border border-gray-300 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "email"
                    ? "bg-[#C70000] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === "phone"
                    ? "bg-[#C70000] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Phone className="h-4 w-4 mr-2" />
                Phone
              </button>
            </div>

            {/* Email/Phone Input */}
            {loginMethod === "email" ? (
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seller@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex mt-1">
                  <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                    <span className="text-gray-600">+91</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-l-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#C70000] to-[#A60000] hover:from-[#A60000] hover:to-[#850000] text-white shadow-lg transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center">
                <Store className="h-4 w-4 mr-2" />
                Sign in as Seller
              </div>
            )}
          </Button>
        </form>

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Seller Dashboard Features:
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Manage property listings and updates</p>
            <p>• Track inquiries and messages from buyers</p>
            <p>• View analytics and performance metrics</p>
            <p>• Manage packages and subscriptions</p>
          </div>
        </div>

        {/* Need Account */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have a seller account?{" "}
            <button
              onClick={() => window.location.href = "/auth"}
              className="font-medium text-[#C70000] hover:text-[#A60000] transition-colors"
            >
              Register here
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Join thousands of sellers using Ashish Properties</p>
        </div>
      </div>
    </div>
  );
}
