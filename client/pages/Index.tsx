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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { UploadResponse } from "@shared/api";
import favicon from '/public/favicon.ico';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState(null);

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
          title: "⚡ Upload successful!",
          description: `${file.name} is now in the matrix`,
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
    const fullUrl = `${window.location.origin}${url}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullUrl);
        toast({
          title: "⚡ Link copied!",
          description: "Ready to share in the digital realm",
        });
        return;
      }

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
          title: "⚡ Link copied!",
          description: "Ready to share in the digital realm",
        });
      } else {
        throw new Error("Copy command failed");
      }
    } catch (error) {
      console.error("Copy failed:", error);
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
        <div className="gradient-neon w-16 h-16 rounded-full animate-pulse-slow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.21) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.21) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Neon Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 gradient-primary rounded-full blur-2xl animate-float opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 gradient-secondary rounded-full blur-3xl animate-float opacity-25" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 gradient-accent rounded-full blur-xl animate-float opacity-20" style={{ animationDelay: "4s" }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-20 h-20 gradient-neon rounded-full blur-lg animate-float opacity-35" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 animate-slide-up scan-line">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl animate-glow">
                <img src={favicon} alt="logo" className="w-10 h-10 rounded-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">X02</h1>
                <p className="text-xs text-muted-foreground font-mono"></p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">

 
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowGallery(!showGallery)}
                className="gap-2 hover-lift cyber-card neon-border"
              >
                <Grid3X3 className="h-5 w-5" />
                <span className="font-mono">GALLERY</span>
                {uploadedImages.length > 0 && (
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-mono">
                    {uploadedImages.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto text-center mb-20 animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-card/50 backdrop-blur-sm rounded-full border border-primary/20 mb-6">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-mono text-primary">SECURE UPLOAD SYSTEM</span>
            </div>
          </div>
          <h2 className="text-8xl font-black text-neon mb-6 leading-none">
            DIGITAL
            <br />
            <span className="text-gradient">VAULT</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-mono">
            Upload. Secure. Share. Your images are protected in our cyber fortress.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <Card className="cyber-card p-5 text-center max-w-sm mx-auto rounded-xl">
            <div className="w-10 h-10 mx-auto mb-3 gradient-primary rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-primary mb-1">LIGHTNING FAST</h3>
            <p className="text-sm text-muted-foreground font-mono">Instant uploads</p>
          </Card>
          <Card className="cyber-card p-5 text-center max-w-sm mx-auto rounded-xl">
            <div className="w-10 h-10 mx-auto mb-3 gradient-secondary rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-accent mb-1">SECURE</h3>
            <p className="text-sm text-muted-foreground font-mono">Military-grade encryption</p>
          </Card>
          <Card className="cyber-card p-5 text-center max-w-sm mx-auto rounded-xl">
            <div className="w-10 h-10 mx-auto mb-3 gradient-accent rounded-xl flex items-center justify-center">
              <Wifi className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-accent mb-1">GLOBAL</h3>
            <p className="text-sm text-muted-foreground font-mono">Worldwide access</p>
          </Card>
        </div>

        {/* Upload Area */}
        <Card className="max-w-xl mx-auto mb-16 cyber-card animate-slide-up rounded-2xl">
          <div className="p-8">
            <div
              className={`upload-zone rounded-2xl p-8 text-center cursor-pointer relative overflow-hidden ${
                dragActive ? "border-white bg-white/10 scale-105" : ""
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
                  <div className="w-32 h-32 mx-auto rounded-full gradient-neon flex items-center justify-center shimmer animate-glow">
                    <Upload className="h-16 w-16 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground font-mono">
                      ⚡ UPLOADING TO MATRIX...
                    </p>
                    <p className="text-lg text-muted-foreground font-mono">
                      Processing your digital asset
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center animate-float border border-primary/30">
                    <Upload className="h-16 w-16 text-primary" />
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-foreground mb-3 font-mono">
                      DROP FILES HERE
                    </p>
                    <p className="text-xl text-muted-foreground font-mono">
                      or click to access your device
                    </p>
                  </div>
                  <div className="flex items-center gap-5 justify-center text-muted-foreground font-mono text-base">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-5 w-5" />
                      <span>JPG, PNG, GIF</span>
                    </div>
                    <div className="w-px h-4 bg-border"></div>
                    <span>MAX 30MB</span>
                  </div>
                </div>
              )}

              {dragActive && (
                <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="h-20 w-20 text-primary mx-auto mb-4 animate-pulse" />
                    <p className="text-3xl font-bold text-primary font-mono">
                      DROP IT! ⚡
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
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <Eye className="h-8 w-8 text-accent" />
                    <h3 className="text-5xl font-black text-neon font-mono">
                      DIGITAL VAULT
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary/20 border border-primary/30">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="text-primary font-mono font-bold">
                      {uploadedImages.length} FILES
                    </span>
                  </div>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {uploadedImages.map((image, index) => (
                    <Card
                      key={image.id}
                      className="overflow-hidden group cyber-card animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.originalName}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                            <Image className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <h4
                            className="font-bold truncate text-foreground text-lg font-mono"
                            title={image.originalName}
                          >
                            {image.originalName}
                          </h4>
                          <p className="text-sm text-muted-foreground font-mono">
                            {formatFileSize(image.size)} • {new Date(image.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            className="flex-1 gradient-primary hover:scale-105 transition-transform font-mono"
                            onClick={() => copyToClipboard(image.url)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            COPY
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:scale-105 transition-transform cyber-card font-mono"
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
                <div className="w-24 h-24 mx-auto mb-8 rounded-full gradient-neon flex items-center justify-center animate-pulse-slow">
                  <Grid3X3 className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-foreground font-mono">
                  VAULT EMPTY
                </h3>
                <p className="text-xl text-muted-foreground font-mono">
                  Upload your first file to initialize the digital vault ⚡
                </p>
              </div>
            )}
          </div>
        )}
      </div>
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
            <Button onClick={() => { setEditModalOpen(false); handleFileUpload(editImage); }}>Upload</Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
