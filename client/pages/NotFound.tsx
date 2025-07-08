import React, { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cpu, Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  // Default to dark mode for NotFound page
  const darkMode = true;
  const theme = useMemo(() => darkMode
    ? {
        bg: "bg-black",
        card: "bg-black/60 border-green-800/40 text-white",
        text: "text-white",
        accent: "text-green-300 border-green-400",
        subtext: "text-green-200/70",
        button: "bg-green-700 hover:bg-green-600 text-white",
        buttonOutline: "border-green-700 text-green-300 hover:bg-green-900/30",
      }
    : {
        bg: "bg-gradient-to-br from-gray-100 via-blue-100 to-teal-50",
        card: "bg-white border border-gray-200 rounded-xl shadow-md text-gray-900",
        text: "text-gray-900",
        accent: "text-teal-600 border-teal-500",
        subtext: "text-gray-500",
        button: "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium rounded px-4 py-2 shadow",
        buttonOutline: "border border-teal-500 text-teal-600 hover:bg-teal-50 font-medium rounded px-4 py-2",
      }, []);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className={`min-h-screen ${theme.bg} relative overflow-hidden flex items-center justify-center` + (darkMode ? ' dark' : '')}>
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

      <div className={`text-center relative z-10 ${theme.text}`}>
        <div className={`w-32 h-32 mx-auto mb-8 rounded-full gradient-neon flex items-center justify-center animate-pulse-slow animate-glow ${theme.card}`}>
          <AlertTriangle className="h-16 w-16 text-white" />
        </div>
        <h1 className={`text-9xl font-black mb-6 font-mono ${theme.accent}`}>404</h1>
        <h2 className={`text-3xl font-bold mb-4 font-mono ${theme.text}`}>ACCESS DENIED</h2>
        <p className={`text-xl mb-8 max-w-md mx-auto font-mono ${theme.subtext}`}>
          The digital path you're seeking doesn't exist in our cyber matrix.
        </p>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        <Button asChild size="lg" className={`gap-3 font-mono ${theme.button}`}>
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
