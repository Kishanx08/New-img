import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
} from '@/components/ui/chart';
import * as RechartsPrimitive from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

import { 
  Activity, 
  Search, 
  Users, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Network, 
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileText,
  Settings,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Zap,
  Eye,
  Bell,
  Shield,
  MessageSquare,
  Key
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'upload' | 'user' | 'error' | 'system';
  message: string;
  timestamp: string;
  user?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    upload: number;
    download: number;
  };
  activeConnections: number;
  uptime: string;
}

interface SearchResult {
  type: 'user' | 'file' | 'log' | 'setting';
  title: string;
  description: string;
  action: () => void;
}

interface User {
  id: string;
  username: string;
  apiKey: string;
  status: 'active' | 'suspended';
  dailyLimit: number;
  hourlyLimit: number;
  uploads: number;
}

export default function Admin() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: { upload: 0, download: 0 },
    activeConnections: 0,
    uptime: '0h 0m'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'resetApi' | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [subdomainMode, setSubdomainMode] = useState<'enabled' | 'disabled'>('enabled');
  const [subdomainUserOverrides, setSubdomainUserOverrides] = useState<{[id: string]: boolean}>({});
  const [subdomainLoading, setSubdomainLoading] = useState(false);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const { toast } = useToast();
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  // Fetch real user data for Users tab
  useEffect(() => {
    if (tab !== 'users') return;
    setUsersLoading(true);
    setUsersError(null);
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
        } else {
          setUsersError(data.error || 'Failed to load users');
        }
      })
      .catch(err => setUsersError(err.message))
      .finally(() => setUsersLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== 'insights') return;
    setInsightsLoading(true);
    setInsightsError(null);
    fetch('/api/admin/insights')
      .then(res => res.json())
      .then(data => {
        if (data.success) setInsights(data);
        else setInsightsError(data.error || 'Failed to load insights');
      })
      .catch(err => setInsightsError(err.message))
      .finally(() => setInsightsLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== 'alerts') return;
    setAlertsLoading(true);
    setAlertsError(null);
    fetch('/api/admin/alerts')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAlerts(data.alerts);
        else setAlertsError(data.error || 'Failed to load alerts');
      })
      .catch(err => setAlertsError(err.message))
      .finally(() => setAlertsLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== 'analytics') return;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnalytics(data.analytics);
        else setAnalyticsError(data.error || 'Failed to load analytics');
      })
      .catch(err => setAnalyticsError(err.message))
      .finally(() => setAnalyticsLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== 'performance') return;
    setPerformanceLoading(true);
    setPerformanceError(null);
    fetch('/api/admin/performance')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPerformance(data.performance);
        else setPerformanceError(data.error || 'Failed to load performance data');
      })
      .catch(err => setPerformanceError(err.message))
      .finally(() => setPerformanceLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== 'overview') return;
    setOverviewLoading(true);
    setOverviewError(null);
    fetch('/api/admin/overview')
      .then(res => res.json())
      .then(data => {
        if (data.success) setOverview(data.overview);
        else setOverviewError(data.error || 'Failed to load overview');
      })
      .catch(err => setOverviewError(err.message))
      .finally(() => setOverviewLoading(false));
  }, [tab]);

  useEffect(() => {
    // Fetch subdomain settings on mount
    const fetchSubdomainSettings = async () => {
      setSubdomainLoading(true);
      setSubdomainError(null);
      try {
        const res = await fetch('/api/admin/subdomain-settings', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch subdomain settings');
        const data = await res.json();
        setSubdomainUserOverrides(data);
      } catch (err: any) {
        setSubdomainError(err.message || 'Unknown error');
      } finally {
        setSubdomainLoading(false);
      }
    };
    fetchSubdomainSettings();
  }, []);

  // Fetch users when settings modal is opened
  useEffect(() => {
    if (!settingsOpen) return;
    if (users.length > 0) return; // Don't refetch if already loaded
    setUsersLoading(true);
    setUsersError(null);
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
        } else {
          setUsersError(data.error || 'Failed to load users');
        }
      })
      .catch(err => setUsersError(err.message))
      .finally(() => setUsersLoading(false));
  }, [settingsOpen]);

  // Fetch global subdomain mode when settings modal opens
  useEffect(() => {
    if (!settingsOpen) return;
    fetch('/api/admin/subdomain-settings/mode', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.mode) setSubdomainMode(data.mode);
      });
  }, [settingsOpen]);

  const handleSubdomainToggle = async (username: string, enabled: boolean) => {
    setSubdomainLoading(true);
    setSubdomainError(null);
    try {
      const res = await fetch('/api/admin/subdomain-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, enabled })
      });
      if (!res.ok) throw new Error('Failed to update subdomain setting');
      setSubdomainUserOverrides(o => ({ ...o, [username]: enabled }));
    } catch (err: any) {
      setSubdomainError(err.message || 'Unknown error');
    } finally {
      setSubdomainLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock search results
    const results: SearchResult[] = [
      {
        type: 'user',
        title: 'kishan',
        description: 'User • API Key: f0e8a5eabfb94abc8fe18efe46e40abf',
        action: () => console.log('View user: kishan')
      },
      {
        type: 'file',
        title: 'screenshot.png',
        description: 'File • 2.3MB • Uploaded by kishan',
        action: () => console.log('View file: screenshot.png')
      },
      {
        type: 'log',
        title: 'Rate limit exceeded',
        description: 'Error • 2 minutes ago • User: spammer',
        action: () => console.log('View log entry')
      }
    ];

    setSearchResults(results.filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase())
    ));
    setIsSearching(false);
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'upload': return <Upload className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: ActivityItem['severity']) => {
    switch (severity) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'bg-green-500 text-black';
      case 'warning': return 'bg-yellow-400 text-black';
      case 'error': return 'bg-red-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  // User action handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setModalType('view');
  };
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalType('edit');
  };
  const handleSuspendUser = async (user: User) => {
    setApiLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: user.status === 'active' ? 'suspended' : 'active' })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: `User ${user.status === 'active' ? 'suspended' : 'activated'} successfully` });
        // Refresh users
        setTab('users');
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
    }
    setApiLoading(false);
  };
  const handleResetApi = async (user: User) => {
    setApiLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-api`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setNewApiKey(data.apiKey);
        setModalType('resetApi');
        toast({ title: 'API Key Reset', description: 'New API key generated.' });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to reset API key', variant: 'destructive' });
    }
    setApiLoading(false);
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setApiLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get('username');
    const dailyLimit = formData.get('dailyLimit');
    const hourlyLimit = formData.get('hourlyLimit');
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, dailyLimit: Number(dailyLimit), hourlyLimit: Number(hourlyLimit) })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'User updated successfully' });
        setModalType(null);
        setSelectedUser(null);
        setTab('users');
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    }
    setApiLoading(false);
  };

  // Request OTP from Discord
  const requestOTP = async () => {
    setIsRequestingOTP(true);
    try {
      const response = await fetch('/api/admin/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.sessionId);
        setOtpExpiry(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes
        toast({
          title: "OTP Sent!",
          description: "Check your Discord DM for the admin access code.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send OTP",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request OTP",
        variant: "destructive"
      });
    } finally {
      setIsRequestingOTP(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!sessionId || !otpCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the OTP code",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const response = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          otp: otpCode.trim()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAdminToken(data.adminToken);
        setIsAuthenticated(true);
        localStorage.setItem('admin_token', data.adminToken);
        toast({
          title: "Access Granted!",
          description: "Welcome to the admin panel.",
        });
      } else {
        toast({
          title: "Access Denied",
          description: data.error || "Invalid OTP",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Check for existing admin session
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAdminToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setAdminToken(null);
    setSessionId(null);
    setOtpCode('');
    setOtpExpiry(null);
    localStorage.removeItem('admin_token');
    toast({
      title: "Logged Out",
      description: "Admin session ended.",
    });
  };

  // Format countdown timer
  const formatCountdown = () => {
    if (!otpExpiry) return '';
    const now = new Date();
    const diff = otpExpiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Update countdown every second
  useEffect(() => {
    if (!otpExpiry) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      if (now >= otpExpiry) {
        setOtpExpiry(null);
        setSessionId(null);
        toast({
          title: "OTP Expired",
          description: "Please request a new code.",
          variant: "destructive"
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiry, toast]);

  // Make System Health live
  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        const res = await fetch('/api/admin/performance');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.performance) {
            setSystemHealth(data.performance);
          }
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  // Make Activity Feed live
  useEffect(() => {
    const fetchActivityFeed = async () => {
      try {
        const res = await fetch('/api/admin/overview');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.overview && data.overview.activityFeed) {
            setActivityFeed(data.overview.activityFeed);
          }
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchActivityFeed();
    const interval = setInterval(fetchActivityFeed, 3000);
    return () => clearInterval(interval);
  }, []);

  // Admin Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0e101e] text-gray-200 flex items-center justify-center">
        <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-[#00E6E6]/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-[#00E6E6]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#00E6E6]">Admin Access</CardTitle>
            <p className="text-gray-400">Discord OTP Authentication Required</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {!sessionId ? (
              <div className="space-y-4">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-[#00E6E6] mx-auto mb-2" />
                  <p className="text-gray-300 mb-4">
                    Click the button below to receive an admin access code via Discord DM.
                  </p>
                </div>
                <Button 
                  onClick={requestOTP} 
                  disabled={isRequestingOTP}
                  className="w-full bg-[#00E6E6] text-black hover:bg-[#00E6E6]/80"
                >
                  {isRequestingOTP ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Discord OTP
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <Key className="w-12 h-12 text-[#00E6E6] mx-auto mb-2" />
                  <p className="text-gray-300 mb-2">
                    Enter the 6-digit code sent to your Discord DM.
                  </p>
                  {otpExpiry && (
                    <div className="text-sm text-red-400 mb-4">
                      ⏰ Expires in: {formatCountdown()}
                    </div>
                  )}
                </div>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl font-mono tracking-widest bg-[#181A1B] border-[#333] focus:border-[#00E6E6]"
                  maxLength={6}
                />
                <Button 
                  onClick={verifyOTP} 
                  disabled={isVerifyingOTP || !otpCode.trim() || otpCode.length !== 6}
                  className="w-full bg-[#00E6E6] text-black hover:bg-[#00E6E6]/80"
                >
                  {isVerifyingOTP ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Access Admin Panel
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => {
                    setSessionId(null);
                    setOtpCode('');
                    setOtpExpiry(null);
                  }}
                  variant="outline"
                  className="w-full border-[#333] text-gray-400 hover:bg-[#181A1B]"
                >
                  Request New Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Save handler for settings modal
  const handleSettingsSave = async () => {
    // Save global subdomain mode
    try {
      await fetch('/api/admin/subdomain-settings/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mode: subdomainMode })
      });
      toast({ title: 'Settings saved', description: 'Your changes have been saved.' });
      setSettingsOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0e101e] text-gray-200 flex">
      {/* Sidebar Navigation */}
      <aside className="w-20 bg-[#0e101e] border-r border-[#222] flex flex-col py-4 px-0 fixed h-full z-10">
        <h1 className="text-2xl font-bold text-white mb-8"></h1>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setTab('overview')} title="Overview" className={`flex items-center justify-center py-3 rounded-lg transition-colors ${tab === 'overview' ? 'bg-white text-black font-bold' : 'hover:bg-[#181A1B] text-[#00E6E6]'}`}>
            <BarChart3 className="w-6 h-6" />
          </button>
          <button onClick={() => setTab('users')} title="Users" className={`flex items-center justify-center py-3 rounded-lg transition-colors ${tab === 'users' ? 'bg-white text-black font-bold' : 'hover:bg-[#181A1B] text-[#00E6E6]'}`}>
            <Users className="w-6 h-6" />
          </button>
          <button onClick={() => setTab('insights')} title="User Insights" className={`flex items-center justify-center py-3 rounded-lg transition-colors ${tab === 'insights' ? 'bg-white text-black font-bold' : 'hover:bg-[#181A1B] text-[#00E6E6]'}`}>
            <TrendingUp className="w-6 h-6" />
          </button>
          <button onClick={() => setTab('alerts')} title="Smart Alerts" className={`flex items-center justify-center py-3 rounded-lg transition-colors ${tab === 'alerts' ? 'bg-white text-black font-bold' : 'hover:bg-[#181A1B] text-[#00E6E6]'}`}>
            <Bell className="w-6 h-6" />
          </button>
          <button onClick={() => setTab('analytics')} title="Visual Analytics" className={`flex items-center justify-center py-3 rounded-lg transition-colors ${tab === 'analytics' ? 'bg-white text-black font-bold' : 'hover:bg-[#181A1B] text-[#00E6E6]'}`}>
            <BarChart3 className="w-6 h-6" />
          </button>
          <button onClick={() => setTab('performance')} title="Performance Analytics" className={`flex items-center justify-center py-3 rounded-lg transition-colors ${tab === 'performance' ? 'bg-white text-black font-bold' : 'hover:bg-[#181A1B] text-[#00E6E6]'}`}>
            <Cpu className="w-6 h-6" />
          </button>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#00E6E6]">{tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}</h1>
              <p className="text-gray-400">Real-time monitoring and management</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-[#00E6E6] text-[#00E6E6] hover:bg-[#23272A]">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" className="bg-[#23272A] border border-[#00E6E6] text-[#00E6E6] hover:bg-[#23272A]/80" onClick={() => setSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                onClick={logout}
                size="sm" 
                variant="outline"
                className="border-red-400 text-red-400 hover:bg-red-900/20"
              >
                <Shield className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          {/* Tabs Content */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsContent value="overview">
              <div className="flex flex-col gap-6">
                {/* Global Search */}
                <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#60000]">
                      <Search className="w-5 h-5" />
                      Global Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Input
                        placeholder="Search users, files, logs, settings..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleSearch(e.target.value);
                        }}
                        className="pr-10 bg-[#181A1B] text-gray-200 border border-[#333] focus:border-[#00E6E6]"
                      />
                      {isSearching && (
                        <RefreshCw className="absolute right-3 top-3 w-4 h-4 animate-spin text-[#00E6E6]" />
                      )}
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {searchResults.map((result, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border border-[#222] rounded-lg hover:bg-[#23272A]/80 cursor-pointer"
                            onClick={result.action}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-[#181A1B] flex items-center justify-center border border-[#333]">
                                {result.type === 'user' && <User className="w-4 h-4 text-[#00E6E6]" />}
                                {result.type === 'file' && <FileText className="w-4 h-4 text-blue-400" />}
                                {result.type === 'log' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                                {result.type === 'setting' && <Settings className="w-4 h-4 text-gray-400" />}
                              </div>
                              <div>
                                <div className="font-medium text-[#00E6E6]">{result.title}</div>
                                <div className="text-sm text-gray-400">{result.description}</div>
                              </div>
                            </div>
                            <Eye className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Real-Time Activity Feed */}
                  <div className="lg:col-span-2">
                    <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#00E6E6]">
                          <Activity className="w-5 h-5" />
                          Real-Time Activity Feed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {activityFeed.map(item => (
                            <div key={item.id} className="flex items-center gap-2 mb-2">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${item.severity === 'error' ? 'bg-red-500' : item.severity === 'warning' ? 'bg-yellow-400' : item.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                              <span className="font-medium">{item.type}</span>
                              <span className="text-xs text-gray-500">{item.timestamp}</span>
                              <span className="ml-2">{item.message}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* System Health Monitor */}
                  <div>
                    <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#00E6E6]">
                          <Zap className="w-5 h-5" />
                          System Health
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* CPU Usage */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Cpu className="w-4 h-4 text-[#00E6E6]" />
                              <span className="text-sm font-medium text-gray-200">CPU</span>
                            </div>
                            <span className="text-sm text-[#00E6E6]">{overview?.systemHealth.cpu.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-[#181A1B] rounded-full h-2">
                            <div 
                              className="bg-[#00E6E6] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${overview?.systemHealth.cpu}%` }}
                            />
                          </div>
                        </div>

                        {/* Memory Usage */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MemoryStick className="w-4 h-4 text-[#00E6E6]" />
                              <span className="text-sm font-medium text-gray-200">Memory</span>
                            </div>
                            <span className="text-sm text-[#00E6E6]">{overview?.systemHealth.memory.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-[#181A1B] rounded-full h-2">
                            <div 
                              className="bg-[#00E6E6] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${overview?.systemHealth.memory}%` }}
                            />
                          </div>
                        </div>

                        {/* Disk Usage */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <HardDrive className="w-4 h-4 text-[#00E6E6]" />
                              <span className="text-sm font-medium text-gray-200">Disk</span>
                            </div>
                            <span className="text-sm text-[#00E6E6]">{overview?.systemHealth.disk.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-[#181A1B] rounded-full h-2">
                            <div 
                              className="bg-[#00E6E6] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${overview?.systemHealth.disk}%` }}
                            />
                          </div>
                        </div>

                        {/* Active Connections */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#222]">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-[#00E6E6]" />
                            <span className="text-sm font-medium text-gray-200">Active Connections</span>
                          </div>
                          <span className="text-sm font-bold text-[#00E6E6]">{overview?.systemHealth.activeConnections}</span>
                        </div>

                        {/* Uptime */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-[#00E6E6]" />
                            <span className="text-sm font-medium text-gray-200">Uptime</span>
                          </div>
                          <span className="text-sm text-[#00E6E6]">{overview?.systemHealth.uptime}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {overviewLoading ? (
                    <div className="col-span-4 text-center py-8 text-[#00E6E6] animate-pulse">Loading overview...</div>
                  ) : overviewError ? (
                    <div className="col-span-4 text-center py-8 text-red-400">{overviewError}</div>
                  ) : overview ? (
                    <>
                      <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-[#00E6E6]" />
                            <div>
                              <p className="text-sm font-medium text-gray-400">Total Users</p>
                              <p className="text-2xl font-bold text-[#00E6E6]">{overview.userCount}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <Upload className="w-5 h-5 text-[#00E6E6]" />
                            <div>
                              <p className="text-sm font-medium text-gray-400">Total Uploads</p>
                              <p className="text-2xl font-bold text-[#00E6E6]">{overview.uploadCount}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <HardDrive className="w-5 h-5 text-[#00E6E6]" />
                            <div>
                              <p className="text-sm font-medium text-gray-400">Storage Used</p>
                              <p className="text-2xl font-bold text-[#00E6E6]">{(overview.storageUsed / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-[#00E6E6]" />
                            <div>
                              <p className="text-sm font-medium text-gray-400">Today's Uploads</p>
                              <p className="text-2xl font-bold text-[#00E6E6]">{overview.todaysUploads}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <div className="col-span-4 text-gray-400">No overview data available.</div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                <CardHeader>
                  <CardTitle className="text-[#00E6E6]">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="text-center py-8 text-[#00E6E6] animate-pulse">Loading users...</div>
                  ) : usersError ? (
                    <div className="text-center py-8 text-red-400">{usersError}</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[#00E6E6]">Username</TableHead>
                          <TableHead className="text-[#00E6E6]">API Key</TableHead>
                          <TableHead className="text-[#00E6E6]">Status</TableHead>
                          <TableHead className="text-[#00E6E6]">Daily Limit</TableHead>
                          <TableHead className="text-[#00E6E6]">Hourly Limit</TableHead>
                          <TableHead className="text-[#00E6E6]">Uploads</TableHead>
                          <TableHead className="text-[#00E6E6]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="hover:bg-[#181A1B]">
                            <TableCell className="font-medium text-[#00E6E6]">{user.username}</TableCell>
                            <TableCell className="text-xs text-gray-400">{user.apiKey}</TableCell>
                            <TableCell>
                              <span className={user.status === 'active' ? 'text-green-400' : 'text-red-400'}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>{user.dailyLimit}</TableCell>
                            <TableCell>{user.hourlyLimit}</TableCell>
                            <TableCell>{user.uploads}</TableCell>
                            <TableCell>
                              <Button onClick={() => handleViewUser(user)} size="sm" className="bg-[#00E6E6] text-black mr-2">View</Button>
                              <Button onClick={() => handleEditUser(user)} size="sm" variant="outline" className="border-[#00E6E6] text-[#00E6E6] mr-2">Edit</Button>
                              <Button onClick={() => handleSuspendUser(user)} size="sm" variant="outline" className="border-red-400 text-red-400 mr-2" disabled={apiLoading}>Suspend/Activate</Button>
                              <Button onClick={() => handleResetApi(user)} size="sm" variant="outline" className="border-yellow-400 text-yellow-400" disabled={apiLoading}>Reset API</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#00E6E6]">
                    <TrendingUp className="w-5 h-5" />
                    User Behavior Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insightsLoading ? (
                    <div className="text-center py-8 text-[#00E6E6] animate-pulse">Loading insights...</div>
                  ) : insightsError ? (
                    <div className="text-center py-8 text-red-400">{insightsError}</div>
                  ) : insights ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">Most Active Uploaders</h3>
                        <ul className="space-y-1">
                          {insights.mostActive.map((u: any, i: number) => (
                            <li key={i} className="flex justify-between border-b border-[#222] py-1">
                              <span className="text-[#00E6E6]">{u.username}</span>
                              <span className="text-gray-400">{u.uploads} uploads</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">Biggest Files</h3>
                        <ul className="space-y-1">
                          {insights.biggestFiles.map((f: any, i: number) => (
                            <li key={i} className="flex justify-between border-b border-[#222] py-1">
                              <span className="text-[#00E6E6]">{f.username}</span>
                              <span className="text-gray-400">{f.filename} ({(f.size/1024/1024).toFixed(2)} MB)</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">Most Rate-Limited Users</h3>
                        <ul className="space-y-1">
                          {insights.mostRateLimited.map((u: any, i: number) => (
                            <li key={i} className="flex justify-between border-b border-[#222] py-1">
                              <span className="text-[#00E6E6]">{u.username}</span>
                              <span className="text-gray-400">{u.hits} hits</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">Watermark Usage</h3>
                        <ul className="space-y-1">
                          {insights.watermarkUsage.map((u: any, i: number) => (
                            <li key={i} className="flex justify-between border-b border-[#222] py-1">
                              <span className="text-[#00E6E6]">{u.username}</span>
                              <span className={u.used ? 'text-green-400' : 'text-red-400'}>{u.used ? 'Used' : 'Not used'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">Shortlink Creation</h3>
                        <ul className="space-y-1">
                          {insights.shortlinkCounts.map((u: any, i: number) => (
                            <li key={i} className="flex justify-between border-b border-[#222] py-1">
                              <span className="text-[#00E6E6]">{u.username}</span>
                              <span className="text-gray-400">{u.count} shortlinks</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">No insights available.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts">
              <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#00E6E6]">
                    <Bell className="w-5 h-5" />
                    Smart Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {alertsLoading ? (
                    <div className="text-center py-8 text-[#00E6E6] animate-pulse">Loading alerts...</div>
                  ) : alertsError ? (
                    <div className="text-center py-8 text-red-400">{alertsError}</div>
                  ) : alerts.length > 0 ? (
                    <ul className="space-y-3">
                      {alerts.map((alert, i) => (
                        <li key={alert.id || i} className="flex items-center justify-between border-b border-[#222] py-2">
                          <div>
                            <span className={`px-2 py-1 rounded text-xs font-bold mr-2 ${getAlertColor(alert.severity)}`}>{alert.severity.toUpperCase()}</span>
                            <span className="text-[#00E6E6] font-medium">{alert.message}</span>
                            {alert.user && <span className="ml-2 text-gray-400">({alert.user})</span>}
                          </div>
                          <span className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-400">No alerts.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#00E6E6]">
                    <BarChart3 className="w-5 h-5" />
                    Visual Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="text-center py-8 text-[#00E6E6] animate-pulse">Loading analytics...</div>
                  ) : analyticsError ? (
                    <div className="text-center py-8 text-red-400">{analyticsError}</div>
                  ) : analytics ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">Upload Volume</h3>
                        <ChartContainer config={{ upload: { color: '#00E6E6', label: 'Uploads' } }}>
                          <RechartsPrimitive.LineChart data={analytics.uploadVolume}>
                            <RechartsPrimitive.XAxis dataKey="date" stroke="#00E6E6" />
                            <RechartsPrimitive.YAxis stroke="#00E6E6" />
                            <RechartsPrimitive.Line type="monotone" dataKey="count" stroke="#00E6E6" strokeWidth={2} />
                            <ChartTooltip />
                            <ChartLegend />
                          </RechartsPrimitive.LineChart>
                        </ChartContainer>
                      </div>
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">File Type Distribution</h3>
                        <ChartContainer config={{ file: { color: '#00E6E6', label: 'Files' } }}>
                          <RechartsPrimitive.BarChart data={analytics.fileTypeDistribution}>
                            <RechartsPrimitive.XAxis dataKey="type" stroke="#00E6E6" />
                            <RechartsPrimitive.YAxis stroke="#00E6E6" />
                            <RechartsPrimitive.Bar dataKey="count" fill="#00E6E6" />
                            <ChartTooltip />
                            <ChartLegend />
                          </RechartsPrimitive.BarChart>
                        </ChartContainer>
                      </div>
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">User Activity</h3>
                        <ChartContainer config={{ user: { color: '#00E6E6', label: 'Activity' } }}>
                          <RechartsPrimitive.BarChart data={analytics.userActivity}>
                            <RechartsPrimitive.XAxis dataKey="username" stroke="#00E6E6" />
                            <RechartsPrimitive.YAxis stroke="#00E6E6" />
                            <RechartsPrimitive.Bar dataKey="count" fill="#00E6E6" />
                            <ChartTooltip />
                            <ChartLegend />
                          </RechartsPrimitive.BarChart>
                        </ChartContainer>
                      </div>
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">Storage Trends</h3>
                        <ChartContainer config={{ storage: { color: '#00E6E6', label: 'Storage (MB)' } }}>
                          <RechartsPrimitive.LineChart data={analytics.storageTrends}>
                            <RechartsPrimitive.XAxis dataKey="date" stroke="#00E6E6" />
                            <RechartsPrimitive.YAxis stroke="#00E6E6" />
                            <RechartsPrimitive.Line type="monotone" dataKey="size" stroke="#00E6E6" strokeWidth={2} />
                            <ChartTooltip />
                            <ChartLegend />
                          </RechartsPrimitive.LineChart>
                        </ChartContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">No analytics data available.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card className="glass-card border border-[#00E6E6]/20 rounded-2xl backdrop-blur-md shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#00E6E6]">
                    <Cpu className="w-5 h-5" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {performanceLoading ? (
                    <div className="text-center py-8 text-[#00E6E6] animate-pulse">Loading performance data...</div>
                  ) : performanceError ? (
                    <div className="text-center py-8 text-red-400">{performanceError}</div>
                  ) : performance ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">Upload Speed (MB/s)</h3>
                        <ChartContainer config={{ speed: { color: '#00E6E6', label: 'Speed' } }}>
                          <RechartsPrimitive.LineChart data={performance.uploadSpeed}>
                            <RechartsPrimitive.XAxis dataKey="date" stroke="#00E6E6" />
                            <RechartsPrimitive.YAxis stroke="#00E6E6" />
                            <RechartsPrimitive.Line type="monotone" dataKey="speed" stroke="#00E6E6" strokeWidth={2} />
                            <ChartTooltip />
                            <ChartLegend />
                          </RechartsPrimitive.LineChart>
                        </ChartContainer>
                      </div>
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">Watermark Processing (ms)</h3>
                        <ChartContainer config={{ watermark: { color: '#00E6E6', label: 'Processing Time' } }}>
                          <RechartsPrimitive.LineChart data={performance.watermarkProcessing}>
                            <RechartsPrimitive.XAxis dataKey="date" stroke="#00E6E6" />
                            <RechartsPrimitive.YAxis stroke="#00E6E6" />
                            <RechartsPrimitive.Line type="monotone" dataKey="ms" stroke="#00E6E6" strokeWidth={2} />
                            <ChartTooltip />
                            <ChartLegend />
                          </RechartsPrimitive.LineChart>
                        </ChartContainer>
                      </div>
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">Error Rates</h3>
                        <ChartContainer config={{ error: { color: '#00E6E6', label: 'Error Rate' } }}>
                          <RechartsPrimitive.LineChart data={performance.errorRates}>
                            <RechartsPrimitive.XAxis dataKey="date" stroke="#00E6E6" />
                            <RechartsPrimitive.YAxis stroke="#00E6E6" />
                            <RechartsPrimitive.Line type="monotone" dataKey="rate" stroke="#00E6E6" strokeWidth={2} />
                            <ChartTooltip />
                            <ChartLegend />
                          </RechartsPrimitive.LineChart>
                        </ChartContainer>
                      </div>
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">API Response Times (ms)</h3>
                        <ChartContainer config={{ api: { color: '#00E6E6', label: 'API Response' } }}>
                          <RechartsPrimitive.LineChart data={performance.apiResponseTimes}>
                            <RechartsPrimitive.XAxis dataKey="date" stroke="#00E6E6" />
                            <RechartsPrimitive.YAxis stroke="#00E6E6" />
                            <RechartsPrimitive.Line type="monotone" dataKey="ms" stroke="#00E6E6" strokeWidth={2} />
                            <ChartTooltip />
                            <ChartLegend />
                          </RechartsPrimitive.LineChart>
                        </ChartContainer>
                      </div>
                      <div>
                        <h3 className="text-[#00E6E6] text-lg mb-2">Bandwidth Usage (MB)</h3>
                        <ChartContainer config={{ bandwidth: { color: '#00E6E6', label: 'Bandwidth' } }}>
                          <RechartsPrimitive.BarChart data={performance.bandwidthUsage}>
                            <RechartsPrimitive.XAxis dataKey="date" stroke="#00E6E6" />
                            <RechartsPrimitive.YAxis stroke="#00E6E6" />
                            <RechartsPrimitive.Bar dataKey="mb" fill="#00E6E6" />
                            <ChartTooltip />
                            <ChartLegend />
                          </RechartsPrimitive.BarChart>
                        </ChartContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">No performance data available.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* User View Modal */}
      <Dialog open={modalType === 'view'} onOpenChange={() => { setModalType(null); setSelectedUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-2">
              <div><b>Username:</b> {selectedUser.username}</div>
              <div><b>API Key:</b> {selectedUser.apiKey}</div>
              <div><b>Status:</b> {selectedUser.status}</div>
              <div><b>Daily Limit:</b> {selectedUser.dailyLimit}</div>
              <div><b>Hourly Limit:</b> {selectedUser.hourlyLimit}</div>
              <div><b>Uploads:</b> {selectedUser.uploads}</div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => { setModalType(null); setSelectedUser(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Edit Modal */}
      <Dialog open={modalType === 'edit'} onOpenChange={() => { setModalType(null); setSelectedUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Username</label>
                <Input name="username" defaultValue={selectedUser.username} required />
              </div>
              <div>
                <label className="block mb-1">Daily Limit</label>
                <Input name="dailyLimit" type="number" defaultValue={selectedUser.dailyLimit} required />
              </div>
              <div>
                <label className="block mb-1">Hourly Limit</label>
                <Input name="hourlyLimit" type="number" defaultValue={selectedUser.hourlyLimit} required />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setModalType(null); setSelectedUser(null); }}>Cancel</Button>
                <Button type="submit" disabled={apiLoading}>{apiLoading ? 'Saving...' : 'Save'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset API Modal */}
      <Dialog open={modalType === 'resetApi'} onOpenChange={() => { setModalType(null); setNewApiKey(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New API Key</DialogTitle>
          </DialogHeader>
          {newApiKey && (
            <div className="space-y-2">
              <div><b>API Key:</b> <span className="font-mono text-cyan-400">{newApiKey}</span></div>
              <div className="text-sm text-gray-400">Copy and save this key. It will not be shown again.</div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => { setModalType(null); setNewApiKey(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Subdomain mode radio buttons (remove per-user) */}
            <label className="block font-semibold mb-2">Subdomain Feature</label>
            <div className="flex gap-4 mb-4">
              <label className="inline-flex items-center">
                <input type="radio" name="subdomainMode" value="enabled" checked={subdomainMode === 'enabled'} onChange={() => setSubdomainMode('enabled')} className="form-radio text-green-600 focus:ring-green-500" />
                <span className="ml-2">Enabled (All users get subdomain)</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" name="subdomainMode" value="disabled" checked={subdomainMode === 'disabled'} onChange={() => setSubdomainMode('disabled')} className="form-radio text-red-600 focus:ring-red-500" />
                <span className="ml-2">Disabled (Only whitelisted users)</span>
              </label>
            </div>

            {/* Whitelist UI, only show when disabled */}
            {subdomainMode === 'disabled' && (
              <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
                <label className="block font-semibold mb-2 text-green-700 dark:text-green-300">User Subdomain Whitelist</label>
                <p className="text-xs text-gray-500 dark:text-green-200 mb-4">Select users who should have subdomain access even when globally disabled.</p>
                {subdomainLoading && <span>Loading...</span>}
                {subdomainError && <span className="text-red-500">{subdomainError}</span>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center bg-zinc-50 dark:bg-zinc-800 rounded px-3 py-2 border border-zinc-100 dark:border-zinc-700">
                      <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-100">{user.username}</span>
                      <input
                        type="checkbox"
                        checked={!!subdomainUserOverrides[user.id]}
                        onChange={e => handleSubdomainToggle(user.id, e.target.checked)}
                        className="form-checkbox h-5 w-5 text-green-600 focus:ring-green-500 ml-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
            <Button className="bg-[#00E6E6] text-black hover:bg-[#00E6E6]/80" onClick={handleSettingsSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 