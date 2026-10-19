import { Suspense } from "react";
import Link from "next/link";
import {
  Building2, MapPin, Bed, Bath, ShieldCheck, CreditCard, Clock, ArrowRight, Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  available: boolean;
  category?: {
    name: string;
  }
}

async function getFeaturedProperties(): Promise<Property[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiUrl}/properties`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
}

function FeaturedPropertiesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((n) => (
        <Card key={n} className="overflow-hidden animate-pulse">
          <div className="h-48 w-full bg-muted" />
          <CardHeader className="pb-2">
            <div className="h-4 w-20 bg-muted rounded mb-2" />
            <div className="h-6 w-3/4 bg-muted rounded mb-2" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-4 w-full bg-muted rounded mb-2" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </CardContent>
          <CardFooter className="pt-0">
            <div className="h-10 w-full bg-muted rounded" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

async function FeaturedPropertiesList() {
  const properties = await getFeaturedProperties();
  const featured = properties.slice(0, 3);

  if (featured.length === 0) {
    return (
      <div className="text-center py-12 bg-background border rounded-lg">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No properties available yet. Be the first to list one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featured.map((property) => (
        <Card key={property.id} className="overflow-hidden flex flex-col hover:shadow-lg transition duration-200">
          {/* Property Image Preview */}
          <div className="relative h-48 w-full bg-muted flex items-center justify-center overflow-hidden">
            <img
              src={
                property.images?.[0] && !property.images[0].includes("example.com")
                  ? property.images[0]
                  : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
              }
              alt={property.title}
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
            />
            <span className="absolute top-3 right-3 bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full text-sm shadow">
              ${property.price} / mo
            </span>
          </div>

          {/* Card Content */}
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-semibold text-primary uppercase tracking-wider">
                {property.category?.name || "Apartment"}
              </span>
            </div>
            <CardTitle className="text-xl line-clamp-1">{property.title}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
          </CardHeader>

          <CardContent className="flex-1 pb-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {property.description}
            </p>
            {/* Features row */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms} Bed</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms} Bath</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <Link href={`/properties/${property.id}`} className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      {/*  HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 md:py-28">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4 px-3 py-1 text-sm font-medium">
            🏡 The #1 Rental Housing Marketplace
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Find Your Next Home, <br className="hidden sm:inline" />
            <span className="text-primary">Rent With Confidence.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover verified houses, modern apartments, and cozy studios directly from verified landlords. No hassle, no hidden fees.
          </p>
          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/properties">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base h-12 px-8">
                <Search className="h-5 w-5" />
                Browse All Properties
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* FEATURED PROPERTIES SECTION  */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Listings</h2>
              <p className="text-muted-foreground mt-2">
                Handpicked rental spaces available for immediate move-in.
              </p>
            </div>
            <Link href="/properties" className="text-primary font-medium hover:underline flex items-center gap-1">
              View all listings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {/* Property Cards Grid inside Suspense Boundary */}
          <Suspense fallback={<FeaturedPropertiesSkeleton />}>
            <FeaturedPropertiesList />
          </Suspense>
        </div>
      </section>
      {/*  WHY CHOOSE US SECTION */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Why Choose RentNest?</h2>
            <p className="text-muted-foreground mt-2">
              Everything you need for a smooth and secure renting experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 border rounded-xl bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Verified Landlords</h3>
              <p className="text-sm text-muted-foreground">
                All property listings and landlords undergo verification to ensure safe and authentic transactions.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border rounded-xl bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Seamless Payments</h3>
              <p className="text-sm text-muted-foreground">
                Pay rent and deposits securely online through our integrated Stripe payment system.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border rounded-xl bg-card">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Approval</h3>
              <p className="text-sm text-muted-foreground">
                Submit rental requests in seconds and receive approval notifications directly on your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/*  FOOTER */}
      <footer className="mt-auto border-t bg-muted/40 py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">RentNest</span>
            <span>&copy; 2026 All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/properties" className="hover:text-foreground transition">Properties</Link>
            <Link href="/auth/login" className="hover:text-foreground transition">Login</Link>
            <Link href="/auth/register" className="hover:text-foreground transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
