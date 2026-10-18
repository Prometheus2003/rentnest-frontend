"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
    Building2,
    MapPin,
    Calendar,
    Clock,
    CreditCard,
    CheckCircle2,
    XCircle,
    Hourglass,
    ArrowRight,
    UserCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RentalRequest {
    id: string;
    propertyId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    paymentStatus: "UNPAID" | "PAID";
    paymentId?: string | null;
    moveInDate: string;
    rentalDuration: number;
    message?: string | null;
    createdAt: string;
    property: {
        id: string;
        title: string;
        price: number;
        location: string;
        images: string[];
    };
}

export default function TenantDashboard() {
    const router = useRouter();
    const [requests, setRequests] = useState<RentalRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [payingId, setPayingId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("Tenant");

    useEffect(() => {
        const token = Cookies.get("token");
        const role = Cookies.get("role");
        const user = Cookies.get("user");

        if (!token || role !== "TENANT") {
            toast.error("Please login as a Tenant to access this dashboard");
            router.push("/auth/login");
            return;
        }

        if (user) {
            try {
                const parsed = JSON.parse(user);
                if (parsed.name) setUserName(parsed.name);
            } catch (e) {
            }
        }

        async function fetchMyRequests() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

                const res = await fetch(`${apiUrl}/rental-requests/my-requsets`, {
                    headers: {
                        Authorization: token as string,
                    },
                });
                const json = await res.json();
                if (json.success && json.data) {
                    setRequests(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch requests:", error);
                toast.error("Failed to load rental requests");
            } finally {
                setIsLoading(false);
            }
        }

        fetchMyRequests();
    }, [router]);

    const handlePayment = async (requestId: string) => {
        const token = Cookies.get("token");
        if (!token) return;

        setPayingId(requestId);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/payment/pay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    rentalRequestId: requestId,
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.message || "Payment processing failed");
            }

            toast.success("Rent payment successful! Status updated to PAID.");


            setRequests((prev) =>
                prev.map((req) =>
                    req.id === requestId ? { ...req, paymentStatus: "PAID" } : req
                )
            );
        } catch (error: any) {
            toast.error(error.message || "Payment failed");
        } finally {
            setPayingId(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">

            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            <UserCheck className="h-3.5 w-3.5 mr-1" /> Tenant Portal
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Welcome back, {userName}!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track your rental requests, approvals, and lease payments in one place.
                    </p>
                </div>

                <Link href="/properties">
                    <Button className="gap-2">
                        Explore Properties <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {/* Requests Section */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold">My Rental Requests</h2>
                    <p className="text-sm text-muted-foreground">
                        Applications you have submitted to property landlords.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map((n) => (
                            <div key={n} className="h-56 rounded-xl bg-muted animate-pulse" />
                        ))}
                    </div>
                ) : requests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {requests.map((req) => (
                            <Card key={req.id} className="overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-lg line-clamp-1">
                                                {req.property?.title || "Rental Property"}
                                            </CardTitle>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                                <span>{req.property?.location || "Dhaka"}</span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        {req.status === "APPROVED" ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                                            </Badge>
                                        ) : req.status === "REJECTED" ? (
                                            <Badge variant="destructive" className="gap-1">
                                                <XCircle className="h-3.5 w-3.5" /> Rejected
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="gap-1 text-amber-600 bg-amber-500/10 border-amber-500/20">
                                                <Hourglass className="h-3.5 w-3.5 animate-spin" /> Pending
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 pb-3 text-sm">
                                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-lg text-xs">
                                        <div>
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" /> Move-in Date
                                            </span>
                                            <p className="font-semibold mt-0.5">
                                                {new Date(req.moveInDate).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" /> Lease Duration
                                            </span>
                                            <p className="font-semibold mt-0.5">{req.rentalDuration} Months</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs pt-1">
                                        <span className="text-muted-foreground">Monthly Rent:</span>
                                        <span className="font-bold text-base text-primary">
                                            ${req.property?.price} / mo
                                        </span>
                                    </div>

                                    {/* Payment Status Row */}
                                    <div className="flex items-center justify-between text-xs pt-2 border-t">
                                        <span className="text-muted-foreground">Payment Status:</span>
                                        {req.paymentStatus === "PAID" ? (
                                            <Badge className="bg-emerald-500 text-white font-medium">
                                                PAID ✓
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">
                                                UNPAID
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-2 border-t bg-muted/10">
                                    {req.status === "APPROVED" && req.paymentStatus === "UNPAID" ? (
                                        <Button
                                            onClick={() => handlePayment(req.id)}
                                            disabled={payingId === req.id}
                                            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            {payingId === req.id ? "Processing Stripe..." : `Pay Rent ($${req.property?.price})`}
                                        </Button>
                                    ) : req.paymentStatus === "PAID" ? (
                                        <div className="w-full text-center text-xs text-emerald-600 font-semibold py-1">
                                            Lease Confirmed & Paid
                                        </div>
                                    ) : req.status === "REJECTED" ? (
                                        <div className="w-full text-center text-xs text-destructive py-1">
                                            Landlord declined this request
                                        </div>
                                    ) : (
                                        <div className="w-full text-center text-xs text-muted-foreground py-1">
                                            Awaiting landlord approval before payment
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-muted/20 border border-dashed rounded-xl">
                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-semibold">No rental requests yet</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                            You haven't requested any properties yet. Browse our active listings to find your next home!
                        </p>
                        <Link href="/properties">
                            <Button className="mt-4 gap-2">Browse Properties</Button>
                        </Link>
                    </div>
                )}
            </div>

        </div>
    );
}
