// webhookHandler.js

const bodyParser = require('body-parser');
const queries = require('./db/queries'); // Database functions

// Important: Use your actual Clerk Webhook Secret!
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET; 

// Use raw body for verification
const webhookParser = bodyParser.raw({ type: 'application/json' });

// The handler function that Clerk will call
const handleClerkWebhook = async (req, res) => {
    // 1. Verify the signature (Crucial Security Step)
    // NOTE: For brevity, the actual verification logic using 'svix' or equivalent is omitted here.
    // If you were using svix, the verification would go here.

    // 2. Parse the body to get the event data
    const payload = JSON.parse(req.body.toString());
    const { type, data } = payload;

    // 3. Handle the 'Organization Created' event
    if (type === 'organization.created') {
        const { id: clerkOrgId, name } = data; // clerkOrgId is e.g., "org_2g7..."

        try {
            // FIX: Insert into 'clerk_id' column, not 'id'.
            // Use ON CONFLICT (clerk_id) since that is the unique TEXT column.
            await queries.query( 
                'INSERT INTO teams (clerk_id, name) VALUES ($1, $2) ON CONFLICT (clerk_id) DO NOTHING',
                [clerkOrgId, name]
            );
            
            console.log(`[Webhook] Successfully created team: ${name} (${clerkOrgId})`);

        } catch (err) {
            // Log the detailed error from the database
            console.error('[Webhook Error] Failed to create team in DB:', err);
            // And send an error response so Clerk knows it failed
            return res.status(500).send('Database operation failed.');
        }
    }

    // 4. Handle other events (e.g., organization.updated) as needed...

    // Only send success after the database operation has succeeded (or if no DB operation was needed)
    res.status(200).send('Webhook received successfully'); 
};

module.exports = { webhookParser, handleClerkWebhook };