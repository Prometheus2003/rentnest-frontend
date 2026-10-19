"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-6">
        <AlertTriangle className="h-10 w-10" />
      </div>

      <span className="text-sm font-semibold uppercase tracking-wider text-destructive">
        Something Went Wrong
      </span>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 mb-4">
        Unexpected Application Error
      </h1>
      <p className="text-muted-foreground max-w-md mb-8 text-base">
        We encountered a temporary issue while loading this page. Please try again or return to the homepage.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
