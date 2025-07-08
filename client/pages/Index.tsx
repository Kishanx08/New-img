import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Image,
  Copy,
  Download,
  FileImage,
  Grid3X3,
  Sparkles,
  Zap,
  Eye,
  Cpu,
  Wifi,
  Shield,
  Activity,
  Key,
  Settings,
  Trash2,
  UserPlus,
  User,
  ArrowUpCircle,
  BarChart2,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { UploadResponse, DeleteImageResponse } from "@shared/api";
import { UserSession, AnonymousSession } from "@shared/auth-types";
import favicon from "/favicon.ico";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { useNavigate } from "react-router-dom";

interface UploadedImage {
  id: string;
  url: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  apiKeyUsed?: boolean;
}

export default function Index() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userSession, setUserSession] = useState<
    UserSession | AnonymousSession | null
  >(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const [loadingUploads, setLoadingUploads] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Load user session
    const sessionData = localStorage.getItem("x02_session");
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        setUserSession(session);
        // Load existing uploads if user is authenticated
        if (!session.isAnonymous && session.apiKey) {
          loadUserUploads(session.apiKey);
        }
      } catch (error) {
        console.error("Failed to parse session:", error);
        localStorage.removeItem("x02_session");
        navigate("/auth");
      }
    } else {
      navigate("/auth");
    }

    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [navigate]);

  const loadUserUploads = async (apiKey: string) => {
    setLoadingUploads(true);
    try {
      const response = await fetch("/api/user/dashboard", {
        headers: {
          "x-api-key": apiKey,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.uploads) {
          const formattedUploads = data.data.uploads.map((upload: any) => ({
            id: `${upload.filename}_${Date.now()}`,
            url: upload.url,
            originalName: upload.filename,
            size: upload.size,
            uploadedAt: upload.timestamp,
            apiKeyUsed: true,
          }));
          setUploadedImages(formattedUploads);
        }
      }
    } catch (error) {
      console.error("Failed to load user uploads:", error);
    } finally {
      setLoadingUploads(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 2500);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Use XMLHttpRequest for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");

        // Add API key for registered users
        if (userSession && !userSession.isAnonymous) {
          xhr.setRequestHeader(
            "x-api-key",
            (userSession as UserSession).apiKey,
          );
        }
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          setUploadProgress(null);
          setUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            const url = xhr.responseText;
            const newImage: UploadedImage = {
              id: file.name,
              url,
              originalName: file.name,
              size: file.size,
              uploadedAt: new Date().toISOString(),
              apiKeyUsed:
                userSession && !userSession.isAnonymous ? true : undefined,
            };
            setUploadedImages((prev) => [newImage, ...prev]);
            setShowGallery(true);
            showToast("⚡ Upload successful!", "success");
            resolve();
          } else {
            showToast(xhr.responseText || "Upload failed", "error");
            reject(new Error(xhr.responseText || "Upload failed"));
          }
        };
        xhr.onerror = () => {
          setUploadProgress(null);
          setUploading(false);
          showToast("Upload failed", "error");
          reject(new Error("Upload failed"));
        };
        xhr.send(formData);
      });
    } catch (error) {
      setUploadProgress(null);
      setUploading(false);
      showToast(
        error instanceof Error ? error.message : "Please try again",
        "error",
      );
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const copyToClipboard = async (url: string) => {
    // If url starts with http, use as is. Otherwise, prepend window.location.origin
    const fullUrl = url.startsWith("http")
      ? url
      : `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      showToast("Link copied!", "success");
    } catch (error) {
      showToast("Copy failed", "error");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const deleteImage = async (imageUrl: string, imageId: string) => {
    try {
      // Extract filename from URL
      const filename = imageUrl.split("/").pop();
      if (!filename) {
        showToast("Cannot delete image: invalid URL", "error");
        return;
      }

      const headers: Record<string, string> = {};

      // Add API key for registered users
      if (userSession && !userSession.isAnonymous) {
        headers["x-api-key"] = (userSession as UserSession).apiKey;
      }

      const response = await fetch(`/i/${filename}`, {
        method: "DELETE",
        headers,
      });

      const result: DeleteImageResponse = await response.json();

      if (result.success) {
        // Remove from uploaded images list
        setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
        showToast("Image deleted successfully", "success");
      } else {
        showToast(result.error || "Failed to delete image", "error");
      }
    } catch (error) {
      showToast("Failed to delete image", "error");
    }
  };

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

  if (!mounted) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme.bg} ${theme.text}`}
        style={{ fontFamily: "Inter, Poppins, Montserrat, sans-serif" }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${theme.bg} ${theme.text}${darkMode ? ' dark' : ''}`}
      style={{ fontFamily: "Inter, Poppins, Montserrat, sans-serif" }}
    >
      {/* Toast/response message */}
      {toast && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className={`px-8 py-4 rounded-xl shadow-lg border ${theme.card} text-center text-lg font-medium pointer-events-auto`}
            style={{ minWidth: 260 }}
          >
            {toast.message}
          </div>
        </div>
      )}
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
              {userSession?.isAnonymous && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    localStorage.removeItem("x02_session");
                    navigate("/auth");
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register
                </Button>
              )}

              {!userSession?.isAnonymous && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate("/dashboard")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="border-red-400 text-red-500 hover:bg-red-50"
                onClick={() => {
                  localStorage.removeItem("x02_session");
                  navigate("/auth");
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Logout
              </Button>

              <Button
                size="sm"
                className={darkMode ? 'border border-green-400 text-green-300 bg-black hover:bg-green-900/20 transition-colors' : 'border border-blue-500 bg-transparent text-blue-600 hover:bg-blue-50'}
                onClick={() => setDarkMode((d) => !d)}
              >
                {darkMode ? "Light Mode" : "Dark Mode"}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 relative z-10">
        <section className="mb-8">
          <div
            className={`rounded-lg border ${theme.card} p-8 text-center transition-all relative group ${dragActive ? "ring-4 ring-blue-400 scale-105 shadow-2xl" : "hover:shadow-xl hover:scale-[1.02]"} duration-200`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: uploading ? "not-allowed" : "pointer", transition: 'box-shadow 0.2s, transform 0.2s' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <div className="flex flex-col items-center justify-center mb-2">
              <ArrowUpCircle className={`w-12 h-12 mb-2 text-blue-400 transition-transform duration-300 ${dragActive ? 'animate-bounce' : 'group-hover:animate-bounce-slow'}`} />
            </div>
            {uploading ? (
              <>
                <div className="text-blue-600 font-semibold mb-2">
                  Uploading...
                </div>
                {uploadProgress !== null ? (
                  <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-blue-400 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-3">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-lg font-medium mb-2">
                  Drag & drop or click to upload an image
                </div>
                <div className="text-blue-600 text-sm">
                  JPG, PNG, GIF, etc. (max 30MB)
                  {userSession?.isAnonymous && (
                    <span className="block text-blue-400 text-xs mt-1">
                      Anonymous: 10 uploads/hour
                    </span>
                  )}
                  {userSession && !userSession.isAnonymous && (
                    <span className="block text-blue-500 text-xs mt-1">
                      Registered:{" "}
                      {(userSession as UserSession).limits.dailyLimit}{" "}
                      uploads/day
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
        {/* Feature Highlights for Anonymous Users */}
        {userSession?.isAnonymous && (
          <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border shadow-lg backdrop-blur-md bg-white/80 dark:bg-black/70 border-gray-200 dark:border-green-900/60 p-6 flex flex-col items-center text-center">
                <BarChart2 className="w-8 h-8 mb-2 text-amber-500" />
                <div className="font-semibold text-base mb-1">Analytics</div>
                <div className="text-xs text-gray-500 dark:text-green-200">Track your uploads and usage stats with your account.</div>
              </div>
              <div className="rounded-xl border shadow-lg backdrop-blur-md bg-white/80 dark:bg-black/70 border-gray-200 dark:border-green-900/60 p-6 flex flex-col items-center text-center">
                <ShieldCheck className="w-8 h-8 mb-2 text-teal-500" />
                <div className="font-semibold text-base mb-1">Watermarking</div>
                <div className="text-xs text-gray-500 dark:text-green-200">Protect your images with custom watermarks.</div>
              </div>
              <div className="rounded-xl border shadow-lg backdrop-blur-md bg-white/80 dark:bg-black/70 border-gray-200 dark:border-green-900/60 p-6 flex flex-col items-center text-center">
                <Key className="w-8 h-8 mb-2 text-blue-500" />
                <div className="font-semibold text-base mb-1">API Access</div>
                <div className="text-xs text-gray-500 dark:text-green-200">Automate uploads and integrate with your apps using our API.</div>
              </div>
              <div className="rounded-xl border shadow-lg backdrop-blur-md bg-white/80 dark:bg-black/70 border-gray-200 dark:border-green-900/60 p-6 flex flex-col items-center text-center">
                <Globe className="w-8 h-8 mb-2 text-green-500" />
                <div className="font-semibold text-base mb-1">Custom Subdomain</div>
                <div className="text-xs text-gray-500 dark:text-green-200">Get image links generated on your own subdomain (e.g., <span className='font-semibold'>yourname.x02.me</span>).</div>
              </div>
            </div>
          </section>
        )}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>Most Recent Uploads</h2>
          {loadingUploads ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex items-center gap-4 ${theme.card} p-3 animate-pulse`}>
                  <div className="w-16 h-16 bg-gray-200 rounded border" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded" />
                  <div className="w-16 h-8 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : uploadedImages.length === 0 ? (
            <div className={`${theme.subtext} text-base`}>
              No images uploaded yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {uploadedImages.slice(0, 3).map((image, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 ${theme.card} p-3 transition-all duration-200 hover:shadow-md`}
                >
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-16 h-16 object-cover rounded border border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="font-medium" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>{image.originalName}</div>
                    <div className="text-blue-600 text-xs">
                      {formatFileSize(image.size)} •{" "}
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </div>
                    <div className="text-blue-500 text-xs break-all">
                      {image.url}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className={`${theme.button} mr-2 rounded-xl shadow-md hover:shadow-lg transition-all backdrop-blur-md bg-white/80 dark:bg-black/60 border-none`}
                    onClick={() => copyToClipboard(image.url)}
                  >
                    Copy Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`${theme.buttonOutline} mr-2 rounded-xl shadow-md hover:shadow-lg transition-all backdrop-blur-md bg-white/70 dark:bg-black/60 border-none`}
                    onClick={() => window.open(image.url, "_blank")}
                  >
                    Open
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <footer
        className={`text-center ${theme.subtext} text-sm mt-12 mb-4 relative z-10`}
      >
        &copy; {new Date().getFullYear()} X02 Image Uploader
      </footer>
    </div>
  );
}
