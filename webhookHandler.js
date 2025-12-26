// webhookHandler.js

const bodyParser = require('body-parser');
const queries = require('./db/queries'); 

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET; 
const webhookParser = bodyParser.raw({ type: 'application/json' });

const handleClerkWebhook = async (req, res) => { 
    let payload;
    try {
        payload = JSON.parse(req.body.toString());
    } catch (e) {
        console.error("Error parsing webhook body:", e);
        return res.status(400).send('Invalid JSON payload.');
    }

    const { type, data } = payload;

    // 1. Handle Organization Created
    if (type === 'organization.created') {
        const { id: clerkOrgId, name } = data; 
        try {
            await queries.createTeam(clerkOrgId, name);
            console.log(`[Webhook] Team Created: ${name}`);
        } catch (err) {
            console.error('[Webhook Error] Team Creation Failed:', err);
            return res.status(500).send('Database error');
        }
    } 
    
    // 2. Handle User Created
    else if (type === 'user.created') {
        const clerkUserId = data.id; 
        const email = data.email_addresses[0]?.email_address;
        const firstName = data.first_name;
        const lastName = data.last_name;

        try {
            await queries.createUser(clerkUserId, email, firstName, lastName);
            console.log(`[Webhook] User Created: ${email}`);
        } catch (err) {
            console.error('[Webhook Error] User Creation Failed:', err);
            return res.status(500).send('Database error');
        }
    }

    // 3. Handle User Updated (NEW)
    else if (type === 'user.updated') {
        const clerkUserId = data.id;
        const email = data.email_addresses[0]?.email_address;
        const firstName = data.first_name;
        const lastName = data.last_name;

        try {
            await queries.updateUser(clerkUserId, email, firstName, lastName);
            console.log(`[Webhook] User Updated: ${clerkUserId}`);
        } catch (err) {
            console.error('[Webhook Error] User Update Failed:', err);
            return res.status(500).send('Database error');
        }
    }

    // Success response to Clerk
    res.status(200).send('Webhook received successfully'); 
};

module.exports = { webhookParser, handleClerkWebhook };
