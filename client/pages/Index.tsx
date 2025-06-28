import { useState, useRef, useCallback } from "react";
import { Upload, Image, Link, Copy, Download, FileImage } from "lucide-react";
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
    try {
      const fullUrl = `${window.location.origin}${url}`;
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Link copied!",
        description: "Image URL copied to clipboard",
      });
    } catch (error) {
      console.error("Copy failed:", error);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 gradient-bg rounded-lg">
                <Image className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">PixelHost</h1>
            </div>
            <Button variant="outline" size="sm">
              Gallery
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">
            Upload & Share Images
            <br />
            <span className="gradient-text">Instantly</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fast, reliable image hosting with instant sharing links. Upload your
            images and get shareable URLs in seconds.
          </p>
        </div>

        {/* Upload Area */}
        <Card className="max-w-2xl mx-auto mb-12 p-8">
          <div
            className={`upload-zone rounded-lg p-12 text-center cursor-pointer transition-all ${
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
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full gradient-bg flex items-center justify-center animate-pulse">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-medium">Uploading...</p>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we process your image
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    Drag & drop your image here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                  <FileImage className="h-4 w-4" />
                  <span>Supports JPG, PNG, GIF up to 10MB</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold mb-6">Recent Uploads</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {uploadedImages.map((image) => (
                <Card key={image.id} className="overflow-hidden group">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h4
                        className="font-medium truncate"
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
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
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

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Why Choose PixelHost?</h3>
            <p className="text-muted-foreground">
              Simple, fast, and reliable image hosting for everyone
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Instant Upload</h4>
              <p className="text-sm text-muted-foreground">
                Drag, drop, and share. Upload images in seconds with our
                streamlined interface.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <Link className="h-6 w-6 text-accent" />
              </div>
              <h4 className="font-semibold mb-2">Direct Links</h4>
              <p className="text-sm text-muted-foreground">
                Get shareable URLs instantly. Perfect for forums, social media,
                and websites.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Image className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">High Quality</h4>
              <p className="text-sm text-muted-foreground">
                Your images stay crisp and clear. No compression, no quality
                loss.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
