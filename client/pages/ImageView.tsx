import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Download,
  Image,
  ExternalLink,
  Calendar,
  HardDrive,
  Cpu,
  Shield,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface ImageData {
  id: string;
  url: string;
  originalName: string;
  size: number;
  uploadedAt: string;
}

export default function ImageView() {
  const { imageId } = useParams<{ imageId: string }>();
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageId) {
      setTimeout(() => {
        setImageData({
          id: imageId,
          url: `/api/images/${imageId}.jpg`,
          originalName: "sample-image.jpg",
          size: 2048576,
          uploadedAt: new Date().toISOString(),
        });
        setLoading(false);
      }, 500);
    }
  }, [imageId]);

  const copyToClipboard = async (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullUrl);
        toast({
          title: "⚡ Link copied!",
          description: "Image URL copied to clipboard",
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
          description: "Image URL copied to clipboard",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-neon flex items-center justify-center animate-pulse animate-glow">
            <Cpu className="h-10 w-10 text-white" />
          </div>
          <p className="text-lg font-medium font-mono">LOADING DIGITAL ASSET...</p>
        </div>
      </div>
    );
  }

  if (!imageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-neon font-mono">ASSET NOT FOUND</h1>
          <p className="text-muted-foreground mb-6 font-mono">
            The digital asset you're looking for doesn't exist in our vault.
          </p>
          <Button asChild className="font-mono">
            <Link to="/">RETURN TO VAULT</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Neon Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 gradient-primary rounded-full blur-2xl animate-float opacity-25"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 gradient-secondary rounded-full blur-3xl animate-float opacity-20" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Header */}
      <header className="glass-effect border-b border-border/50 relative z-10 scan-line">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="font-mono">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  BACK
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 gradient-neon rounded-xl animate-glow">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-neon font-mono">
                    X02
                  </h1>
                  <p className="text-xs text-muted-foreground font-mono">// DIGITAL VAULT</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(imageData.url)}
                className="font-mono cyber-card"
              >
                <Copy className="h-4 w-4 mr-2" />
                COPY LINK
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(imageData.url, "_blank")}
                className="font-mono cyber-card"
              >
                <Download className="h-4 w-4 mr-2" />
                DOWNLOAD
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Image Display */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden cyber-card animate-slide-up">
                <div className="relative bg-muted min-h-[500px] flex items-center justify-center">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full gradient-neon flex items-center justify-center animate-pulse animate-glow">
                        <Cpu className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                  <img
                    src={imageData.url}
                    alt={imageData.originalName}
                    className={`max-w-full max-h-[700px] object-contain transition-opacity duration-300 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      setImageLoaded(true);
                      toast({
                        title: "Failed to load image",
                        description: "The image could not be displayed",
                        variant: "destructive",
                      });
                    }}
                  />
                </div>
              </Card>
            </div>

            {/* Image Info */}
            <div className="space-y-6">
              <Card className="p-6 cyber-card">
                <h2 className="text-xl font-bold mb-6 text-neon font-mono">ASSET DETAILS</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground font-mono">
                      FILE NAME
                    </label>
                    <p className="font-bold break-all font-mono text-foreground">
                      {imageData.originalName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-mono">
                        <HardDrive className="h-4 w-4" />
                        SIZE
                      </label>
                      <p className="font-bold font-mono text-primary">
                        {formatFileSize(imageData.size)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 font-mono">
                        <Calendar className="h-4 w-4" />
                        UPLOADED
                      </label>
                      <p className="font-bold font-mono text-accent">
                        {new Date(imageData.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground font-mono">
                      ASSET ID
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="font-mono bg-primary/20 text-primary border-primary/30">
                        {imageData.id}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 cyber-card">
                <h3 className="text-lg font-bold mb-6 text-neon font-mono">SHARE OPTIONS</h3>
                <div className="space-y-4">
                  <Button
                    className="w-full justify-start font-mono cyber-card"
                    variant="outline"
                    onClick={() => copyToClipboard(imageData.url)}
                  >
                    <Copy className="h-4 w-4 mr-3" />
                    COPY DIRECT LINK
                  </Button>

                  <Button
                    className="w-full justify-start font-mono cyber-card"
                    variant="outline"
                    onClick={() => copyToClipboard(window.location.href)}
                  >
                    <ExternalLink className="h-4 w-4 mr-3" />
                    COPY PAGE LINK
                  </Button>

                  <Button
                    className="w-full justify-start font-mono cyber-card"
                    variant="outline"
                    onClick={() => window.open(imageData.url, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-3" />
                    DOWNLOAD ORIGINAL
                  </Button>
                </div>
              </Card>

              <Card className="p-6 cyber-card">
                <h3 className="text-lg font-bold mb-6 text-neon font-mono">EMBED CODE</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground font-mono">
                      HTML
                    </label>
                    <div className="mt-2 p-4 bg-muted rounded-lg border border-border/50">
                      <code className="text-sm break-all font-mono text-primary">
                        {`<img src="${window.location.origin}${imageData.url}" alt="${imageData.originalName}" />`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground font-mono">
                      MARKDOWN
                    </label>
                    <div className="mt-2 p-4 bg-muted rounded-lg border border-border/50">
                      <code className="text-sm break-all font-mono text-accent">
                        {`![${imageData.originalName}](${window.location.origin}${imageData.url})`}
                      </code>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
