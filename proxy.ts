import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const role = request.cookies.get("role")?.value;
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/dashboard") && !token) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (pathname.startsWith("/dashboard/landlord") && role !== "LANDLORD") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (pathname.startsWith("/dashboard/tenant") && role !== "TENANT") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if ((pathname === "/auth/login" || pathname === "/auth/register") && token) {
        if (role === "ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
        if (role === "LANDLORD") return NextResponse.redirect(new URL("/dashboard/landlord", request.url));
        return NextResponse.redirect(new URL("/dashboard/tenant", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/auth/login", "/auth/register"],
};
