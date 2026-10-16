"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Home, LogOut, LayoutDashboard, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        const userToken = Cookies.get("token");
        const userRole = Cookies.get("role");
        const userData = Cookies.get("user");

        setToken(userToken || null);
        setRole(userRole || null);
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                setUserName(parsed.name || null);
            } catch (e) {
                setUserName(null);
            }
        } else {
            setUserName(null);
        }
    }, [pathname]);

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("role");
        Cookies.remove("user");
        setToken(null);
        setRole(null);
        setUserName(null);
        toast.success("Logged out successfully");
        router.push("/auth/login");
    }
    const getDashboardLink = () => {
        if (role === "ADMIN") return "/dashboard/admin";
        if (role === "LANDLORD") return "/dashboard/landlord";
        return "/dashboard/tenant";
    }
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/*Brand/ Logo=*/}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Home className="h-6 w-6" />
                    <span>RentNest</span>
                </Link>
                {/*Navigation Links*/}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/properties" className="text-muted-foreground transition hover:text-foreground">
                        Browse Properties
                    </Link>
                </nav>
                {/*Right side: Auth Actions*/}
                <div className="flex items-center gap-3">
                    {token ? (
                        // --- Logged In State ---
                        <>
                            {userName && (
                                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>{userName}</span>
                                </div>
                            )}
                            {role && (
                                <Badge variant="outline" className="hidden sm:inline-flex">
                                    {role}

                                </Badge>
                            )}
                            <Link href={getDashboardLink()}>
                                <Button size="sm" className="gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>

                            <Button size="sm" variant="ghost" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </>
                    ) : (
                        // --- Logged Out State ---
                        <>
                            <Link href="/auth/login">
                                <Button size="sm" variant="ghost">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button size="sm">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}