"use client";
import { useAuth } from "./context/AuthProvider";
import Game from "./components/Game";
import Auth from "./components/Auth";
import { useState, useEffect } from "react";

export default function Home() {
  // Always call hooks at the top level
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Only run on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle rendering states
  if (!mounted) {
    return <LoadingSpinner />;
  }

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Auth />;
  }

  return <Game />;
}

// Extract spinner to a separate component
function LoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #1e5f74 0%, #133b5c 100%)",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "5px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "50%",
          borderTop: "5px solid white",
          animation: "spin 1s linear infinite",
        }}
      />
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
