import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  UserCheck,
  UserPlus,
  Eye,
  EyeOff,
  Shield,
  Upload,
  Users,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, FloatingInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  AuthRequest,
  AuthResponse,
  LoginResponse,
  UserSession,
  AnonymousSession,
} from "@shared/auth-types";
import favicon from "/favicon.ico";

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("register");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AuthRequest>({
    username: "",
    password: "",
  });

  useEffect(() => {
    // Check if user is already authenticated
    const session = localStorage.getItem("x02_session");
    if (session) {
      try {
        const parsedSession = JSON.parse(session);
        if (parsedSession.username || parsedSession.isAnonymous) {
          navigate("/");
        }
      } catch (error) {
        // Invalid session, clear it
        localStorage.removeItem("x02_session");
      }
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        // Store session
        const session: UserSession = {
          username: data.data.user.username,
          apiKey: data.data.user.apiKey,
          sessionToken: data.data.sessionToken,
          isAnonymous: false,
          limits: data.data.user.limits,
        };

        localStorage.setItem("x02_session", JSON.stringify(session));

        toast({
          title: "Welcome to X02!",
          description: `Account created successfully. You can upload ${data.data.user.limits.dailyLimit} images per day.`,
        });

        // Force page reload to update authentication state
        window.location.href = "/";
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        // Store session
        const session: UserSession = {
          username: data.data.user.username,
          apiKey: data.data.user.apiKey,
          sessionToken: data.data.sessionToken,
          isAnonymous: false,
          limits: data.data.user.limits,
        };

        localStorage.setItem("x02_session", JSON.stringify(session));

        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.data.user.username}`,
        });

        // Force page reload to update authentication state
        window.location.href = "/";
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = () => {
    // Create anonymous session
    const session: AnonymousSession = {
      isAnonymous: true,
      sessionId: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      limits: {
        hourlyLimit: 10,
      },
    };

    localStorage.setItem("x02_session", JSON.stringify(session));

    toast({
      title: "Anonymous Mode",
      description:
        "You can upload 10 images per hour. Register for higher limits!",
    });

    // Force page reload to update authentication state
    window.location.href = "/";
  };

  const [darkMode, setDarkMode] = useState(false);

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
        <div className="max-w-4xl mx-auto flex items-center gap-4 px-4">
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
          <Button
            size="sm"
            className={darkMode ? 'border border-green-400 text-green-300 bg-black hover:bg-green-900/20 transition-colors' : theme.buttonOutline}
            onClick={() => setDarkMode((d) => !d)}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <p className={`${theme.subtext} text-lg max-w-2xl mx-auto`}>
            Join our community to upload and share images with advanced features
            and higher limits.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Authentication Form */}
          <Card className={theme.card + " p-4 max-w-sm w-full flex flex-col items-center text-center shadow-md mx-auto"}>
            <CardHeader className="mb-2">
              <CardTitle className="flex flex-col items-center gap-2">
                <Shield className="h-8 w-8 text-teal-500 mb-1" />
                <span className="text-xl font-bold">Get Started</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList className="flex w-full bg-gray-100 rounded-lg overflow-hidden">
                  <TabsTrigger value="register" className="flex-1 py-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-500 data-[state=inactive]:bg-transparent transition-colors">Register</TabsTrigger>
                  <TabsTrigger value="login" className="flex-1 py-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-500 data-[state=inactive]:bg-transparent transition-colors">Login</TabsTrigger>
                </TabsList>
                <TabsContent value="register" className="mt-4 space-y-4">
                  <form onSubmit={handleRegister} className="space-y-3">
                    <FloatingInput
                      id="register-username"
                      name="username"
                      type="text"
                      label="Username"
                      icon={<User className="h-5 w-5" />}
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      minLength={3}
                      maxLength={20}
                      pattern="[a-zA-Z0-9_]+"
                      title="Username must be 3-20 characters and contain only letters, numbers, and underscores"
                    />
                    <div className="relative">
                      <FloatingInput
                        id="register-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        icon={showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                      />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 z-10" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    <Button type="submit" disabled={loading} className={`w-full ${theme.button} mt-2`}>
                      {loading ? <span>Creating Account...</span> : <><UserPlus className="h-4 w-4 mr-2" />Create Account</>}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="login" className="mt-4 space-y-4">
                  <form onSubmit={handleLogin} className="space-y-3">
                    <FloatingInput
                      id="login-username"
                      name="username"
                      type="text"
                      label="Username"
                      icon={<User className="h-5 w-5" />}
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="relative">
                      <FloatingInput
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        icon={showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 z-10" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button type="submit" disabled={loading} className={`w-full ${theme.button} mt-2`}>
                      {loading ? <span>Signing In...</span> : <><UserCheck className="h-4 w-4 mr-2" />Sign In</>}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              <div className="mt-6 pt-4 border-t border-gray-200 w-full">
                <Button onClick={handleAnonymous} className={`w-full ${darkMode ? 'border border-green-400 text-green-300 bg-black hover:bg-green-900/20 transition-colors' : theme.buttonOutline}`}>
                  <Users className="h-4 w-4 mr-2" />
                  Continue as Anonymous
                </Button>
                <p className="text-xs text-gray-500 mt-2">10 uploads per hour • Can upgrade anytime</p>
              </div>
            </CardContent>
          </Card>

          {/* Features Comparison */}
          <Card className={theme.card + " p-4 max-w-sm w-full flex flex-col items-center text-center shadow-md mx-auto"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6" />
                Account Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Upload className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-bold" style={{ color: darkMode ? '#90ffb0' : undefined }}>Higher Upload Limits</h4>
                    <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-black'}`}>Registered users get 100 uploads per day vs 10 per hour for anonymous</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-bold" style={{ color: darkMode ? '#90ffb0' : undefined }}>Personal Gallery</h4>
                    <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-black'}`}>Keep track of all your uploads in your personal dashboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-bold" style={{ color: darkMode ? '#90ffb0' : undefined }}>Secure Storage</h4>
                    <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-black'}`}>Your images are stored in your personal folder with API key protection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-bold" style={{ color: darkMode ? '#90ffb0' : undefined }}>Usage Analytics</h4>
                    <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-black'}`}>Monitor your usage, view statistics, and manage your uploads</p>
                  </div>
                </div>
              </div>
              {/* Comparison Table */}
              <div className={`${darkMode ? 'bg-zinc-900 border border-green-800' : 'bg-blue-50'} rounded p-4 mt-6 w-full`}>
                <h4 className={`font-semibold mb-3 text-center ${darkMode ? 'text-green-200' : 'text-gray-900'}`}>Account Comparison</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className={`${darkMode ? 'text-green-300' : 'text-gray-700'} font-medium`}>Anonymous:</div>
                  <div className={`text-right font-bold ${darkMode ? 'text-green-200' : 'text-gray-900'}`}>10 uploads/hour</div>
                  <div className={`${darkMode ? 'text-green-300' : 'text-gray-700'} font-medium`}>Registered:</div>
                  <div className={`text-right font-bold ${darkMode ? 'text-green-200' : 'text-blue-600'}`}>100 uploads/day</div>
                  <div className={`${darkMode ? 'text-green-300' : 'text-gray-700'} font-medium`}>Personal Gallery:</div>
                  <div className={`text-right font-bold ${darkMode ? 'text-green-200' : 'text-blue-600'}`}>✓</div>
                  <div className={`${darkMode ? 'text-green-300' : 'text-gray-700'} font-medium`}>API Access:</div>
                  <div className={`text-right font-bold ${darkMode ? 'text-green-200' : 'text-blue-600'}`}>✓</div>
                  <div className={`${darkMode ? 'text-green-300' : 'text-gray-700'} font-medium`}>Custom Watermark:</div>
                  <div className={`text-right font-bold ${darkMode ? 'text-green-200' : 'text-blue-600'}`}>✓</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer
        className={`text-center ${theme.subtext} text-sm mt-12 mb-4 relative z-10`}
        style={{ fontFamily: 'Poppins, Inter, sans-serif' }}
      >
        &copy; {new Date().getFullYear()} X02 Image Uploader
      </footer>
    </div>
  );
}
