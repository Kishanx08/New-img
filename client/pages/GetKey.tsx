import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Key,
  ArrowRight,
  Sparkles,
  Shield,
  Activity,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ApiKeyResponse } from "@shared/api";
import favicon from "/favicon.ico";

export default function GetKey() {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateApiKey = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to generate API key");
      }

      const data: ApiKeyResponse = await response.json();
      setApiKey(data.apiKey);

      // Save to localStorage
      localStorage.setItem("x02_api_key", data.apiKey);
    } catch (error) {
      console.error("Error generating API key:", error);
      alert("Failed to generate API key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const goToDashboard = () => {
    navigate(`/dashboard?key=${apiKey}`);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{ fontFamily: "Inter, Poppins, Montserrat, sans-serif" }}
    >
      {/* Header */}
      <header className="w-full border-b border-green-800/40 bg-black/60 backdrop-blur-md py-4 mb-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4 px-4">
          <img src={favicon} alt="logo" className="w-10 h-10 rounded-lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight inline-block border-b-2 border-green-400 text-green-300 pb-1">
              X02 API Key Generator
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="border-green-700 text-green-300 hover:bg-green-900/30"
          >
            Back to Uploader
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        {!apiKey ? (
          /* Generate API Key Section */
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/30 border border-green-700/40 text-green-300 text-sm">
                <Key className="h-4 w-4" />
                Free API Access
              </div>
              <h2 className="text-4xl font-bold text-white">
                Get Your Free API Key
              </h2>
              <p className="text-green-200/70 text-lg max-w-2xl mx-auto">
                Generate a personal API key to upload images with higher limits
                and access to your personal dashboard.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              <Card className="bg-black/60 border-green-800/40 p-6 text-center">
                <Shield className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Secure Access</h3>
                <p className="text-green-200/70 text-sm">
                  Your API key provides secure, authenticated access to the
                  upload service.
                </p>
              </Card>

              <Card className="bg-black/60 border-green-800/40 p-6 text-center">
                <Zap className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Higher Limits</h3>
                <p className="text-green-200/70 text-sm">
                  50 uploads per day vs 5 per hour for anonymous users.
                </p>
              </Card>

              <Card className="bg-black/60 border-green-800/40 p-6 text-center">
                <Activity className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">
                  Personal Dashboard
                </h3>
                <p className="text-green-200/70 text-sm">
                  Track your uploads, view usage stats, and manage your images.
                </p>
              </Card>
            </div>

            {/* Generate Button */}
            <Card className="bg-black/60 border-green-800/40 p-8 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Ready to get started?
                  </h3>
                  <p className="text-green-200/70 text-sm mb-6">
                    Click below to generate your free API key instantly. No
                    signup required!
                  </p>
                </div>

                <Button
                  onClick={generateApiKey}
                  disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-600 text-white py-3 text-lg font-medium"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Key className="h-5 w-5 mr-2" />
                      Generate API Key
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Usage Limits */}
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-6 max-w-2xl mx-auto">
              <h4 className="font-semibold text-white mb-4 text-center">
                Usage Limits
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-green-300 font-medium">
                    Anonymous Users
                  </div>
                  <div className="text-green-200/70">5 uploads per hour</div>
                </div>
                <div className="text-center">
                  <div className="text-green-300 font-medium">
                    API Key Users
                  </div>
                  <div className="text-green-200/70">50 uploads per day</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* API Key Generated Section */
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/30 border border-green-700/40 text-green-300 text-sm">
                <Sparkles className="h-4 w-4" />
                API Key Generated
              </div>
              <h2 className="text-4xl font-bold text-white">
                Your API Key is Ready!
              </h2>
              <p className="text-green-200/70 text-lg">
                Save this key securely. You'll need it to access higher upload
                limits.
              </p>
            </div>

            {/* API Key Display */}
            <Card className="bg-black/60 border-green-800/40 p-6 max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-white mb-4">
                    Your API Key
                  </h3>
                  <div className="relative">
                    <Input
                      value={apiKey}
                      readOnly
                      className="bg-black/80 text-white border-green-800/40 text-center font-mono text-sm pr-12"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyApiKey}
                      className="absolute right-1 top-1 h-8 w-8 p-0 text-green-300 hover:text-white hover:bg-green-900/30"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-green-400 text-sm mt-2">
                      ✓ Copied to clipboard!
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={copyApiKey}
                    variant="outline"
                    className="border-green-700 text-green-300 hover:bg-green-900/30"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Key
                  </Button>
                  <Button
                    onClick={goToDashboard}
                    className="bg-green-700 hover:bg-green-600 text-white"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Important Notes */}
            <Card className="bg-green-900/20 border border-green-700/30 p-6 max-w-2xl mx-auto text-left">
              <h4 className="font-semibold text-white mb-3">Important Notes</h4>
              <ul className="space-y-2 text-green-200/70 text-sm">
                <li>• Keep your API key secure and don't share it publicly</li>
                <li>
                  • You can regenerate your key anytime from the dashboard
                </li>
                <li>• Your key provides 50 uploads per day (resets daily)</li>
                <li>• Use your key in the x-api-key header for API requests</li>
              </ul>
            </Card>
          </div>
        )}
      </main>

      <footer className="text-center text-green-200/50 text-sm mt-12 mb-4">
        &copy; {new Date().getFullYear()} X02 Image Uploader
      </footer>
    </div>
  );
}
