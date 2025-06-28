import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Download,
  Image,
  ExternalLink,
  Calendar,
  HardDrive,
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
    // For demo purposes, we'll simulate fetching image data
    // In a real app, you'd fetch from an API endpoint
    if (imageId) {
      setTimeout(() => {
        setImageData({
          id: imageId,
          url: `/api/images/${imageId}.jpg`, // Simulated URL
          originalName: "sample-image.jpg",
          size: 2048576, // 2MB
          uploadedAt: new Date().toISOString(),
        });
        setLoading(false);
      }, 500);
    }
  }, [imageId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center animate-pulse">
            <Image className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-medium">Loading image...</p>
        </div>
      </div>
    );
  }

  if (!imageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Image not found</h1>
          <p className="text-muted-foreground mb-6">
            The image you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 gradient-bg rounded-lg">
                  <Image className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">KishanX02</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(imageData.url)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(imageData.url, "_blank")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Image Display */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="relative bg-muted min-h-[400px] flex items-center justify-center">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center animate-pulse">
                        <Image className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                  <img
                    src={imageData.url}
                    alt={imageData.originalName}
                    className={`max-w-full max-h-[600px] object-contain transition-opacity duration-300 ${
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
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Image Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      File Name
                    </label>
                    <p className="font-medium break-all">
                      {imageData.originalName}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <HardDrive className="h-4 w-4" />
                        Size
                      </label>
                      <p className="font-medium">
                        {formatFileSize(imageData.size)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Uploaded
                      </label>
                      <p className="font-medium">
                        {new Date(imageData.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Image ID
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {imageData.id}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Share Options</h3>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => copyToClipboard(imageData.url)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Direct Link
                  </Button>

                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => copyToClipboard(window.location.href)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copy Page Link
                  </Button>

                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => window.open(imageData.url, "_blank")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Original
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Embed Code</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      HTML
                    </label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <code className="text-sm break-all">
                        {`<img src="${window.location.origin}${imageData.url}" alt="${imageData.originalName}" />`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Markdown
                    </label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <code className="text-sm break-all">
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
