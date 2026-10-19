"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
    ShieldCheck,
    Users,
    Building2,
    UserCheck,
    UserX,
    Trash2,
    Search,
    MapPin,
    ExternalLink,
    ShieldAlert
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "LANDLORD" | "TENANT";
    isActive: boolean;
    createdAt: string;
}

interface Property {
    id: string;
    title: string;
    price: number;
    location: string;
    landlord?: {
        name: string;
        email: string;
    };
}

export default function AdminDashboard() {
    const router = useRouter();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    const [activeTab, setActiveTab] = useState<"USERS" | "PROPERTIES">("USERS");


    const [searchUserQuery, setSearchUserQuery] = useState("");
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = Cookies.get("token");
        const role = Cookies.get("role");

        if (!token || role !== "ADMIN") {
            toast.error("Unauthorized: Admin privileges required");
            router.push("/auth/login");
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

        async function fetchAdminData() {
            try {

                const [usersRes, propsRes] = await Promise.all([
                    fetch(`${apiUrl}/admin/users`, {
                        headers: { Authorization: token as string },
                    }),
                    fetch(`${apiUrl}/properties`),
                ]);

                const [usersJson, propsJson] = await Promise.all([
                    usersRes.json(),
                    propsRes.json(),
                ]);

                if (usersJson.success && usersJson.data) {
                    setUsers(usersJson.data);
                }

                if (propsJson.success && propsJson.data) {
                    setProperties(propsJson.data);
                }
            } catch (error) {
                console.error("Failed to load admin data:", error);
                toast.error("Failed to load platform data");
            } finally {
                setIsLoading(false);
            }
        }

        fetchAdminData();
    }, [router]);


    const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
        const token = Cookies.get("token");
        if (!token) return;

        setUpdatingUserId(userId);
        const newStatus = !currentStatus;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/admin/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ isActive: newStatus }),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.message || "Failed to update user status");
            }

            toast.success(newStatus ? "User reactivated successfully" : "User suspended/banned");


            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u))
            );
        } catch (error: any) {
            toast.error(error.message || "Action failed");
        } finally {
            setUpdatingUserId(null);
        }
    };


    const handleDeleteProperty = async (propertyId: string) => {
        const token = Cookies.get("token");
        if (!token || !confirm("Admin Action: Delete this listing from RentNest?")) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/properties/${propertyId}`, {
                method: "DELETE",
                headers: { Authorization: token },
            });

            if (!res.ok) throw new Error("Failed to delete property");

            toast.success("Listing removed by administrator");
            setProperties((prev) => prev.filter((p) => p.id !== propertyId));
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        }
    };


    const filteredUsers = users.filter((u) => {
        const q = searchUserQuery.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
    });

    const totalLandlords = users.filter((u) => u.role === "LANDLORD").length;
    const totalTenants = users.filter((u) => u.role === "TENANT").length;

    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b">
                <div>
                    <Badge className="bg-primary text-primary-foreground mb-2 flex items-center w-fit gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Administrator Control Center
                    </Badge>
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Platform Management & Moderation
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor accounts, manage user access, and oversee rental listings.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 bg-muted p-1 rounded-xl">
                    <Button
                        size="sm"
                        variant={activeTab === "USERS" ? "default" : "ghost"}
                        onClick={() => setActiveTab("USERS")}
                        className="text-xs sm:text-sm"
                    >
                        Users ({users.length})
                    </Button>

                    <Button
                        size="sm"
                        variant={activeTab === "PROPERTIES" ? "default" : "ghost"}
                        onClick={() => setActiveTab("PROPERTIES")}
                        className="text-xs sm:text-sm"
                    >
                        Listings ({properties.length})
                    </Button>
                </div>
            </div>

            {/* ===================== OVERVIEW KPI CARDS ===================== */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <Card className="bg-card shadow-xs">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                            <span>Total Accounts</span>
                            <Users className="h-4 w-4 text-primary" />
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold">{users.length}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        {totalTenants} Tenants &bull; {totalLandlords} Landlords
                    </CardContent>
                </Card>

                <Card className="bg-card shadow-xs">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                            <span>Active Listings</span>
                            <Building2 className="h-4 w-4 text-primary" />
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold">{properties.length}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Published properties on marketplace
                    </CardContent>
                </Card>

                <Card className="bg-card shadow-xs">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
                            <span>Security Status</span>
                            <ShieldAlert className="h-4 w-4 text-emerald-500" />
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold text-emerald-600">Secure</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        JWT Role-based Access Active
                    </CardContent>
                </Card>
            </div>

            {/* ===================== TAB 1: USER MANAGEMENT ===================== */}
            {activeTab === "USERS" && (
                <Card className="shadow-xs">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl">User Directory & Status</CardTitle>
                                <CardDescription>
                                    View and manage permissions for all registered platform accounts.
                                </CardDescription>
                            </div>

                            {/* User Search Bar */}
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter users..."
                                    value={searchUserQuery}
                                    onChange={(e) => setSearchUserQuery(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((n) => (
                                    <div key={n} className="h-14 bg-muted rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b">
                                        <tr>
                                            <th className="py-3 px-4">User</th>
                                            <th className="py-3 px-4">Role</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4">Joined</th>
                                            <th className="py-3 px-4 text-right">Moderation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-muted/30 transition">
                                                <td className="py-3.5 px-4 font-medium">
                                                    <div>{u.name}</div>
                                                    <div className="text-xs text-muted-foreground">{u.email}</div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            u.role === "ADMIN"
                                                                ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                                                : u.role === "LANDLORD"
                                                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                        }
                                                    >
                                                        {u.role}
                                                    </Badge>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    {u.isActive ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 font-normal text-xs">
                                                            <UserCheck className="h-3 w-3" /> Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="gap-1 font-normal text-xs">
                                                            <UserX className="h-3 w-3" /> Suspended
                                                        </Badge>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 text-xs text-muted-foreground">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>

                                                <td className="py-3.5 px-4 text-right">
                                                    {u.role !== "ADMIN" && (
                                                        <Button
                                                            size="sm"
                                                            variant={u.isActive ? "destructive" : "outline"}
                                                            className="text-xs h-8 gap-1"
                                                            disabled={updatingUserId === u.id}
                                                            onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                                                        >
                                                            {u.isActive ? (
                                                                <>
                                                                    <UserX className="h-3.5 w-3.5" /> Ban
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Activate
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground text-sm">
                                No users found matching your search.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ===================== TAB 2: PROPERTY MODERATION ===================== */}
            {activeTab === "PROPERTIES" && (
                <Card className="shadow-xs">
                    <CardHeader>
                        <CardTitle className="text-xl">Platform Listings Moderation</CardTitle>
                        <CardDescription>
                            Review all properties submitted across the site. Delete any fraudulent or duplicate listings.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {properties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map((p) => (
                                    <Card key={p.id} className="overflow-hidden flex flex-col justify-between border hover:shadow-xs">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base line-clamp-1">{p.title}</CardTitle>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                                <span>{p.location}</span>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pb-3 text-xs text-muted-foreground space-y-1">
                                            <div className="font-bold text-base text-primary">${p.price} / mo</div>
                                            {p.landlord && (
                                                <div>Owner: <strong>{p.landlord.name}</strong> ({p.landlord.email})</div>
                                            )}
                                        </CardContent>

                                        <CardFooter className="pt-2 border-t flex justify-between gap-2">
                                            <Link href={`/properties/${p.id}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                                                    <ExternalLink className="h-3.5 w-3.5" /> View
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="px-3"
                                                onClick={() => handleDeleteProperty(p.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground text-sm">
                                No active properties listed on the platform.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
