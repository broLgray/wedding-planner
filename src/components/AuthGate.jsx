"use client";

import { useAuth } from "./AuthProvider";
import LoginPage from "./LoginPage";
import WeddingPlanner from "./WeddingPlanner";

export default function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf5ef",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "18px",
          color: "#a0917f",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <WeddingPlanner />;
}
