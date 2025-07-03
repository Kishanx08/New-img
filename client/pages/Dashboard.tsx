import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
=======
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Key,
  Upload,
  Clock,
  Trash2,
  RefreshCw,
  Copy,
  ExternalLink,
  AlertTriangle,
  Activity,
  Database,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
>>>>>>> origin/main
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
<<<<<<< HEAD
  Copy,
  Key,
  Trash2,
  RefreshCw,
  Upload,
  Eye,
  Download,
  Calendar,
  HardDrive,
  Activity,
  ExternalLink,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DashboardResponse,
  UserImage,
  ApiKeyResponse,
  DeleteImageResponse,
} from "@shared/api";
import favicon from "/favicon.ico";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null,
  );
  const [regenerating, setRegenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const keyFromUrl = searchParams.get("key");
    const keyFromStorage = localStorage.getItem("x02_api_key");

    if (keyFromUrl) {
      setApiKey(keyFromUrl);
      localStorage.setItem("x02_api_key", keyFromUrl);
    } else if (keyFromStorage) {
      setApiKey(keyFromStorage);
    } else {
      navigate("/getkey");
      return;
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    if (apiKey) {
      loadDashboardData();
    }
  }, [apiKey]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch(`/api/dashboard?key=${apiKey}`);
      if (!response.ok) {
        throw new Error("Failed to load dashboard data");
      }
      const data: DashboardResponse = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      alert("Failed to load dashboard. Please check your API key.");
      navigate("/getkey");
=======
  DashboardResponse,
  ApiKeyResponse,
  DeleteImageResponse,
} from "@shared/types";
import { UserSession, AnonymousSession } from "@shared/auth-types";
import ErrorBoundary from "@/components/ErrorBoundary";

interface Upload {
  filename: string;
  url: string;
  timestamp: string;
  size: number;
}

function DashboardContent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [userSession, setUserSession] = useState<
    UserSession | AnonymousSession | null
  >(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Get user session
    const sessionData = localStorage.getItem("x02_session");
    if (!sessionData) {
      setError("No active session");
      setLoading(false);
      return;
    }

    try {
      const session = JSON.parse(sessionData);
      setUserSession(session);

      if (session.isAnonymous) {
        setError("Dashboard not available for anonymous users");
        setLoading(false);
        return;
      }

      if (session.apiKey) {
        fetchDashboardData(session.apiKey);
      } else {
        setError("No API key found in session");
        setLoading(false);
      }
    } catch (error) {
      console.error("Session parse error:", error);
      setError("Invalid session data");
      setLoading(false);
      localStorage.removeItem("x02_session");
    }
  }, []);

  const fetchDashboardData = async (apiKey: string) => {
    try {
      const response = await fetch("/api/user/dashboard", {
        headers: {
          "x-api-key": apiKey,
        },
      });

      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || "Failed to load dashboard");
      }
    } catch (err) {
      setError("Failed to load dashboard data");
>>>>>>> origin/main
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const regenerateApiKey = async () => {
    setRegenerating(true);
    try {
      const response = await fetch("/api/regenerate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldKey: apiKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate API key");
      }

      const data: ApiKeyResponse = await response.json();
      setApiKey(data.apiKey);
      localStorage.setItem("x02_api_key", data.apiKey);

      // Update URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("key", data.apiKey);
      window.history.replaceState({}, "", newUrl.toString());

      // Reload dashboard data
      setTimeout(() => loadDashboardData(), 500);
    } catch (error) {
      console.error("Error regenerating API key:", error);
      alert("Failed to regenerate API key. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
        headers: { "x-api-key": apiKey },
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      // Reload dashboard data
      loadDashboardData();
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image. Please try again.");
    }
  };

  const copyImageUrl = async (url: string) => {
    try {
      const fullUrl = url.startsWith("http")
        ? url
        : `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
    } catch (error) {
      console.error("Failed to copy:", error);
=======
  const regenerateApiKey = async () => {
    // For now, disable API key regeneration for user accounts
    // This feature would require updating the user's API key in the database
    toast({
      title: "Feature Coming Soon",
      description:
        "API key regeneration for user accounts will be available soon.",
    });
  };

  const deleteImage = async (filename: string) => {
    if (!userSession || userSession.isAnonymous || !("apiKey" in userSession)) {
      toast({
        title: "Error",
        description: "Authentication required to delete images",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/user/images/${filename}`, {
        method: "DELETE",
        headers: {
          "x-api-key": userSession.apiKey,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Image Deleted",
          description: "Image has been successfully deleted.",
        });
        // Refresh dashboard data
        if (
          userSession &&
          !userSession.isAnonymous &&
          "apiKey" in userSession
        ) {
          fetchDashboardData(userSession.apiKey);
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete image",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard.",
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

<<<<<<< HEAD
  const formatDate = (isoString: string) => {
    return (
      new Date(isoString).toLocaleDateString() +
      " " +
      new Date(isoString).toLocaleTimeString()
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
=======
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!userSession || userSession.isAnonymous) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Dashboard is only available for registered users.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => navigate("/auth")}>Login / Register</Button>
          </div>
        </div>
>>>>>>> origin/main
      </div>
    );
  }

  if (loading) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mb-4" />
          <p className="text-green-300">Loading dashboard...</p>
=======
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading dashboard...</p>
          </div>
>>>>>>> origin/main
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{ fontFamily: "Inter, Poppins, Montserrat, sans-serif" }}
    >
      {/* Header */}
      <header className="w-full border-b border-green-800/40 bg-black/60 backdrop-blur-md py-4 mb-8">
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4">
          <img src={favicon} alt="logo" className="w-10 h-10 rounded-lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight inline-block border-b-2 border-green-400 text-green-300 pb-1">
              X02 Dashboard
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

      <main className="max-w-6xl mx-auto px-4 space-y-8">
        {/* API Key Section */}
        <Card className="bg-black/60 border-green-800/40 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-green-400" />
                Your API Key
              </h2>
              <div className="font-mono text-sm text-green-300 break-all">
                {apiKey}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyApiKey}
                className="border-green-700 text-green-300 hover:bg-green-900/30"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
