import { ClerkProvider } from "@clerk/nextjs";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
// Clerk keys are pk_test_<base64> or pk_live_<base64> and always 50+ chars.
// This rejects placeholder values like "pk_test_REPLACE_ME".
const isClerkEnabled =
  !!clerkKey &&
  /^pk_(test|live)_[A-Za-z0-9]{20,}/.test(clerkKey);

/**
 * Wraps children in ClerkProvider when Clerk keys are configured.
 * Falls through without auth when keys are missing (dev/local mode).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!isClerkEnabled) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
