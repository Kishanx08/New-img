import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      "Dashboard Error Boundary caught an error:",
      error,
      errorInfo,
    );
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <div className="min-h-screen bg-background text-foreground">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                  Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The dashboard encountered an unexpected error. This might be
                  due to:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Invalid session data</li>
                  <li>Network connectivity issues</li>
                  <li>Server-side problems</li>
                </ul>

                {this.state.error && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm">Error Details:</h4>
                    <code className="text-xs text-muted-foreground">
                      {this.state.error.message}
                    </code>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={this.resetError}>Try Again</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem("x02_session");
                      window.location.href = "/auth";
                    }}
                  >
                    Reset Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
