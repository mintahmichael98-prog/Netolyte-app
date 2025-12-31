import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define routes that do NOT require login
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/',            // Landing page
  '/api/public(.*)' 
]);

export default clerkMiddleware(async (auth, request) => {
  // 2. Add a safety check for the Secret Key to prevent silent crashes
  if (!process.env.CLERK_SECRET_KEY) {
    console.error("Missing CLERK_SECRET_KEY in Environment Variables");
  }

  // 3. Protect routes: If not public, require authentication
  if (!isPublicRoute(request)) {
    // In Next.js 15, we MUST await the auth() object
    const authObject = await auth();
    
    if (!authObject.userId) {
      // Redirect to sign-in if the user is not logged in
      return authObject.redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    // This regex skips internal Next.js files and static assets
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
