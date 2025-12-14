// webhookHandler.js

const bodyParser = require('body-parser');
const queries = require('./db/queries'); // Database functions

// Important: Use your actual Clerk Webhook Secret!
// Omitted for brevity: const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

// Use raw body for verification
const webhookParser = bodyParser.raw({ type: 'application/json' });

// The handler function that Clerk will call
const handleClerkWebhook = async (req, res) => { // <-- FIX 1: Made function ASYNC
    // 1. Verify the signature (Crucial Security Step)
    // ...

    // 2. Parse the body to get the event data
    const payload = JSON.parse(req.body.toString());
    const { type, data } = payload;

    // 3. Handle the 'Organization Created' event
    if (type === 'organization.created') {
        const { id: clerkOrgId, name } = data;

        try {
            // FIX 2: AWAIT the database operation
            // FIX 3: Changed 'clerk_org_id' to the correct column name 'id'
            await queries.query( 
                'INSERT INTO teams (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
                [clerkOrgId, name]
            );
            
            console.log(`[Webhook] Successfully created team: ${name} (${clerkOrgId})`);

        } catch (err) {
            // If the insertion fails (e.g., table not found), we now catch it and log it
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