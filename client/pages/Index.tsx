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
  const [darkMode, setDarkMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

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
<<<<<<< HEAD
            url: upload.shortUrl || upload.url, // Use short URL if available
=======
            url: upload.url,
>>>>>>> origin/main
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
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditImage(file);
        setEditPreview(ev.target.result);
        setEditModalOpen(true);
      };
      reader.readAsDataURL(file);
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

      const response = await fetch(`/api/images/${filename}`, {
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
      className={`min-h-screen relative overflow-hidden ${theme.bg} ${theme.text}`}
      style={{ fontFamily: "Inter, Poppins, Montserrat, sans-serif" }}
    >
      {/* Toast/response message */}
      {toast && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className={`px-8 py-4 rounded-xl shadow-lg border ${theme.glass} backdrop-blur-lg text-center text-lg font-medium pointer-events-auto`}
            style={{
              minWidth: 260,
              border: "1.5px solid #fff2",
              boxShadow: "0 2px 24px #00ff8033",
            }}
          >
            {toast.message}
          </div>
        </div>
      )}
      <header
        className={`w-full border-b ${theme.card} backdrop-blur-md py-4 mb-8 relative z-10`}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-4 px-4">
          <img src={favicon} alt="logo" className="w-10 h-10 rounded-lg" />
          <div className="flex-1">
            <h1
              className={`text-2xl font-bold tracking-tight inline-block border-b-2 ${theme.accent} pb-1`}
            >
              X02 Image Uploader
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {userSession && !userSession.isAnonymous && (
              <div className="text-sm text-green-300">
                Welcome, {(userSession as UserSession).username}
              </div>
            )}
            {userSession?.isAnonymous && (
              <div className="text-sm text-green-300/70">Anonymous User</div>
            )}

            <div className="flex gap-2">
              {userSession?.isAnonymous && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-400/40 text-green-300 hover:bg-green-900/20"
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
                  className="border-green-400/40 text-green-300 hover:bg-green-900/20"
                  onClick={() => navigate("/dashboard")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="border-red-400/40 text-red-300 hover:bg-red-900/20"
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
                className="border border-green-400/40 bg-transparent text-green-300 hover:bg-green-900/20"
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
            className={`rounded-xl border ${theme.card} backdrop-blur-lg p-8 text-center transition-colors ${dragActive ? "ring-2 ring-green-400" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              cursor: uploading ? "not-allowed" : "pointer",
              border: "1.5px solid #fff2",
              boxShadow: "0 2px 24px #00ff8033",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {uploading ? (
              <>
                <div className="text-green-300 font-semibold mb-2">
                  Uploading...
                </div>
                {uploadProgress !== null ? (
                  <div className="w-full h-3 bg-green-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-green-400 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-3">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full" />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-lg font-medium mb-2">
                  Drag & drop or click to upload an image
                </div>
                <div className="text-green-300 text-sm">
                  JPG, PNG, GIF, etc. (max 30MB)
                  {userSession?.isAnonymous && (
                    <span className="block text-yellow-300 text-xs mt-1">
                      Anonymous: 10 uploads/hour
                    </span>
                  )}
                  {userSession && !userSession.isAnonymous && (
                    <span className="block text-green-400 text-xs mt-1">
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
        <section>
          <h2 className="text-lg font-semibold mb-4">Uploaded Images</h2>
          {uploadedImages.length === 0 ? (
            <div className={`${theme.subtext} text-base`}>
              No images uploaded yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {uploadedImages.map((image, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 ${theme.card} rounded-lg p-3 backdrop-blur-lg transition-all duration-200 hover:shadow-green-700/20`}
                  style={{
                    border: "1.5px solid #fff2",
                    boxShadow: "0 2px 24px #00ff8033",
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-16 h-16 object-cover rounded border border-green-900/40"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{image.originalName}</div>
                    <div className="text-green-300 text-xs">
                      {formatFileSize(image.size)} •{" "}
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </div>
                    <div className="text-green-400 text-xs break-all">
                      {image.url}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className={`${theme.button} mr-2 shadow-none hover:shadow-green-400/30 transition-shadow`}
                    onClick={() => copyToClipboard(image.url)}
                  >
                    Copy Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`${theme.buttonOutline} hover:shadow-green-400/20 transition-shadow mr-2`}
                    onClick={() => window.open(image.url, "_blank")}
                  >
                    Open
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Image?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{image.originalName}".
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteImage(image.url, image.id)}
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview Image</DialogTitle>
          </DialogHeader>
          {editPreview && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-64 h-64 bg-muted flex items-center justify-center select-none">
                <img
                  src={editPreview}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                setEditModalOpen(false);
                handleFileUpload(editImage);
              }}
            >
              Upload
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
