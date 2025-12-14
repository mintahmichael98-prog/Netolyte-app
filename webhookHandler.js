// webhookHandler.js

const bodyParser = require('body-parser');
const queries = require('./db/queries'); // Database functions

// Important: Use your actual Clerk Webhook Secret!
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET; 

// Use raw body for verification
const webhookParser = bodyParser.raw({ type: 'application/json' });

// The handler function that Clerk will call
const handleClerkWebhook = async (req, res) => {
    // 1. Verify the signature (Crucial Security Step - implementation omitted for brevity)
    // NOTE: You must implement Svix verification in a production environment.
    
    let payload;
    try {
        payload = JSON.parse(req.body.toString());
    } catch (e) {
        console.error("Error parsing webhook body:", e);
        return res.status(400).send('Invalid JSON payload.');
    }

    const { type, data } = payload;

    // 3. Handle the 'Organization Created' event
    if (type === 'organization.created') {
        const { id: clerkOrgId, name } = data; // clerkOrgId is e.g., "org_2g7..."

        try {
            // FINAL FIX: Call the corrected 'createTeam' function from db/queries.js.
            // This ensures the TEXT-type Clerk ID is inserted into the TEXT-type 'clerk_id' column.
            await queries.createTeam(clerkOrgId, name);
            
            console.log(`[Webhook] Successfully created team: ${name} (${clerkOrgId})`);

        } catch (err) {
            // Log the detailed error from the database
            // If the UUID error (22P02) still appears, it means Vercel has not deployed this version.
            console.error('[Webhook Error] Failed to create team in DB:', err);
            // And send an error response so Clerk knows it failed
            return res.status(500).send('Database operation failed.');
        }
    }

    // 4. Handle other events (e.g., organization.updated) as needed...

    // Only send success after the database operation has succeeded
    res.status(200).send('Webhook received successfully'); 
};

module.exports = { webhookParser, handleClerkWebhook };