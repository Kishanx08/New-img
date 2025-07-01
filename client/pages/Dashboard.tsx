import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mb-4" />
          <p className="text-green-300">Loading dashboard...</p>
        </div>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
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
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
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
