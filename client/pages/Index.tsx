import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Image,
  Copy,
  Download,
  FileImage,
  Grid3X3,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          title: "Upload successful!",
          description: `${file.name} has been uploaded`,
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
          title: "Link copied!",
          description: "Image URL copied to clipboard",
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
          title: "Link copied!",
          description: "Image URL copied to clipboard",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl">
                <Image className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">KishanX02</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGallery(!showGallery)}
              className="gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Gallery
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-6xl font-bold mb-6 text-foreground">
            Professional Image Hosting
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload, share, and manage your images with enterprise-grade
            reliability. Get instant shareable links for all your visual
            content.
          </p>
        </div>

        {/* Upload Area */}
        <Card className="max-w-3xl mx-auto mb-16 border-border/50">
          <div className="p-8">
            <div
              className={`upload-zone rounded-xl p-16 text-center cursor-pointer transition-all ${
                dragActive ? "border-upload-hover bg-upload-hover/10" : ""
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
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-foreground">
                      Processing...
                    </p>
                    <p className="text-muted-foreground">
                      Your image is being uploaded
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-foreground">
                      Drop your image here
                    </p>
                    <p className="text-muted-foreground">
                      or click to select from your device
                    </p>
                  </div>
                  <div className="flex items-center gap-3 justify-center text-sm text-muted-foreground">
                    <FileImage className="h-5 w-5" />
                    <span>Supports JPG, PNG, GIF • Max 10MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Gallery */}
        {showGallery && uploadedImages.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-foreground">
                Your Images
              </h3>
              <p className="text-muted-foreground">
                {uploadedImages.length} uploaded
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {uploadedImages.map((image) => (
                <Card
                  key={image.id}
                  className="overflow-hidden group border-border/50 hover:border-border transition-all"
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h4
                        className="font-medium truncate text-foreground"
                        title={image.originalName}
                      >
                        {image.originalName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(image.size)} •{" "}
                        {new Date(image.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => copyToClipboard(image.url)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(image.url, "_blank")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty Gallery State */}
        {showGallery && uploadedImages.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Grid3X3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              No images yet
            </h3>
            <p className="text-muted-foreground">
              Upload your first image to see it in the gallery
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
