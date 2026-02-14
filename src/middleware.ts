import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
// Clerk keys are pk_test_<base64> or pk_live_<base64> and always 50+ chars.
// This rejects placeholder values like "pk_test_REPLACE_ME".
const isClerkEnabled =
  !!clerkKey &&
  /^pk_(test|live)_[A-Za-z0-9]{20,}/.test(clerkKey);

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/terms(.*)",
  "/api/webhooks(.*)",
  "/mognadmatning/survey/(.*)",
  "/ai-mognadmatning/survey/(.*)",
  "/api/assessments/sessions/by-token/(.*)",
]);

// When Clerk is not configured, allow all requests through
function noAuthMiddleware(_request: NextRequest) {
  return NextResponse.next();
}

// When Clerk is configured, protect non-public routes
const authMiddleware = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export default isClerkEnabled ? authMiddleware : noAuthMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
