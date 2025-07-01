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
import { Input } from "@/components/ui/input";
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

        navigate("/");
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

        navigate("/");
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

    navigate("/");
  };

  const [darkMode, setDarkMode] = useState(true);

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
        <div className="max-w-4xl mx-auto flex items-center gap-4 px-4">
          <img src={favicon} alt="logo" className="w-10 h-10 rounded-lg" />
          <div className="flex-1">
            <h1
              className={`text-2xl font-bold tracking-tight inline-block border-b-2 ${theme.accent} pb-1`}
            >
              X02 Image Uploader
            </h1>
          </div>
          <Button
            size="sm"
            className={`${theme.buttonOutline} border`}
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
          <Card
            className={`${theme.card} backdrop-blur-lg border-2 rounded-xl`}
            style={{
              border: "1.5px solid #fff2",
              boxShadow: "0 2px 24px #00ff8033",
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Get Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="register">Register</TabsTrigger>
                  <TabsTrigger value="login">Login</TabsTrigger>
                </TabsList>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        name="username"
                        type="text"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        minLength={3}
                        maxLength={20}
                        pattern="[a-zA-Z0-9_]+"
                        title="Username must be 3-20 characters and contain only letters, numbers, and underscores"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Choose a secure password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Minimum 6 characters
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className={`w-full ${theme.button} shadow-none hover:shadow-green-400/30 transition-shadow`}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </div>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input
                        id="login-username"
                        name="username"
                        type="text"
                        placeholder="Your username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className={`w-full ${theme.button} shadow-none hover:shadow-green-400/30 transition-shadow`}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing In...
                        </div>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Anonymous Option */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Don't want to register right now?
                  </p>
                  <Button
                    onClick={handleAnonymous}
                    className={`w-full ${theme.buttonOutline} border hover:shadow-green-400/20 transition-shadow`}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Continue as Anonymous
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    10 uploads per hour • Can upgrade anytime
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Comparison */}
          <Card
            className={`${theme.card} backdrop-blur-lg border-2 rounded-xl`}
            style={{
              border: "1.5px solid #fff2",
              boxShadow: "0 2px 24px #00ff8033",
            }}
          >
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
                    <h4 className="font-medium">Higher Upload Limits</h4>
                    <p className="text-sm text-muted-foreground">
                      Registered users get 100 uploads per day vs 10 per hour
                      for anonymous
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Personal Gallery</h4>
                    <p className="text-sm text-muted-foreground">
                      Keep track of all your uploads in your personal dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Secure Storage</h4>
                    <p className="text-sm text-muted-foreground">
                      Your images are stored in your personal folder with API
                      key protection
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Usage Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor your usage, view statistics, and manage your
                      uploads
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Account Comparison</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anonymous:</span>
                    <span>10 uploads/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registered:</span>
                    <span className="text-primary font-medium">
                      100 uploads/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Personal Gallery:
                    </span>
                    <span className="text-primary font-medium">✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Access:</span>
                    <span className="text-primary font-medium">✓</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer
        className={`text-center ${theme.subtext} text-sm mt-12 mb-4 relative z-10`}
      >
        &copy; {new Date().getFullYear()} X02 Image Uploader
      </footer>
    </div>
  );
}
