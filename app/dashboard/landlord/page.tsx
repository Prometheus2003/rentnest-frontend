"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
    Building2,
    PlusCircle,
    Calendar,
    Clock,
    User,
    Mail,
    Phone,
    Check,
    X,
    Trash2,
    MapPin,
    Bed,
    Bath,
    ShieldAlert,
    Inbox,
    Edit3
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RentalRequest {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    paymentStatus: "UNPAID" | "PAID";
    moveInDate: string;
    rentalDuration: number;
    message?: string | null;
    property: {
        id: string;
        title: string;
        price: number;
        location: string;
    };
    tenant: {
        name: string;
        email: string;
        contactNumber?: string | null;
    };
}

interface Property {
    id: string;
    title: string;
    description?: string;
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    landlordId: string;
    images: string[];
    category?: {
        name: string;
    };
}

interface Category {
    id: string;
    name: string;
}

export default function LandlordDashboard() {
    const router = useRouter();

    // Active view tab
    const [activeTab, setActiveTab] = useState<"REQUESTS" | "LISTINGS" | "ADD_NEW">("REQUESTS");

    const [requests, setRequests] = useState<RentalRequest[]>([]);
    const [myProperties, setMyProperties] = useState<Property[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // New Property Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [bedrooms, setBedrooms] = useState("1");
    const [bathrooms, setBathrooms] = useState("1");
    const [categoryId, setCategoryId] = useState("");
    const [amenitiesInput, setAmenitiesInput] = useState("WiFi, Air Conditioning");
    const [imageUrl, setImageUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit Property Modal State
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [editBedrooms, setEditBedrooms] = useState("1");
    const [editBathrooms, setEditBathrooms] = useState("1");
    const [isUpdatingProperty, setIsUpdatingProperty] = useState(false);

    useEffect(() => {
        const token = Cookies.get("token");
        const role = Cookies.get("role");

        if (!token || (role !== "LANDLORD" && role !== "ADMIN")) {
            toast.error("Please login as a Landlord to access this dashboard");
            router.push("/auth/login");
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

        async function loadDashboardData() {
            try {
                // 1. Fetch incoming rental requests
                const reqPromise = fetch(`${apiUrl}/rental-requests/landlord-request`, {
                    headers: { Authorization: token as string },
                }).then((res) => res.json());

                // 2. Fetch properties
                const propPromise = fetch(`${apiUrl}/properties`).then((res) => res.json());

                // 3. Fetch categories for creating new listings
                const catPromise = fetch(`${apiUrl}/categories`).then((res) => res.json());

                const [reqData, propData, catData] = await Promise.all([reqPromise, propPromise, catPromise]);

                if (reqData.success && reqData.data) {
                    setRequests(reqData.data);
                }

                if (propData.success && propData.data) {
                    // You can filter by landlord or view all landlord's listings
                    setMyProperties(propData.data);
                }

                if (catData.success && catData.data) {
                    setCategories(catData.data);
                    if (catData.data.length > 0) {
                        setCategoryId(catData.data[0].id);
                    }
                }
            } catch (error) {
                console.error("Dashboard load failed:", error);
                toast.error("Error loading dashboard data");
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboardData();
    }, [router]);

    // Handle Approve or Reject
    const handleUpdateStatus = async (requestId: string, newStatus: "APPROVED" | "REJECTED") => {
        const token = Cookies.get("token");
        if (!token) return;

        setUpdatingId(requestId);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/rental-requests/${requestId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.message || "Failed to update request");
            }

            toast.success(`Request successfully marked as ${newStatus}`);

            // Update in local state
            setRequests((prev) =>
                prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
            );
        } catch (error: any) {
            toast.error(error.message || "Action failed");
        } finally {
            setUpdatingId(null);
        }
    };

    // Handle Delete Property
    const handleDeleteProperty = async (propertyId: string) => {
        const token = Cookies.get("token");
        if (!token || !confirm("Are you sure you want to delete this listing?")) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/properties/${propertyId}`, {
                method: "DELETE",
                headers: { Authorization: token },
            });

            if (!res.ok) throw new Error("Failed to delete property");

            toast.success("Listing deleted successfully");
            setMyProperties((prev) => prev.filter((p) => p.id !== propertyId));
        } catch (error: any) {
            toast.error(error.message || "Delete failed");
        }
    };

    // Open Edit Modal with populated data
    const handleOpenEdit = (prop: Property) => {
        setEditingProperty(prop);
        setEditTitle(prop.title);
        setEditDescription(prop.description || "");
        setEditPrice(prop.price.toString());
        setEditLocation(prop.location);
        setEditBedrooms(prop.bedrooms.toString());
        setEditBathrooms(prop.bathrooms.toString());
    };

    // Save Updated Property
    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProperty) return;
        const token = Cookies.get("token");
        if (!token) return;

        setIsUpdatingProperty(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/properties/${editingProperty.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    price: parseFloat(editPrice),
                    location: editLocation,
                    bedrooms: parseInt(editBedrooms, 10),
                    bathrooms: parseInt(editBathrooms, 10),
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.message || "Failed to update property");
            }

            toast.success("Listing updated successfully!");
            setMyProperties((prev) =>
                prev.map((p) =>
                    p.id === editingProperty.id
                        ? {
                              ...p,
                              title: editTitle,
                              description: editDescription,
                              price: parseFloat(editPrice),
                              location: editLocation,
                              bedrooms: parseInt(editBedrooms, 10),
                              bathrooms: parseInt(editBathrooms, 10),
                          }
                        : p
                )
            );
            setEditingProperty(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to update listing");
        } finally {
            setIsUpdatingProperty(false);
        }
    };

    // Handle Add Property
    const handleCreateProperty = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("token");
        if (!token) return;

        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/properties`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    title,
                    description,
                    price: parseFloat(price),
                    location,
                    bedrooms: parseInt(bedrooms, 10),
                    bathrooms: parseInt(bathrooms, 10),
                    categoryId,
                    amenities: amenitiesInput.split(",").map((a) => a.trim()).filter(Boolean),
                    images: imageUrl ? [imageUrl] : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.message || "Failed to create property");
            }

            toast.success("New property listing published!");

            // Reset form & reload listings
            setTitle("");
            setDescription("");
            setPrice("");
            setLocation("");
            setActiveTab("LISTINGS");

            // Append newly created property
            if (json.data) {
                setMyProperties((prev) => [json.data, ...prev]);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to post listing");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b">
                <div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 mb-2">
                        Landlord Portal
                    </Badge>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Property & Request Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Review tenant applications, approve leases, and manage your properties.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
                    <Button
                        size="sm"
                        variant={activeTab === "REQUESTS" ? "default" : "ghost"}
                        onClick={() => setActiveTab("REQUESTS")}
                        className="text-xs sm:text-sm"
                    >
                        Applications ({requests.length})
                    </Button>

                    <Button
                        size="sm"
                        variant={activeTab === "LISTINGS" ? "default" : "ghost"}
                        onClick={() => setActiveTab("LISTINGS")}
                        className="text-xs sm:text-sm"
                    >
                        My Listings ({myProperties.length})
                    </Button>

                    <Button
                        size="sm"
                        variant={activeTab === "ADD_NEW" ? "default" : "ghost"}
                        onClick={() => setActiveTab("ADD_NEW")}
                        className="text-xs sm:text-sm gap-1"
                    >
                        <PlusCircle className="h-4 w-4" /> Add Listing
                    </Button>
                </div>
            </div>

            {/* ===================== TAB 1: INCOMING REQUESTS ===================== */}
            {activeTab === "REQUESTS" && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold">Incoming Tenant Applications</h2>
                        <p className="text-sm text-muted-foreground">
                            Tenants who have requested to book your rental listings.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map((n) => (
                                <div key={n} className="h-44 rounded-xl bg-muted animate-pulse" />
                            ))}
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {requests.map((req) => (
                                <Card key={req.id} className="overflow-hidden hover:shadow-md transition">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                                            {/* Left: Tenant and Property Info */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg text-foreground">
                                                        {req.property?.title || "Rental Property"}
                                                    </h3>
                                                    <Badge variant="outline">
                                                        ${req.property?.price} / mo
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1 font-semibold text-foreground">
                                                        <User className="h-3.5 w-3.5 text-primary" /> {req.tenant?.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-3.5 w-3.5" /> {req.tenant?.email}
                                                    </span>
                                                    {req.tenant?.contactNumber && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="h-3.5 w-3.5" /> {req.tenant?.contactNumber}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5 text-primary" /> Move-in: {new Date(req.moveInDate).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5 text-primary" /> Duration: {req.rentalDuration} Months
                                                    </span>
                                                </div>

                                                {req.message && (
                                                    <p className="text-xs bg-muted/60 p-2.5 rounded-lg text-muted-foreground mt-2 italic">
                                                        "{req.message}"
                                                    </p>
                                                )}
                                            </div>

                                            {/* Right: Status and Action Buttons */}
                                            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                                                <div className="flex items-center gap-2">
                                                    {req.status === "APPROVED" ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold">
                                                            Approved ✓
                                                        </Badge>
                                                    ) : req.status === "REJECTED" ? (
                                                        <Badge variant="destructive">Rejected ✕</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-amber-600 bg-amber-500/10">
                                                            Awaiting Your Decision
                                                        </Badge>
                                                    )}

                                                    {req.paymentStatus === "PAID" && (
                                                        <Badge className="bg-emerald-600 text-white font-medium">
                                                            Paid ✓
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Approve / Reject Controls */}
                                                {req.status === "PENDING" && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Button
                                                            size="sm"
                                                            className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                            onClick={() => handleUpdateStatus(req.id, "APPROVED")}
                                                            disabled={updatingId === req.id}
                                                        >
                                                            <Check className="h-4 w-4" /> Approve
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="gap-1"
                                                            onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                                                            disabled={updatingId === req.id}
                                                        >
                                                            <X className="h-4 w-4" /> Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-muted/20 border border-dashed rounded-xl">
                            <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-semibold">No applications yet</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                                When tenants submit rental requests for your properties, they will appear here for your approval.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ===================== TAB 2: MY LISTINGS ===================== */}
            {activeTab === "LISTINGS" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">My Property Listings</h2>
                            <p className="text-sm text-muted-foreground">
                                All rental properties currently under your management.
                            </p>
                        </div>
                        <Button onClick={() => setActiveTab("ADD_NEW")} className="gap-2">
                            <PlusCircle className="h-4 w-4" /> Add Property
                        </Button>
                    </div>

                    {myProperties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myProperties.map((prop) => (
                                <Card key={prop.id} className="overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                                    <div className="relative h-44 w-full bg-muted">
                                        <img
                                            src={prop.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"}
                                            alt={prop.title}
                                            className="h-full w-full object-cover"
                                        />
                                        <span className="absolute top-2 right-2 bg-primary text-primary-foreground font-bold px-2.5 py-0.5 rounded-full text-xs">
                                            ${prop.price} / mo
                                        </span>
                                    </div>

                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base line-clamp-1">{prop.title}</CardTitle>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                            <span className="line-clamp-1">{prop.location}</span>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pb-3 text-xs text-muted-foreground flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Bed className="h-3.5 w-3.5" /> {prop.bedrooms} Bed
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Bath className="h-3.5 w-3.5" /> {prop.bathrooms} Bath
                                        </span>
                                    </CardContent>

                                    <CardFooter className="pt-2 border-t flex items-center justify-between gap-2">
                                        <Link href={`/properties/${prop.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                View
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleOpenEdit(prop)}
                                            className="gap-1 px-3 text-xs"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" /> Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteProperty(prop.id)}
                                            className="gap-1 px-3"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-muted/20 border border-dashed rounded-xl">
                            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-lg font-semibold">No listings found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Post your first rental listing to start receiving tenant applications!
                            </p>
                            <Button onClick={() => setActiveTab("ADD_NEW")} className="mt-4 gap-2">
                                <PlusCircle className="h-4 w-4" /> Create Listing
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* ===================== TAB 3: ADD NEW LISTING ===================== */}
            {activeTab === "ADD_NEW" && (
                <Card className="max-w-2xl mx-auto shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl">Publish a New Property</CardTitle>
                        <CardDescription>
                            Provide clear details to attract verified tenants to your listing.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleCreateProperty}>
                        <CardContent className="space-y-4">

                            <div className="space-y-2">
                                <Label htmlFor="title">Property Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Modern 2-Bedroom Apartment in Gulshan"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Monthly Rent ($)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="1200"
                                        required
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location / City</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g. Dhaka, Banani"
                                        required
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bedrooms">Bedrooms</Label>
                                    <Input
                                        id="bedrooms"
                                        type="number"
                                        min="0"
                                        value={bedrooms}
                                        onChange={(e) => setBedrooms(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bathrooms">Bathrooms</Label>
                                    <Input
                                        id="bathrooms"
                                        type="number"
                                        min="0"
                                        value={bathrooms}
                                        onChange={(e) => setBathrooms(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={categoryId} onValueChange={(val) => { if (val) setCategoryId(val); }}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                                <Input
                                    id="amenities"
                                    placeholder="WiFi, Gym, Pool, Parking, Elevator"
                                    value={amenitiesInput}
                                    onChange={(e) => setAmenitiesInput(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image">Image URL (optional)</Label>
                                <Input
                                    id="image"
                                    placeholder="https://images.unsplash.com/..."
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Detailed Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Describe your property, proximity to transport, security, etc."
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                        </CardContent>

                        <CardFooter className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={() => setActiveTab("LISTINGS")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Publishing..." : "Publish Listing"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            {/* ===================== EDIT PROPERTY MODAL ===================== */}
            {editingProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <Card className="w-full max-w-lg shadow-2xl animate-in fade-in-50 zoom-in-95">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl">Edit Property Listing</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingProperty(null)}
                                    className="h-8 w-8"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardDescription>
                                Update property details, pricing, or room specifications.
                            </CardDescription>
                        </CardHeader>

                        <form onSubmit={handleSaveEdit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-title">Property Title</Label>
                                    <Input
                                        id="edit-title"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-price">Price ($ / mo)</Label>
                                        <Input
                                            id="edit-price"
                                            type="number"
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            required
                                            min={1}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-location">Location / Area</Label>
                                        <Input
                                            id="edit-location"
                                            value={editLocation}
                                            onChange={(e) => setEditLocation(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-bedrooms">Bedrooms</Label>
                                        <Input
                                            id="edit-bedrooms"
                                            type="number"
                                            value={editBedrooms}
                                            onChange={(e) => setEditBedrooms(e.target.value)}
                                            required
                                            min={0}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-bathrooms">Bathrooms</Label>
                                        <Input
                                            id="edit-bathrooms"
                                            type="number"
                                            value={editBathrooms}
                                            onChange={(e) => setEditBathrooms(e.target.value)}
                                            required
                                            min={1}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-description">Description</Label>
                                    <textarea
                                        id="edit-description"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        required
                                    />
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-end gap-2 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingProperty(null)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isUpdatingProperty}>
                                    {isUpdatingProperty ? "Saving..." : "Save Changes"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}

        </div>
    );
}
