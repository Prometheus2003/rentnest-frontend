"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Bed, Bath, Search, SlidersHorizontal, RotateCcw, Sparkles } from "lucide-react";

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
    };
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [sortBy, setSortBy] = useState("DEFAULT");
    const [maxPrice, setMaxPrice] = useState("");
    const [bedroomsFilter, setBedroomsFilter] = useState("ALL");

    useEffect(() => {
        async function fetchProperties() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                const res = await fetch(`${apiUrl}/properties`);
                const json = await res.json();
                if (json.success && json.data) {
                    setProperties(json.data);
                }
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchProperties();
    }, []);

    const categories = Array.from(
        new Set(properties.map((p) => p.category?.name).filter(Boolean))
    ) as string[];

    const filteredProperties = properties
        .filter((property) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                property.title.toLowerCase().includes(query) ||
                property.location.toLowerCase().includes(query);
            const matchesCategory =
                selectedCategory.toUpperCase() === "ALL" ||
                property.category?.name.toLowerCase() === selectedCategory.toLowerCase();
            const matchesMaxPrice = !maxPrice || property.price <= Number(maxPrice);
            const matchesBedrooms =
                bedroomsFilter === "ALL" || property.bedrooms >= Number(bedroomsFilter);
            return matchesSearch && matchesCategory && matchesMaxPrice && matchesBedrooms;
        })
        .sort((a, b) => {
            if (sortBy === "PRICE_LOW_TO_HIGH") return a.price - b.price;
            if (sortBy === "PRICE_HIGH_TO_LOW") return b.price - a.price;
            return 0;
        });

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedCategory("ALL");
        setSortBy("DEFAULT");
        setMaxPrice("");
        setBedroomsFilter("ALL");
    };

    return (
        <div className="container mx-auto px-4 py-10 max-w-7xl">
            {/* ===================== PAGE HEADER ===================== */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Explore Rental Properties
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Find the perfect rental apartment, house, or studio suited to your lifestyle.
                </p>
            </div>

            {/* ===================== SEARCH & FILTER BAR ===================== */}
            <div className="bg-card border rounded-xl p-4 md:p-6 mb-10 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
                    {/* Search Input */}
                    <div className="relative md:col-span-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by city, area, or property title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className="md:col-span-2">
                        <Select value={selectedCategory} onValueChange={(val) => { if (val) setSelectedCategory(val); }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bedrooms Dropdown */}
                    <div className="md:col-span-2">
                        <Select value={bedroomsFilter} onValueChange={(val) => { if (val) setBedroomsFilter(val); }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Bedrooms" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Bedrooms</SelectItem>
                                <SelectItem value="1">1+ Bed</SelectItem>
                                <SelectItem value="2">2+ Beds</SelectItem>
                                <SelectItem value="3">3+ Beds</SelectItem>
                                <SelectItem value="4">4+ Beds</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Max Price Input */}
                    <div className="md:col-span-2">
                        <Input
                            type="number"
                            placeholder="Max Price ($)"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            min={0}
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="md:col-span-2">
                        <Select value={sortBy} onValueChange={(val) => { if (val) setSortBy(val); }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DEFAULT">Default</SelectItem>
                                <SelectItem value="PRICE_LOW_TO_HIGH">Price: Low to High</SelectItem>
                                <SelectItem value="PRICE_HIGH_TO_LOW">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Result Counter & Active Filter Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <span>
                        Showing <strong className="text-foreground">{filteredProperties.length}</strong> of {properties.length} properties
                    </span>
                    {(searchQuery || selectedCategory !== "ALL" || sortBy !== "DEFAULT" || maxPrice || bedroomsFilter !== "ALL") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="text-xs text-primary hover:text-primary gap-1 h-8"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset filters
                        </Button>
                    )}
                </div>
            </div>

            {/* ===================== PROPERTIES GRID ===================== */}
            {isLoading ? (
                // Loading Skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-80 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((property) => (
                        <Card key={property.id} className="overflow-hidden flex flex-col hover:shadow-lg transition duration-200">
                            {/* Image Banner */}
                            <div className="relative h-48 w-full bg-muted flex items-center justify-center overflow-hidden">
                                {property.images?.[0] && !property.images[0].includes("example.com") ? (
                                    <img
                                        src={property.images[0]}
                                        alt={property.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Building2 className="h-12 w-12 stroke-[1.5]" />
                                        <span className="text-xs mt-1">RentNest Verified</span>
                                    </div>
                                )}

                                {/* Price Badge */}
                                <span className="absolute top-3 right-3 bg-primary text-primary-foreground font-bold px-3 py-1 rounded-full text-sm shadow">
                                    ${property.price} / mo
                                </span>
                            </div>

                            {/* Header: Category, Title, Location */}
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span className="font-semibold text-primary uppercase tracking-wider">
                                        {property.category?.name || "Apartment"}
                                    </span>
                                    {property.available && (
                                        <Badge variant="secondary" className="text-[10px] font-normal">
                                            Available
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-xl line-clamp-1">{property.title}</CardTitle>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                                    <span className="line-clamp-1">{property.location}</span>
                                </div>
                            </CardHeader>

                            {/* Content: Description & Specs */}
                            <CardContent className="flex-1 pb-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {property.description}
                                </p>

                                {/* Amenities Badges (first 3) */}
                                {property.amenities && property.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {property.amenities.slice(0, 3).map((amenity, idx) => (
                                            <span
                                                key={idx}
                                                className="text-[11px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md"
                                            >
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Specs: Bed & Bath */}
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

                            {/* Action Button */}
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
            ) : (
                // Empty Search Results State
                <div className="text-center py-16 bg-muted/20 border border-dashed rounded-xl">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold">No matching properties found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                        Try adjusting your search terms, changing the category, or clearing your filters.
                    </p>
                    <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-4 gap-2">
                        <RotateCcw className="h-4 w-4" /> Reset Filters
                    </Button>
                </div>
            )}
        </div>
    );
}