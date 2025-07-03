<<<<<<< HEAD
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
=======
import React, { useState } from "react";
import {
  Key,
  Copy,
  ExternalLink,
  Shield,
  Zap,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ApiKeyResponse } from "@shared/types";
import { useNavigate } from "react-router-dom";

export default function GetKey() {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [limits, setLimits] = useState<{
    dailyLimit: number;
    hourlyLimit: number;
  } | null>(null);
  const navigate = useNavigate();

  const generateApiKey = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/keys/generate", {
        method: "POST",
      });

      const data: ApiKeyResponse = await response.json();

      if (data.success && data.data) {
        setApiKey(data.data.apiKey);
        setLimits(data.data.limits);
        toast({
          title: "API Key Generated!",
          description: "Your API key is ready to use.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate API key",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate API key. Please try again.",
        variant: "destructive",
      });
>>>>>>> origin/main
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
=======
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "API key copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
>>>>>>> origin/main
    }
  };

  const goToDashboard = () => {
<<<<<<< HEAD
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
=======
    if (apiKey) {
      navigate(`/dashboard?key=${apiKey}`);
    }
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Key className="h-10 w-10" />
            Get Your API Key
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Generate your personal API key to upload images with higher rate
            limits and track your usage.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* API Key Generation */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Generate API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!apiKey ? (
                <>
                  <p className="text-muted-foreground">
                    Click the button below to generate your unique API key. One
                    key per IP address.
                  </p>
                  <Button
                    onClick={generateApiKey}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Generate API Key
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Your API Key
                    </label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={apiKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {limits && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2">Your Limits</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Daily:</span>
                          <span className="ml-2 font-medium">
                            {limits.dailyLimit} uploads
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hourly:</span>
                          <span className="ml-2 font-medium">
                            {limits.hourlyLimit} uploads
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={goToDashboard} className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Dashboard
                    </Button>
                    <Button variant="outline" onClick={goHome}>
                      Upload Images
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                API Key Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Higher Rate Limits</h4>
                    <p className="text-sm text-muted-foreground">
                      50 uploads per day vs 5 per hour for anonymous users
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Usage Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      Track your uploads and monitor usage statistics
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Personal Dashboard</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage your uploads and regenerate keys
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Rate Limits Comparison</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anonymous:</span>
                    <span>5 uploads/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">With API Key:</span>
                    <span className="text-primary font-medium">
                      50 uploads/day
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        {apiKey && (
          <Card className="cyber-card mt-8">
            <CardHeader>
              <CardTitle>How to Use Your API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">
                    1. Via Header (Recommended)
                  </h4>
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    curl -X POST -H "x-api-key: {apiKey}" -F "image=@photo.jpg"
                    /api/upload
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Via Query Parameter</h4>
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    /api/upload?apiKey={apiKey}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. In Web Interface</h4>
                  <p className="text-sm text-muted-foreground">
                    The web interface will automatically use your API key when
                    you paste it in the API key configuration dialog.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
>>>>>>> origin/main
    </div>
  );
}
