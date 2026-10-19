import Link from "next/link";
import { Building2, Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
        <Building2 className="h-10 w-10 stroke-[1.5]" />
      </div>

      <span className="text-sm font-semibold uppercase tracking-wider text-primary">
        404 Error
      </span>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 mb-4">
        Page Not Found
      </h1>
      <p className="text-muted-foreground max-w-md mb-8 text-base">
        The rental listing or page you are looking for doesn&apos;t exist, was removed, or has moved to a new address.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link href="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/properties">
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Explore Properties
          </Button>
        </Link>
      </div>
    </div>
  );
}
