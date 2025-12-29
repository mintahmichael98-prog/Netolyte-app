import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that don't need login (sign-in, sign-up, etc.)
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    // This 'await' is required in Next.js 15
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // This complex regex is required to skip internal Next.js files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