=======
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => {
                if (
                  userSession &&
                  !userSession.isAnonymous &&
                  "apiKey" in userSession
                ) {
                  fetchDashboardData(userSession.apiKey);
                }
              }}
              disabled={!userSession || userSession.isAnonymous}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" onClick={() => navigate("/getkey")}>
              Get New Key
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const remainingDaily = data?.user?.usage?.remaining || 0;
  const usagePercentage =
    data?.user?.usage?.todayCount && data?.user?.limits?.dailyLimit
      ? (data.user.usage.todayCount / data.user.limits.dailyLimit) * 100
      : 0;

  const theme = darkMode
    ? {
        bg: "bg-black",
        card: "bg-black/60 border-green-800/40 text-white",
        glass: "bg-black/70 border-green-700/40 text-green-300",
        input: "bg-black/80 text-white border-green-800/40",
        text: "text-white",
        accent: "text-green-300 border-green-400",
        subtext: "text-green-200/70",
        button: "bg-green-700 hover:bg-green-600 text-white",
        buttonOutline: "border-green-700 text-green-300 hover:bg-green-900/30",
      }
    : {
        bg: "bg-white",
        card: "bg-white/80 border-green-300/40 text-black",
        glass: "bg-white/90 border-green-300/40 text-green-700",
        input: "bg-white text-black border-green-300/40",
        text: "text-black",
        accent: "text-green-700 border-green-500",
        subtext: "text-green-700/70",
        button: "bg-green-600 hover:bg-green-500 text-white",
        buttonOutline: "border-green-600 text-green-700 hover:bg-green-100/30",
      };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${theme.bg} ${theme.text}`}
      style={{ fontFamily: "Inter, Poppins, Montserrat, sans-serif" }}
    >
      {/* Header */}
      <header
        className={`w-full border-b ${theme.card} backdrop-blur-md py-4 mb-8 relative z-10`}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4 px-4">
          <div className="flex-1">
            <h1
              className={`text-2xl font-bold tracking-tight inline-block border-b-2 ${theme.accent} pb-1 flex items-center gap-3`}
            >
              <Activity className="h-8 w-8" />
              API Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {userSession &&
              !userSession.isAnonymous &&
              "username" in userSession && (
                <div className={`text-sm ${theme.accent}`}>
                  Welcome, {userSession.username}
                </div>
              )}
            <Button
              size="sm"
              className={`${theme.buttonOutline} border`}
              onClick={() => {
                localStorage.removeItem("x02_session");
                navigate("/auth");
              }}
            >
              Logout
            </Button>
            <Button
              size="sm"
              className={`${theme.buttonOutline} border`}
              onClick={() => setDarkMode((d) => !d)}
            >
              {darkMode ? "Light" : "Dark"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <p className={`${theme.subtext} text-lg`}>
            Monitor your API usage and manage your uploads
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* API Key Info */}
          <Card
            className={`${theme.card} backdrop-blur-lg border-2 rounded-xl`}
            style={{
              border: "1.5px solid #fff2",
              boxShadow: "0 2px 24px #00ff8033",
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Your Key
                </label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={data?.user?.apiKey || ""}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    className={`${theme.button} mr-2 shadow-none hover:shadow-green-400/30 transition-shadow`}
                    onClick={() => copyToClipboard(data?.user?.apiKey || "")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

>>>>>>> origin/main
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
<<<<<<< HEAD
                    size="sm"
                    disabled={regenerating}
                    className="border-yellow-700 text-yellow-300 hover:bg-yellow-900/30"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${regenerating ? "animate-spin" : ""}`}
                    />
                    Regenerate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black border-green-800/40">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Regenerate API Key
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-green-200/70">
                      This will create a new API key and deactivate your current
                      one. Your existing images will remain accessible with the
                      new key.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-green-700 text-green-300 hover:bg-green-900/30">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={regenerateApiKey}
                      className="bg-yellow-700 hover:bg-yellow-600 text-white"
                    >
                      Regenerate Key
