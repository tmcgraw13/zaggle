import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

  // Allow access to the offline page itself
  if (request.nextUrl.pathname === "/offline") {
    return NextResponse.next();
  }

  // Redirect all other routes to offline page during maintenance
  if (isMaintenanceMode) {
    return NextResponse.redirect(new URL("/offline", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|characters|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
