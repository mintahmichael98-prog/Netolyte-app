import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/',                 // Your home page
  '/sign-in(.*)',      // Clerk sign-in
  '/sign-up(.*)',      // Clerk sign-up
]);

export default clerkMiddleware(async (auth, request) => {
  // 2. Protect all routes EXCEPT the ones defined above
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // 3. Skip Next.js internals and all static files (images, favicon, etc.)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 4. Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
