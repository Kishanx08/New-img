import { useState, useRef, useCallback, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { UploadResponse } from "@shared/api";

interface UploadedImage {
  id: string;
  url: string;
  originalName: string;
  size: number;
  uploadedAt: string;
}

export default function Index() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (data.success) {
        const newImage: UploadedImage = {
          id: data.imageId,
          url: data.url,
          originalName: data.originalName,
          size: data.size,
          uploadedAt: data.uploadedAt,
        };

        setUploadedImages((prev) => [newImage, ...prev]);
        setShowGallery(true);
        toast({
          title: "🎉 Upload successful!",
          description: `${file.name} is ready to share`,
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const copyToClipboard = async (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;

    try {
      // Try modern clipboard API first (requires HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullUrl);
        toast({
          title: "✨ Link copied!",
          description: "Ready to share anywhere",
        });
        return;
      }

      // Fallback for HTTP - use legacy method
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        toast({
          title: "✨ Link copied!",
          description: "Ready to share anywhere",
        });
      } else {
        throw new Error("Copy command failed");
      }
    } catch (error) {
      console.error("Copy failed:", error);
      // Final fallback - show the URL for manual copy
      toast({
        title: "Copy manually",
        description: fullUrl,
        duration: 10000,
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="gradient-primary w-12 h-12 rounded-full animate-pulse-slow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 gradient-primary rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 gradient-secondary rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 gradient-accent rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 animate-slide-up">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 gradient-primary rounded-2xl glow animate-pulse-slow">
                <Image className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gradient">KishanX02</h1>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowGallery(!showGallery)}
              className="gap-2 hover-lift bg-card/50 backdrop-blur-sm border-border/50"
            >
              <Grid3X3 className="h-5 w-5" />
              Gallery
              {uploadedImages.length > 0 && (
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                  {uploadedImages.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center mb-20 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-8 w-8 text-accent animate-pulse" />
            <h2 className="text-7xl font-black text-gradient">Share Images</h2>
            <Zap className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Lightning-fast uploads with instant sharing. Drag, drop, and watch
            your images come to life.
          </p>
        </div>

        {/* Upload Area */}
        <Card className="max-w-4xl mx-auto mb-20 border-border/50 bg-card/50 backdrop-blur-sm hover-lift animate-slide-up">
          <div className="p-10">
            <div
              className={`upload-zone rounded-2xl p-20 text-center cursor-pointer relative overflow-hidden ${
                dragActive ? "border-primary bg-primary/20 scale-105" : ""
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
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
                <div className="space-y-8">
                  <div className="w-24 h-24 mx-auto rounded-full gradient-primary flex items-center justify-center shimmer">
                    <Upload className="h-12 w-12 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      ✨ Uploading Magic...
                    </p>
                    <p className="text-lg text-muted-foreground">
                      Your image is being processed
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center animate-float">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground mb-2">
                      Drop your magic here
                    </p>
                    <p className="text-lg text-muted-foreground">
                      or click to browse your device
                    </p>
                  </div>
                  <div className="flex items-center gap-4 justify-center text-muted-foreground">
                    <FileImage className="h-6 w-6" />
                    <span className="text-lg">JPG, PNG, GIF • Up to 10MB</span>
                  </div>
                </div>
              )}

              {dragActive && (
                <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
                    <p className="text-2xl font-bold text-primary">
                      Drop it! 🚀
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Gallery */}
        {showGallery && (
          <div className="max-w-7xl mx-auto animate-slide-up">
            {uploadedImages.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <Eye className="h-8 w-8 text-accent" />
                    <h3 className="text-4xl font-bold text-gradient">
                      Your Gallery
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-primary font-semibold">
                      {uploadedImages.length} images
                    </span>
                  </div>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {uploadedImages.map((image, index) => (
                    <Card
                      key={image.id}
                      className="overflow-hidden group border-border/50 bg-card/50 backdrop-blur-sm hover-lift animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.originalName}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <h4
                            className="font-semibold truncate text-foreground text-lg"
                            title={image.originalName}
                          >
                            {image.originalName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(image.size)} •{" "}
                            {new Date(image.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            className="flex-1 gradient-primary hover:scale-105 transition-transform"
                            onClick={() => copyToClipboard(image.url)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:scale-105 transition-transform bg-card/50"
                            onClick={() => window.open(image.url, "_blank")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center animate-pulse-slow">
                  <Grid3X3 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  Your gallery awaits
                </h3>
                <p className="text-lg text-muted-foreground">
                  Upload your first image to see the magic happen ✨
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
