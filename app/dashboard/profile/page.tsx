"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
    User,
    Mail,
    Phone,
    FileText,
    Camera,
    Save,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "LANDLORD" | "TENANT";
    profileImage?: string | null;
    bio?: string | null;
    contactNumber?: string | null;
}

export default function ProfilePage() {
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form Fields
    const [name, setName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [bio, setBio] = useState("");

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            toast.error("Please login to view your profile");
            router.push("/auth/login");
            return;
        }

        async function fetchProfile() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                const res = await fetch(`${apiUrl}/me`, {
                    headers: { Authorization: token as string },
                });

                const json = await res.json();
                if (json.success && json.data) {
                    const user = json.data;
                    setProfile(user);
                    setName(user.name || "");
                    setContactNumber(user.contactNumber || "");
                    setProfileImage(user.profileImage || "");
                    setBio(user.bio || "");
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
                toast.error("Failed to fetch profile details");
            } finally {
                setIsLoading(false);
            }
        }

        fetchProfile();
    }, [router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = Cookies.get("token");
        if (!token) return;

        setIsSaving(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
            const res = await fetch(`${apiUrl}/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({
                    name,
                    contactNumber: contactNumber || undefined,
                    profileImage: profileImage || undefined,
                    bio: bio || undefined,
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.message || "Failed to update profile");
            }

            toast.success("Profile updated successfully!");

            if (json.data) {
                setProfile(json.data);

                const currentCookie = Cookies.get("user");
                let parsed = {};
                if (currentCookie) {
                    try { parsed = JSON.parse(currentCookie); } catch (e) { }
                }
                Cookies.set("user", JSON.stringify({ ...parsed, name: json.data.name }));
            }
        } catch (error: any) {
            toast.error(error.message || "Update failed");
        } finally {
            setIsSaving(false);
        }
    };

    const getDashboardUrl = () => {
        if (profile?.role === "ADMIN") return "/dashboard/admin";
        if (profile?.role === "LANDLORD") return "/dashboard/landlord";
        return "/dashboard/tenant";
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-4xl animate-pulse">
                <div className="h-8 w-48 bg-muted rounded mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="h-64 bg-muted rounded-xl" />
                    <div className="md:col-span-2 h-96 bg-muted rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-5xl">

            {/* Navigation Breadcrumb */}
            <div className="mb-6">
                <Link
                    href={getDashboardUrl()}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                {/*  LEFT COLUMN (AVATAR CARD) */}
                <div className="md:col-span-4 space-y-6">
                    <Card className="text-center shadow-xs">
                        <CardContent className="pt-8 pb-6 flex flex-col items-center">

                            {/* Profile Image Avatar */}
                            <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-primary/20 bg-muted mb-4 flex items-center justify-center">
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt={name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User className="h-14 w-14 text-muted-foreground stroke-[1.5]" />
                                )}
                            </div>

                            <h2 className="text-xl font-bold">{profile?.name}</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{profile?.email}</p>

                            {/* Role Badge */}
                            <div className="mt-3">
                                <Badge
                                    variant="outline"
                                    className={
                                        profile?.role === "ADMIN"
                                            ? "bg-purple-500/10 text-purple-600 border-purple-500/20 font-semibold"
                                            : profile?.role === "LANDLORD"
                                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20 font-semibold"
                                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold"
                                    }
                                >
                                    <ShieldCheck className="h-3.5 w-3.5 mr-1" /> {profile?.role}
                                </Badge>
                            </div>

                            <div className="w-full mt-6 pt-6 border-t text-left text-xs space-y-2.5 text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <span>Account Status:</span>
                                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Active & Verified
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Member Since:</span>
                                    <span className="font-medium text-foreground">2026</span>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/*  RIGHT COLUMN (EDIT DETAILS FORM)  */}
                <div className="md:col-span-8">
                    <Card className="shadow-xs">
                        <CardHeader>
                            <CardTitle className="text-xl">Account Settings</CardTitle>
                            <CardDescription>
                                Update your personal information and contact details.
                            </CardDescription>
                        </CardHeader>

                        <form onSubmit={handleUpdateProfile}>
                            <CardContent className="space-y-4">

                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-1.5">
                                        <User className="h-4 w-4 text-primary" /> Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your legal name"
                                    />
                                </div>

                                {/* Email (Readonly) */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-1.5">
                                        <Mail className="h-4 w-4 text-muted-foreground" /> Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        disabled
                                        value={profile?.email || ""}
                                        className="bg-muted/50 cursor-not-allowed"
                                    />
                                    <p className="text-[11px] text-muted-foreground">
                                        Email address is tied to your account credentials and cannot be changed.
                                    </p>
                                </div>

                                {/* Contact Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4 text-primary" /> Contact Phone
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        placeholder="e.g. +880 1712 345678"
                                    />
                                </div>

                                {/* Avatar URL */}
                                <div className="space-y-2">
                                    <Label htmlFor="image" className="flex items-center gap-1.5">
                                        <Camera className="h-4 w-4 text-primary" /> Profile Picture URL
                                    </Label>
                                    <Input
                                        id="image"
                                        value={profileImage}
                                        onChange={(e) => setProfileImage(e.target.value)}
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="flex items-center gap-1.5">
                                        <FileText className="h-4 w-4 text-primary" /> About You (Bio)
                                    </Label>
                                    <Input
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="A brief intro about your profession or rental preferences..."
                                    />
                                </div>

                            </CardContent>

                            <CardFooter className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="submit" disabled={isSaving} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

            </div>
        </div>
    );
}
