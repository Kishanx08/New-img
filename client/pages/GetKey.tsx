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
    </div>
  );
}
