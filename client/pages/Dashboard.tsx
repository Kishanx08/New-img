import React, { useState, useEffect } from "react";
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
  Image,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  DashboardResponse,
  ApiKeyResponse,
  DeleteImageResponse,
} from "@shared/types";
import { UserSession, AnonymousSession } from "@shared/auth-types";
import ErrorBoundary from "@/components/ErrorBoundary";
import favicon from "/favicon.ico";

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
  const [darkMode, setDarkMode] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Watermark Settings Component
  const WatermarkSettings = () => {
    const [watermarkEnabled, setWatermarkEnabled] = useState(true);
    const [watermarkText, setWatermarkText] = useState('x02.me');
    const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
    const [watermarkOpacity, setWatermarkOpacity] = useState(0.6);
    const [watermarkFontSize, setWatermarkFontSize] = useState(20);
    const [watermarkColor, setWatermarkColor] = useState('#ffffff');
    const [watermarkPadding, setWatermarkPadding] = useState(15);
    const [asyncWatermarking, setAsyncWatermarking] = useState(false);
    const [fastMode, setFastMode] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load current settings on component mount
    useEffect(() => {
      const loadSettings = async () => {
        if (!userSession || userSession.isAnonymous || !("apiKey" in userSession)) {
          return;
        }

        try {
          const response = await fetch('/api/user/watermark/settings', {
            headers: {
              'x-api-key': userSession.apiKey,
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.settings) {
              setWatermarkEnabled(result.settings.enabled);
              setWatermarkText(result.settings.text);
              setWatermarkPosition(result.settings.position);
              setWatermarkOpacity(result.settings.opacity);
              setWatermarkFontSize(result.settings.fontSize);
              setWatermarkColor(result.settings.color);
              setWatermarkPadding(result.settings.padding);
              setAsyncWatermarking(result.settings.async || false);
              setFastMode(result.settings.fastMode || false);
            }
          }
        } catch (error) {
          console.error('Failed to load watermark settings:', error);
        }
      };

      loadSettings();
    }, [userSession]);

    const updateWatermarkSettings = async () => {
      if (!userSession || userSession.isAnonymous || !("apiKey" in userSession)) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/user/watermark/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': userSession.apiKey,
          },
          body: JSON.stringify({
            enabled: watermarkEnabled,
            text: watermarkText,
            position: watermarkPosition,
            opacity: watermarkOpacity,
            fontSize: watermarkFontSize,
            color: watermarkColor,
            padding: watermarkPadding,
            async: asyncWatermarking,
            fastMode: fastMode,
          }),
        });

        if (response.ok) {
          toast({
            title: "Settings Updated",
            description: "Watermark settings have been saved.",
          });
        } else {
          const error = await response.json();
          toast({
            title: "Error",
            description: error.error || "Failed to update watermark settings.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update watermark settings.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <Card className={`${theme.card} backdrop-blur-md border`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${theme.accent}`}>
            <Image className="w-5 h-5" />
            Watermark Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={watermarkEnabled}
              onCheckedChange={setWatermarkEnabled}
              className={darkMode ? '' : 'data-[state=checked]:bg-teal-500 data-[state=unchecked]:bg-gray-300'}
            />
            <Label className={theme.text}>Enable watermark on uploads</Label>
          </div>
          
          {watermarkEnabled && (
            <>
              <div className="space-y-2">
                <Label className={theme.text}>Watermark Text</Label>
                <Input
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="x02.me"
                  className={`${theme.input} border`}
                />
              </div>
              
              <div className="space-y-2">
                <Label className={theme.text}>Position</Label>
                <Select value={watermarkPosition} onValueChange={setWatermarkPosition}>
                  <SelectTrigger className={`${theme.input} border`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className={theme.text}>Opacity: {Math.round(watermarkOpacity * 100)}%</Label>
                <Slider
                  value={[watermarkOpacity * 100]}
                  onValueChange={([v]) => setWatermarkOpacity(v / 100)}
                  min={10}
                  max={100}
                  step={1}
                  className={darkMode ? '' : 'accent-teal-500'}
                />
              </div>

              <div className="space-y-2">
                <Label className={theme.text}>Font Size: {watermarkFontSize}px</Label>
                <Slider
                  value={[watermarkFontSize]}
                  onValueChange={([v]) => setWatermarkFontSize(v)}
                  min={8}
                  max={64}
                  step={1}
                  className={darkMode ? '' : 'accent-teal-500'}
                />
              </div>

              <div className="space-y-2">
                <Label className={theme.text}>Color</Label>
                <Input
                  type="color"
                  value={watermarkColor}
                  onChange={(e) => setWatermarkColor(e.target.value)}
                  className="w-20 h-10 p-1 border rounded"
                />
              </div>

              <div className="space-y-2">
                <Label className={theme.text}>Padding: {watermarkPadding}px</Label>
                <Slider
                  value={[watermarkPadding]}
                  onValueChange={([v]) => setWatermarkPadding(v)}
                  min={0}
                  max={64}
                  step={1}
                  className={darkMode ? '' : 'accent-teal-500'}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={asyncWatermarking}
                  onCheckedChange={setAsyncWatermarking}
                  className={darkMode ? '' : 'data-[state=checked]:bg-teal-500 data-[state=unchecked]:bg-gray-300'}
                />
                <Label className={theme.text}>Fast upload (async watermarking)</Label>
              </div>
              
              {asyncWatermarking && (
                <div className="text-xs text-black p-2 bg-muted/30 rounded">
                  ⚡ Images will upload instantly, then get watermarked in the background
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  checked={fastMode}
                  onCheckedChange={setFastMode}
                  className={darkMode ? '' : 'data-[state=checked]:bg-teal-500 data-[state=unchecked]:bg-gray-300'}
                />
                <Label className={theme.text}>Ultra-fast processing</Label>
              </div>
              
              {fastMode && (
                <div className="text-xs text-black p-2 bg-muted/30 rounded">
                  🚀 Large images will be resized and compressed for maximum speed
                </div>
              )}
            </>
          )}
          
          <Button 
            onClick={updateWatermarkSettings} 
            disabled={loading}
            className={`${theme.button} w-full`}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    );
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
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${theme.bg} ${theme.text}${darkMode ? ' dark' : ''}`}
      style={{ fontFamily: "Inter, Poppins, Montserrat, sans-serif" }}
    >
      {/* Header */}
      <header
        className={`w-full border-b ${theme.card} py-4 mb-8 relative z-10`}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-4 px-4">
          <img src={favicon} alt="logo" className="w-10 h-10 rounded-lg" />
          <div className="flex-1">
            <h1
              className="text-2xl font-bold tracking-tight inline-flex items-center gap-2 pb-1"
              style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
            >
              <span className="w-3 h-3 rounded-full bg-[#E23744]"></span>
              X02 Image Uploader
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {userSession && !userSession.isAnonymous && (
              <div className="text-sm text-blue-600">
                Welcome, {(userSession as UserSession).username}
              </div>
            )}
            {userSession?.isAnonymous && (
              <div className="text-sm text-blue-400">Anonymous User</div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  localStorage.removeItem("x02_session");
                  navigate("/auth");
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
            <Button
              size="sm"
              className={darkMode ? 'border border-green-400 text-green-300 bg-black hover:bg-green-900/20 transition-colors' : 'border border-blue-500 bg-transparent text-blue-600 hover:bg-blue-50'}
              onClick={() => setDarkMode((d) => !d)}
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
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
                <label className={`text-sm ${theme.subtext}`}>Your Key</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={data?.user?.apiKey || ""}
                    readOnly
                    className={`font-mono text-sm ${theme.input}`}
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

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
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
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                  <span className={`text-sm ${theme.subtext}`}>Daily Usage</span>
                  <span>
                    {data?.user?.usage?.todayCount || 0} /{" "}
                    {data?.user?.limits?.dailyLimit || 0}
                  </span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: darkMode ? '#222' : '#e0e7ef' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${usagePercentage}%`,
                      background: darkMode ? '#34d399' : '#38bdf8',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`text-sm ${theme.subtext}`}>Remaining:</span>
                  <div className="font-medium">
                    {data?.user?.usage?.remaining || 0}
                  </div>
                </div>
                <div>
                  <span className={`text-sm ${theme.subtext}`}>Last Used:</span>
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
                    <span className={`text-sm ${theme.subtext}`}>Daily Limit</span>
                    <span className="font-medium">
                      {data?.user?.limits?.dailyLimit || 0}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme.subtext}`}>Hourly Limit</span>
                    <span className="font-medium">
                      {data?.user?.limits?.hourlyLimit || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ background: darkMode ? 'rgba(34,255,170,0.07)' : 'rgba(56,189,248,0.12)' }}>
                <span className={`text-xs ${theme.subtext}`}>Limits reset daily at midnight UTC</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Watermark Settings */}
        <div className="mb-8">
          <WatermarkSettings />
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
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 ${darkMode ? 'bg-black/40 border-green-100/10 hover:bg-green-900/10' : 'bg-cyan-100/40 border-cyan-200 hover:bg-cyan-100/80 shadow'} group`}
                  >
                    <img
                      src={upload.url}
                      alt={upload.filename}
                      className="w-12 h-12 object-cover rounded border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${theme.text}`}>{upload.filename}</div>
                      <div className={`text-sm ${theme.subtext}`}>
                        {formatFileSize(upload.size)} • {formatDate(upload.timestamp)}
                      </div>
                      <div className={`text-xs break-all ${theme.subtext}`}>{upload.url}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        className={`${theme.button} shadow-none hover:shadow-md transition-shadow`}
                        onClick={() => copyToClipboard(upload.url)}
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        size="sm"
                        className={`${theme.buttonOutline} hover:bg-blue-50`}
                        onClick={() => window.open(upload.url, "_blank")}
                        title="Open Image"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" className={`${theme.buttonOutline} hover:bg-red-50`} title="Delete Image">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{upload.filename}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteImage(upload.filename)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
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
                    className={`${theme.card} p-4 rounded-lg font-mono text-sm backdrop-blur-lg border`}
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
                    className={`${theme.card} p-4 rounded-lg font-mono text-sm backdrop-blur-lg border overflow-x-auto`}
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
                    className={`${theme.card} p-4 rounded-lg font-mono text-sm backdrop-blur-lg border overflow-x-auto`}
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
                    className={`${theme.card} p-4 rounded-lg font-mono text-sm backdrop-blur-lg border overflow-x-auto`}
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
                className={`${theme.card} p-4 rounded-lg backdrop-blur-lg border`}
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
