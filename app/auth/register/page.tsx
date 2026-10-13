"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("TENANT");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, email, password, role }),
                })

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }
            toast.success("Registration successful");
            router.push("/auth/login");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create an Account</CardTitle>
                    <CardDescription>Join RentNest as a Tenant or Landlord.</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="grid gap-4">

                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Enter your full name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">I want to be a...</Label>
                            <Select value={role} onValueChange={(val) => { if (val) setRole(val); }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TENANT">Tenant (Looking for rental properties)</SelectItem>
                                    <SelectItem value="LANDLORD">Landlord (Listing properties for rent)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </Button>
                        <div className="text-sm text-center text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="underline hover:text-primary">
                                Login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}