=======
                    className="w-full"
                    disabled={regenerating}
                  >
                    {regenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate Key
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will invalidate your current API key and generate a
                      new one. You'll need to update any applications using the
                      old key.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={regenerateApiKey}>
                      Regenerate
>>>>>>> origin/main
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
<<<<<<< HEAD
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        {dashboardData && (
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-black/60 border-green-800/40 p-6 text-center">
              <Upload className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">
                {dashboardData.stats.uploadsCount}
              </div>
              <div className="text-green-200/70 text-sm">Total Uploads</div>
            </Card>

            <Card className="bg-black/60 border-green-800/40 p-6 text-center">
              <Activity className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">
                {dashboardData.stats.remainingUploads}
              </div>
              <div className="text-green-200/70 text-sm">Remaining Today</div>
            </Card>

            <Card className="bg-black/60 border-green-800/40 p-6 text-center">
              <HardDrive className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">
                {formatFileSize(dashboardData.stats.totalSize)}
              </div>
              <div className="text-green-200/70 text-sm">Total Size</div>
            </Card>

            <Card className="bg-black/60 border-green-800/40 p-6 text-center">
              <Calendar className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <div className="text-lg font-bold text-white">
                {dashboardData.stats.dailyLimit}
              </div>
              <div className="text-green-200/70 text-sm">Daily Limit</div>
            </Card>
          </div>
        )}

        {/* Images Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Your Images</h2>
            <div className="text-green-200/70 text-sm">
              {dashboardData?.images.length || 0} images
            </div>
          </div>

          {!dashboardData?.images.length ? (
            <Card className="bg-black/60 border-green-800/40 p-8 text-center">
              <Upload className="h-12 w-12 text-green-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No images yet
              </h3>
              <p className="text-green-200/70 mb-4">
                Start uploading images to see them here in your dashboard.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="bg-green-700 hover:bg-green-600 text-white"
              >
                Upload Your First Image
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {dashboardData.images.map((image) => (
                <Card
                  key={image.id}
                  className="bg-black/60 border-green-800/40 p-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      className="w-16 h-16 object-cover rounded border border-green-900/40"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {image.originalName}
                      </div>
                      <div className="text-green-300 text-sm">
                        {formatFileSize(image.size)} •{" "}
                        {formatDate(image.uploadedAt)}
                      </div>
                      <div className="text-green-400 text-xs break-all">
                        {image.url}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyImageUrl(image.url)}
                        className="border-green-700 text-green-300 hover:bg-green-900/30"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(image.url, "_blank")}
                        className="border-green-700 text-green-300 hover:bg-green-900/30"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-700 text-red-300 hover:bg-red-900/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-black border-green-800/40">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">
                              Delete Image
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-green-200/70">
                              This will permanently delete "{image.originalName}
                              " from our servers. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-green-700 text-green-300 hover:bg-green-900/30">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteImage(image.id)}
                              className="bg-red-700 hover:bg-red-600 text-white"
                            >
                              Delete Image
=======
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card
            className={`${theme.card} backdrop-blur-lg border-2 rounded-xl`}
            style={{
              border: "1.5px solid #fff2",
              boxShadow: "0 2px 24px #00ff8033",
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Usage Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Daily Usage</span>
                  <span>
                    {data?.user?.usage?.todayCount || 0} /{" "}
                    {data?.user?.limits?.dailyLimit || 0}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(() => {
                        try {
                          const todayCount = data?.user?.usage?.todayCount || 0;
                          const dailyLimit =
                            data?.user?.limits?.dailyLimit || 1;
                          if (
                            typeof todayCount !== "number" ||
                            typeof dailyLimit !== "number"
                          ) {
                            return "0";
                          }
                          const percentage =
                            dailyLimit > 0
                              ? (todayCount / dailyLimit) * 100
                              : 0;
                          const result = Math.min(Math.max(percentage, 0), 100);
                          return isNaN(result) ? "0" : result.toString();
                        } catch (e) {
                          console.error(
                            "Error calculating usage percentage:",
                            e,
                          );
                          return "0";
                        }
                      })()}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Remaining:</span>
                  <div className="font-medium">
                    {data?.user?.usage?.remaining || 0}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Used:</span>
                  <div className="font-medium text-xs">
                    {data?.user?.usage?.lastUsed
                      ? formatDate(data.user.usage.lastUsed)
                      : "Never"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limits */}
          <Card
            className={`${theme.card} backdrop-blur-lg border-2 rounded-xl`}
            style={{
              border: "1.5px solid #fff2",
              boxShadow: "0 2px 24px #00ff8033",
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Rate Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Daily Limit
                    </span>
                    <span className="font-medium">
                      {data?.user?.limits?.dailyLimit || 0}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Hourly Limit
                    </span>
                    <span className="font-medium">
                      {data?.user?.limits?.hourlyLimit || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">
                  Limits reset daily at midnight UTC
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Uploads History */}
        <Card
          className={`${theme.card} backdrop-blur-lg border-2 rounded-xl mb-8`}
          style={{
            border: "1.5px solid #fff2",
            boxShadow: "0 2px 24px #00ff8033",
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Recent Uploads ({data?.uploads?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.uploads?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No uploads yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/")}
                >
                  Start Uploading
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {data.uploads?.map((upload, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                  >
                    <img
                      src={upload.url}
                      alt={upload.filename}
                      className="w-12 h-12 object-cover rounded border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {upload.filename}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(upload.size)} •{" "}
                        {formatDate(upload.timestamp)}
                      </div>
                      <div className="text-xs text-muted-foreground break-all">
                        {upload.url}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(upload.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(upload.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{upload.filename}".
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteImage(upload.filename)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
>>>>>>> origin/main
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
<<<<<<< HEAD
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center text-green-200/50 text-sm mt-12 mb-4">
        &copy; {new Date().getFullYear()} X02 Image Uploader
      </footer>
    </div>
  );
}
=======
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentation Section */}
        <Card
          className={`${theme.card} backdrop-blur-lg border-2 rounded-xl mb-8`}
          style={{
            border: "1.5px solid #fff2",
            boxShadow: "0 2px 24px #00ff8033",
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              API Documentation & Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Usage */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${theme.accent}`}>
                API Usage
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Upload Image</h4>
                  <div
                    className={`${theme.glass} p-4 rounded-lg font-mono text-sm backdrop-blur-lg border`}
                    style={{ border: "1px solid #fff2" }}
                  >
                    <div className="mb-2">POST https://x02.me/api/upload</div>
                    <div className="mb-2">
                      Headers: x-api-key: {data?.user?.apiKey || "YOUR_API_KEY"}
                    </div>
                    <div>Body: multipart/form-data with 'image' field</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">cURL Example</h4>
                  <div
                    className={`${theme.glass} p-4 rounded-lg font-mono text-sm backdrop-blur-lg border overflow-x-auto`}
                    style={{ border: "1px solid #fff2" }}
                  >
                    {`curl -X POST "https://x02.me/api/upload" \\
  -H "x-api-key: ${data?.user?.apiKey || "YOUR_API_KEY"}" \\
  -F "image=@/path/to/your/image.png"`}
                  </div>
                </div>
              </div>
            </div>

            {/* ShareX Configuration */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${theme.accent}`}>
                ShareX Configuration
              </h3>
              <p className={`${theme.subtext} mb-3`}>
                Download this SXCU file to automatically configure ShareX with
                your API key:
              </p>
              <div className="flex gap-3 mb-4">
                <Button
                  className={`${theme.button} shadow-none hover:shadow-green-400/30 transition-shadow`}
                  onClick={() => {
                    const sharexConfig = {
                      Version: "13.6.1",
                      Name: "X02 Image Uploader",
                      DestinationType: "ImageUploader",
                      RequestMethod: "POST",
                      RequestURL: "https://x02.me/api/upload",
                      Headers: {
                        "X-API-Key": data?.user?.apiKey || "YOUR_API_KEY",
                      },
                      Body: "MultipartFormData",
                      FileFormName: "image",
                      DeletionURL: "",
                      Arguments: {},
                      ResponseType: "Text",
                    };

                    const blob = new Blob(
                      [JSON.stringify(sharexConfig, null, 2)],
                      {
                        type: "application/json",
                      },
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "x02-image-uploader.sxcu";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    toast({
                      title: "ShareX Config Downloaded",
                      description:
                        "Import the .sxcu file into ShareX to get started!",
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download ShareX Config
                </Button>
                <Button
                  variant="outline"
                  className={`${theme.buttonOutline} hover:shadow-green-400/20 transition-shadow`}
                  onClick={() => {
                    const configText = JSON.stringify(
                      {
                        Version: "13.6.1",
                        Name: "X02 Image Uploader",
                        DestinationType: "ImageUploader",
                        RequestMethod: "POST",
                        RequestURL: "https://x02.me/api/upload",
                        Headers: {
                          "X-API-Key": data?.user?.apiKey || "YOUR_API_KEY",
                        },
                        Body: "MultipartFormData",
                        FileFormName: "image",
                        DeletionURL: "",
                        Arguments: {},
                        ResponseType: "Text",
                      },
                      null,
                      2,
                    );

                    navigator.clipboard.writeText(configText).then(() => {
                      toast({
                        title: "Config Copied",
                        description:
                          "ShareX configuration copied to clipboard!",
                      });
                    });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Config
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">ShareX Setup Instructions</h4>
                <ol
                  className={`${theme.subtext} text-sm space-y-1 list-decimal list-inside`}
                >
                  <li>Download the .sxcu file above</li>
                  <li>Open ShareX → Destinations → Custom uploader settings</li>
                  <li>Click "Import" and select the downloaded .sxcu file</li>
                  <li>Set "X02 Image Uploader" as your image destination</li>
                  <li>Start uploading images with your hotkeys!</li>
                </ol>
              </div>
            </div>

            {/* Programming Examples */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${theme.accent}`}>
                Programming Examples
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Python Example</h4>
                  <div
                    className={`${theme.glass} p-4 rounded-lg font-mono text-sm backdrop-blur-lg border overflow-x-auto`}
                    style={{ border: "1px solid #fff2" }}
                  >
                    {`import requests

url = "https://x02.me/api/upload"
headers = {"x-api-key": "${data?.user?.apiKey || "YOUR_API_KEY"}"}
files = {"image": open("image.png", "rb")}

response = requests.post(url, headers=headers, files=files)
print(response.text)  # Direct image URL`}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">JavaScript Example</h4>
                  <div
                    className={`${theme.glass} p-4 rounded-lg font-mono text-sm backdrop-blur-lg border overflow-x-auto`}
                    style={{ border: "1px solid #fff2" }}
                  >
                    {`const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('https://x02.me/api/upload', {
  method: 'POST',
  headers: {
    'x-api-key': '${data?.user?.apiKey || "YOUR_API_KEY"}'
  },
  body: formData
})
.then(response => response.text())
.then(imageUrl => console.log(imageUrl));`}
                  </div>
                </div>
              </div>
            </div>

            {/* Rate Limits Info */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${theme.accent}`}>
                Rate Limits & Guidelines
              </h3>
              <div
                className={`${theme.glass} p-4 rounded-lg backdrop-blur-lg border`}
                style={{ border: "1px solid #fff2" }}
              >
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Your Current Limits</h4>
                    <ul className="space-y-1">
                      <li>
                        Daily: {data?.user?.limits?.dailyLimit || 0} uploads
                      </li>
                      <li>
                        Hourly: {data?.user?.limits?.hourlyLimit || 0} uploads
                      </li>
                      <li>Max file size: 30MB</li>
                      <li>Supported: JPG, PNG, GIF, WebP</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Best Practices</h4>
                    <ul className="space-y-1">
                      <li>Keep your API key secure</li>
                      <li>Implement error handling</li>
                      <li>Respect rate limits</li>
                      <li>Use appropriate image formats</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
>>>>>>> origin/main
