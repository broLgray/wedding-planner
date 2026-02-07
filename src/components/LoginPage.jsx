"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { getSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const supabase = getSupabase();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(155deg, #4a3728 0%, #6b5443 40%, #8a7261 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Cormorant Garamond', serif",
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Decorative radial overlay */}
      <div style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(255,220,180,0.08) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", marginBottom: "32px" }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "10px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "rgba(255,245,230,0.5)",
          marginBottom: "8px",
        }}>
          Celebration Planner
        </p>
        <h1 style={{
          fontSize: "36px",
          fontWeight: 300,
          color: "#faf5ef",
          margin: "0 0 8px",
          letterSpacing: "0.5px",
        }}>
          Your Wedding
        </h1>
        <p style={{
          color: "rgba(255,245,230,0.55)",
          fontSize: "14px",
          fontWeight: 300,
          fontFamily: "'DM Sans', sans-serif",
          maxWidth: "320px",
          lineHeight: "1.5",
        }}>
          Sign in to save your plans, track your budget, and manage your guest list.
        </p>
      </div>

      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "400px",
        background: "#faf5ef",
        borderRadius: "16px",
        padding: "32px 28px",
        boxShadow: "0 8px 40px rgba(30,20,10,0.25)",
      }}>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#4a3728",
                  brandAccent: "#6b5443",
                  inputBackground: "#fdf8f2",
                  inputBorder: "rgba(140,110,85,0.2)",
                  inputBorderFocus: "#4a3728",
                  inputBorderHover: "rgba(140,110,85,0.35)",
                  inputText: "#3d2e1f",
                  inputLabelText: "#6b5443",
                  inputPlaceholder: "#b5a898",
                },
                fontSizes: {
                  baseBodySize: "14px",
                  baseInputSize: "15px",
                  baseLabelSize: "13px",
                  baseButtonSize: "14px",
                },
                fonts: {
                  bodyFontFamily: "'DM Sans', sans-serif",
                  buttonFontFamily: "'DM Sans', sans-serif",
                  inputFontFamily: "'Cormorant Garamond', serif",
                  labelFontFamily: "'DM Sans', sans-serif",
                },
                radii: {
                  borderRadiusButton: "10px",
                  buttonBorderRadius: "10px",
                  inputBorderRadius: "10px",
                },
                space: {
                  inputPadding: "12px 14px",
                  buttonPadding: "12px 24px",
                },
              },
            },
          }}
          providers={[]}
          redirectTo={typeof window !== "undefined" ? window.location.origin : ""}
          view="sign_in"
          showLinks={true}
          localization={{
            variables: {
              sign_in: {
                email_label: "Email",
                password_label: "Password",
                button_label: "Sign In",
                link_text: "Already have an account? Sign in",
              },
              sign_up: {
                email_label: "Email",
                password_label: "Create a Password",
                button_label: "Create Account",
                link_text: "Don't have an account? Sign up",
              },
            },
          }}
        />
      </div>

      <p style={{
        position: "relative",
        zIndex: 1,
        marginTop: "24px",
        fontSize: "11px",
        color: "rgba(255,245,230,0.3)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        Your data is private and encrypted.
      </p>
    </div>
  );
}
