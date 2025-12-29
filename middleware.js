import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define exactly which routes are public
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    // auth.protect() is the modern way to handle this in Next 15
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // This matcher excludes static files and internal Next.js paths
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
