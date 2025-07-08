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

  // Default to dark mode for consistency (can add toggle if needed)
  const darkMode = true;
  const theme = darkMode
    ? {
        bg: "bg-black",
        card: "bg-black/60 border-green-800/40 text-white",
        input: "bg-black/80 text-white border-green-800/40",
        text: "text-white",
        accent: "text-green-300 border-green-400",
        subtext: "text-green-200/70",
        button: "bg-green-700 hover:bg-green-600 text-white",
        buttonOutline: "border-green-700 text-green-300 hover:bg-green-900/30",
      }
    : {
        bg: "bg-gradient-to-br from-gray-100 via-blue-100 to-teal-50",
        card: "bg-white border border-gray-200 rounded-xl shadow-md text-gray-900",
        input: "bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:border-teal-400 focus:ring-1 focus:ring-teal-200",
        text: "text-gray-900",
        accent: "text-teal-600 border-teal-500",
        subtext: "text-gray-500",
        button: "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium rounded px-4 py-2 shadow",
        buttonOutline: "border border-teal-500 text-teal-600 hover:bg-teal-50 font-medium rounded px-4 py-2",
      };

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
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const goToDashboard = () => {
    if (apiKey) {
      navigate(`/dashboard?key=${apiKey}`);
    }
  };

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}${darkMode ? ' dark' : ''}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${theme.text}`}>
            <Key className="h-10 w-10" />
            Get Your API Key
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${theme.subtext}`}>
            Generate your personal API key to upload images with higher rate
            limits and track your usage.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {/* API Key Generation */}
          <Card className={theme.card}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Generate API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!apiKey ? (
                <>
                  <p className={theme.subtext}>
                    Click the button below to generate your unique API key. One
                    key per IP address.
                  </p>
                  <Button
                    onClick={generateApiKey}
                    disabled={loading}
                    className={`w-full ${theme.button}`}
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
                    <label className={`text-sm font-medium ${theme.subtext}`}>
                      Your API Key
                    </label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={apiKey}
                        readOnly
                        className={`font-mono text-sm ${theme.input}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className={theme.buttonOutline}
                        onClick={() => copyToClipboard(apiKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {limits && (
                    <div className="p-3 rounded-lg" style={{ background: darkMode ? 'rgba(34,255,170,0.07)' : undefined }}>
                      <h4 className="font-medium mb-2">Your Limits</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={theme.subtext}>Daily:</span>
                          <span className="ml-2 font-medium">
                            {limits.dailyLimit} uploads
                          </span>
                        </div>
                        <div>
                          <span className={theme.subtext}>Hourly:</span>
                          <span className="ml-2 font-medium">
                            {limits.hourlyLimit} uploads
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={goToDashboard} className={`flex-1 ${theme.button}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Dashboard
                    </Button>
                    <Button variant="outline" className={theme.buttonOutline} onClick={goHome}>
                      Upload Images
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Benefits */}
          <Card className={theme.card}>
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
                    <p className={`text-sm ${theme.subtext}`}>
                      50 uploads per day vs 5 per hour for anonymous users
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Usage Tracking</h4>
                    <p className={`text-sm ${theme.subtext}`}>
                      Track your uploads and monitor usage statistics
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Personal Dashboard</h4>
                    <p className={`text-sm ${theme.subtext}`}>
                      Manage your uploads and regenerate keys
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: darkMode ? 'rgba(34,255,170,0.07)' : undefined }}>
                <h4 className="font-medium mb-2">Rate Limits Comparison</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={theme.subtext}>Anonymous:</span>
                    <span>5 uploads/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme.subtext}>With API Key:</span>
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
          <Card className={`${theme.card} mt-8`}>
            <CardHeader>
              <CardTitle>How to Use Your API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">
                    1. Via Header (Recommended)
                  </h4>
                  <div className={`font-mono text-sm p-3 rounded ${theme.bg}`}
                    style={{ background: darkMode ? 'rgba(34,255,170,0.07)' : undefined }}>
                    curl -X POST -H "x-api-key: {apiKey}" -F "image=@photo.jpg"
                    /api/upload
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. Via Query Parameter</h4>
                  <div className={`font-mono text-sm p-3 rounded ${theme.bg}`}
                    style={{ background: darkMode ? 'rgba(34,255,170,0.07)' : undefined }}>
                    /api/upload?apiKey={apiKey}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">3. In Web Interface</h4>
                  <p className={`text-sm ${theme.subtext}`}>
                    The web interface will automatically use your API key when
                    you paste it in the API key configuration dialog.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
