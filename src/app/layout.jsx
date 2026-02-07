import { AuthProvider } from "@/components/AuthProvider";

export const metadata = {
  title: "Wedding Planner",
  description: "Plan your perfect day. Budget, timeline, guests, and more.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { min-height: 100vh; background: #f5f0e8; }
        `}</style>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
