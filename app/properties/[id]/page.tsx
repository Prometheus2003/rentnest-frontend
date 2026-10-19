"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
    Building2,
    MapPin,
    Bed,
    Bath,
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    CheckCircle2,
    Send,
    Star
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PropertyDetails {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    amenities: string[];
    images: string[];
    available: boolean;
    category?: {
        name: string;
    };
    landlord?: {
        name: string;
        email: string;
        contactNumber?: string | null;
    };
    reviews?: {
        id: string;
        rating: number;
        comment: string;
        createdAt: string;
        tenant?: {
            name: string;
        };
    }[];
}

export default function PropertyDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const [property, setProperty] = useState<PropertyDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Auth state
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // Booking Form State
    const [moveInDate, setMoveInDate] = useState("");
    const [rentalDuration, setRentalDuration] = useState("6");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setToken(Cookies.get("token") || null);
        setRole(Cookies.get("role") || null);

        async function fetchProperty() {
            if (!id) return;
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                const res = await fetch(`${apiUrl}/properties/${id}`);
                const json = await res.json();
                if (json.success && json.data) {
                    setProperty(json.data);
                } else {
                    toast.error("Property not found");
                }
            } catch (error) {
                console.error("Failed to load property details:", error);
                toast.error("Error loading property");
            } finally {
                setIsLoading(false);
            }
        }

        fetchProperty();
    }, [id]);

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error("Please login to submit a rental request");
            router.push("/auth/login");
            return;
        }

        if (!moveInDate) {
            toast.error("Please select a move-in date");
            return;
        }

        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/rental-requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    propertyId: id,
                    moveInDate: new Date(moveInDate).toISOString(),
                    rentalDuration: parseInt(rentalDuration, 10),
                    message: message || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to submit request");
            }

            toast.success("Rental request submitted successfully!");
            setMessage("");
            
            router.push("/dashboard/tenant");
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || role !== "TENANT") {
            toast.error("Only signed-in Tenants can submit reviews");
            return;
        }

        if (!reviewComment.trim()) {
            toast.error("Please enter your review comment");
            return;
        }

        setIsSubmittingReview(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    propertyId: id,
                    rating,
                    comment: reviewComment,
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.message || "Failed to submit review");
            }

            toast.success("Review submitted successfully!");
            setReviewComment("");

            
            const refreshRes = await fetch(`${apiUrl}/properties/${id}`);
            const refreshJson = await refreshRes.json();
            if (refreshJson.data) {
                setProperty(refreshJson.data);
            }
        } catch (err: any) {
            toast.error(err.message || "Review failed");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-5xl animate-pulse">
                <div className="h-8 w-40 bg-muted rounded mb-6" />
                <div className="h-96 w-full bg-muted rounded-xl mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 h-64 bg-muted rounded-xl" />
                    <div className="h-64 bg-muted rounded-xl" />
                </div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold">Property Not Found</h2>
                <p className="text-muted-foreground mt-2 mb-6">
                    The listing you are looking for does not exist or has been removed.
                </p>
                <Link href="/properties">
                    <Button>Back to All Properties</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">

            {/* Navigation Breadcrumb */}
            <div className="mb-6">
                <Link
                    href="/properties"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Properties
                </Link>
            </div>

            {/* Main Grid: Left side Details, Right side Booking Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/*  LEFT COLUMN (DETAILS)  */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Main Photo Banner */}
                    <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-muted border">
                        <img
                            src={
                                property.images?.[0] && !property.images[0].includes("example.com")
                                    ? property.images[0]
                                    : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
                            }
                            alt={property.title}
                            className="h-full w-full object-cover"
                        />

                        <div className="absolute top-4 left-4 flex gap-2">
                            <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 text-sm shadow">
                                {property.category?.name || "Apartment"}
                            </Badge>
                            {property.available && (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">
                                    Available Now
                                </Badge>
                            )}
                        </div>

                        <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur px-4 py-2 rounded-xl border shadow font-bold text-xl text-primary">
                            ${property.price} <span className="text-sm font-normal text-muted-foreground">/ month</span>
                        </div>
                    </div>

                    {/* Title & Location Header */}
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            {property.title}
                        </h1>
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-2">
                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                            <span>{property.location}</span>
                        </div>
                    </div>

                    {/* Quick Specs Pill Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-card border text-center">
                        <div className="p-2">
                            <span className="text-xs text-muted-foreground">Bedrooms</span>
                            <div className="flex items-center justify-center gap-1.5 font-bold text-lg mt-0.5">
                                <Bed className="h-5 w-5 text-primary" />
                                <span>{property.bedrooms}</span>
                            </div>
                        </div>

                        <div className="p-2">
                            <span className="text-xs text-muted-foreground">Bathrooms</span>
                            <div className="flex items-center justify-center gap-1.5 font-bold text-lg mt-0.5">
                                <Bath className="h-5 w-5 text-primary" />
                                <span>{property.bathrooms}</span>
                            </div>
                        </div>

                        <div className="p-2">
                            <span className="text-xs text-muted-foreground">Category</span>
                            <div className="flex items-center justify-center gap-1.5 font-bold text-lg mt-0.5">
                                <Building2 className="h-5 w-5 text-primary" />
                                <span>{property.category?.name || "Rental"}</span>
                            </div>
                        </div>

                        <div className="p-2">
                            <span className="text-xs text-muted-foreground">Monthly Rent</span>
                            <div className="font-bold text-lg mt-0.5 text-primary">
                                ${property.price}
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-3">
                        <h2 className="text-xl font-bold">About this Property</h2>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {property.description}
                        </p>
                    </div>

                    {/* Amenities Section */}
                    {property.amenities && property.amenities.length > 0 && (
                        <div className="space-y-3 pt-4 border-t">
                            <h2 className="text-xl font-bold">Amenities Included</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {property.amenities.map((amenity, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2.5 rounded-lg border bg-muted/20 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Landlord Contact Card */}
                    {property.landlord && (
                        <div className="pt-4 border-t">
                            <h2 className="text-xl font-bold mb-3">Listed by Landlord</h2>
                            <Card>
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base">{property.landlord.name}</h3>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3.5 w-3.5" /> {property.landlord.email}
                                            </span>
                                            {property.landlord.contactNumber && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3.5 w-3.5" /> {property.landlord.contactNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/*  REVIEWS & RATINGS SECTION  */}
                    <div className="pt-6 border-t space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    Tenant Reviews & Ratings
                                    {property.reviews && property.reviews.length > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {property.reviews.length} {property.reviews.length === 1 ? "Review" : "Reviews"}
                                        </Badge>
                                    )}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Verified experiences from tenants who have stayed here.
                                </p>
                            </div>
                        </div>

                        {/* Leave a Review Form (For logged in tenants) */}
                        {role === "TENANT" && (
                            <Card className="bg-muted/30 border-dashed">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">Write a Review</CardTitle>
                                </CardHeader>
                                <form onSubmit={handleReviewSubmit}>
                                    <CardContent className="space-y-3">
                                        {/* Interactive Star Picker */}
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-muted-foreground mr-2">Your Rating:</span>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className="focus:outline-hidden transition transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`h-5 w-5 ${
                                                            star <= rating
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-muted-foreground/30"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="text-xs font-semibold ml-2 text-foreground">
                                                {rating} / 5
                                            </span>
                                        </div>

                                        <Input
                                            placeholder="Share your experience (amenities, cleanliness, neighborhood)..."
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            required
                                        />
                                    </CardContent>
                                    <CardFooter className="pt-0 flex justify-end">
                                        <Button size="sm" type="submit" disabled={isSubmittingReview} className="gap-1.5 text-xs">
                                            <Send className="h-3.5 w-3.5" />
                                            {isSubmittingReview ? "Posting..." : "Submit Review"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        )}

                        {/* Existing Reviews List */}
                        {property.reviews && property.reviews.length > 0 ? (
                            <div className="space-y-3">
                                {property.reviews.map((rev) => (
                                    <div key={rev.id} className="p-4 rounded-xl border bg-card space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {rev.tenant?.name ? rev.tenant.name.charAt(0) : "T"}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold">{rev.tenant?.name || "Verified Tenant"}</p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {new Date(rev.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Display Stars */}
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`h-3.5 w-3.5 ${
                                                            s <= rev.rating
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-muted-foreground/30"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed pl-10">
                                            "{rev.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground py-4 italic">
                                No reviews yet. Be the first tenant to leave a rating!
                            </p>
                        )}
                    </div>

                </div>

                {/*  RIGHT COLUMN (BOOKING WIDGET)*/}
                <div className="lg:col-span-4">
                    <div className="sticky top-24">
                        <Card className="shadow-md border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-baseline justify-between">
                                    <span>${property.price}</span>
                                    <span className="text-sm font-normal text-muted-foreground">/ month</span>
                                </CardTitle>
                                <CardDescription>
                                    Send an official rental request to the landlord.
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {role === "LANDLORD" || role === "ADMIN" ? (
                                    <div className="p-4 rounded-lg bg-muted text-center text-sm text-muted-foreground">
                                        You are signed in as an <strong>{role}</strong>. Rental booking requests can only be placed by Tenant accounts.
                                    </div>
                                ) : !token ? (
                                    <div className="space-y-4 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Sign in as a Tenant to reserve your move-in date and send a rental request.
                                        </p>
                                        <Link href="/auth/login" className="block w-full">
                                            <Button className="w-full">Login to Request Rent</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <form onSubmit={handleBookingSubmit} className="space-y-4">

                                        {/* Move-in Date */}
                                        <div className="space-y-2">
                                            <Label htmlFor="moveInDate" className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4 text-primary" /> Move-in Date
                                            </Label>
                                            <Input
                                                id="moveInDate"
                                                type="date"
                                                required
                                                value={moveInDate}
                                                onChange={(e) => setMoveInDate(e.target.value)}
                                                min={new Date().toISOString().split("T")[0]}
                                            />
                                        </div>

                                        {/* Rental Duration */}
                                        <div className="space-y-2">
                                            <Label htmlFor="duration" className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-primary" /> Duration (Months)
                                            </Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                min="1"
                                                max="36"
                                                required
                                                value={rentalDuration}
                                                onChange={(e) => setRentalDuration(e.target.value)}
                                            />
                                        </div>

                                        {/* Optional Message */}
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message for Landlord (Optional)</Label>
                                            <Input
                                                id="message"
                                                placeholder="Tell the landlord about yourself..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full gap-2 mt-2"
                                            disabled={isSubmitting}
                                        >
                                            <Send className="h-4 w-4" />
                                            {isSubmitting ? "Submitting Request..." : "Request to Rent"}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>

                            <CardFooter className="pt-0 text-xs text-center text-muted-foreground">
                                Zero booking fees. You only pay after the landlord approves.
                            </CardFooter>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
}
