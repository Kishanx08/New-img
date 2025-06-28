import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cpu, Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
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
        <div className="absolute top-20 left-10 w-32 h-32 gradient-primary rounded-full blur-2xl animate-float opacity-25"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 gradient-secondary rounded-full blur-3xl animate-float opacity-20" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 gradient-accent rounded-full blur-xl animate-float opacity-15" style={{ animationDelay: "4s" }}></div>
      </div>

      <div className="text-center relative z-10">
        <div className="w-32 h-32 mx-auto mb-8 rounded-full gradient-neon flex items-center justify-center animate-pulse-slow animate-glow">
          <AlertTriangle className="h-16 w-16 text-white" />
        </div>
        <h1 className="text-9xl font-black text-neon mb-6 font-mono">404</h1>
        <h2 className="text-3xl font-bold mb-4 text-foreground font-mono">ACCESS DENIED</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto font-mono">
          The digital path you're seeking doesn't exist in our cyber matrix.
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        <Button asChild size="lg" className="gap-3 font-mono cyber-card">
          <Link to="/">
            <Home className="h-5 w-5" />
            RETURN TO VAULT
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
