// middleware/clerkAuth.js

const { Clerk } = require('@clerk/clerk-sdk-node');

// Initialize Clerk with your secret key from your .env file
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// Middleware function to check for authentication
const requireAuth = async (req, res, next) => {
    try {
        // 1. Get the session token from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authorization token missing.' });
        }

        // 2. Verify the session token using Clerk
        const client = await clerk.verifyToken(token);

        if (!client) {
            return res.status(401).json({ error: 'Invalid session token.' });
        }

        // 3. Attach user ID and active Organization ID (Team ID) to the request
        req.userId = client.sub;
        req.orgId = client.org; // This is the ID of the team they are currently active in

        // Proceed to the route handler
        next();

    } catch (error) {
        console.error('Clerk Authentication Error:', error.message);
        // Return 401 for generic authentication failures
        return res.status(401).json({ error: 'Authentication failed.' });
    }
};

module.exports = requireAuth;
