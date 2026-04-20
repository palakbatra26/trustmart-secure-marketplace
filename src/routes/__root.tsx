import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TrustMart — Second-Hand Marketplace with Trust Score" },
      {
        name: "description",
        content:
          "Buy and sell second-hand items safely. Every seller has a verified trust score so you know who you're dealing with.",
      },
      { property: "og:title", content: "TrustMart — Second-Hand Marketplace with Trust Score" },
      { property: "og:description", content: "TrustMart is a secure second-hand marketplace with a focus on user trust and safe transactions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "TrustMart — Second-Hand Marketplace with Trust Score" },
      { name: "description", content: "TrustMart is a secure second-hand marketplace with a focus on user trust and safe transactions." },
      { name: "twitter:description", content: "TrustMart is a secure second-hand marketplace with a focus on user trust and safe transactions." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9cf70244-fef4-4066-8dbc-03e84c9782a7/id-preview-b3727ca7--6a83ddea-4cc6-4d93-8b82-f0711bd8043d.lovable.app-1776661944061.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9cf70244-fef4-4066-8dbc-03e84c9782a7/id-preview-b3727ca7--6a83ddea-4cc6-4d93-8b82-f0711bd8043d.lovable.app-1776661944061.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster richColors position="top-center" />
    </AuthProvider>
  );
}
