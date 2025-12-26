// webhookHandler.js
const { Webhook } = require('svix');
const bodyParser = require('body-parser');
const queries = require('./db/queries'); 

const handleClerkWebhook = async (req, res) => {
    // 1. Grab Svix headers
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
        console.error("Missing Svix headers");
        return res.status(400).send('Error: Missing svix headers');
    }

    // 2. Verify Webhook Signature
    const payload = req.body.toString();
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    const wh = new Webhook(secret);

    let evt;
    try {
        evt = wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error('Webhook verification failed:', err.message);
        return res.status(400).send('Error: Invalid signature');
    }

    // 3. Extract verified data
    const { type, data } = evt;

    try {
        switch (type) {
            case 'organization.created':
                await queries.createTeam(data.id, data.name);
                console.log(`Synced Team: ${data.name}`);
                break;

            case 'user.created':
                await queries.createUser(
                    data.id, 
                    data.email_addresses[0]?.email_address, 
                    data.first_name, 
                    data.last_name
                );
                console.log(`Synced New User: ${data.id}`);
                break;

            case 'user.updated':
                await queries.updateUser(
                    data.id, 
                    data.email_addresses[0]?.email_address, 
                    data.first_name, 
                    data.last_name
                );
                console.log(`Updated User: ${data.id}`);
                break;

            case 'organizationMembership.created':
                await queries.createMembership(
                    data.public_user_data.user_id, 
                    data.organization.id, 
                    data.role
                );
                console.log(`Created Membership for User: ${data.public_user_data.user_id}`);
                break;

            case 'organizationMembership.updated':
                await queries.updateMembershipRole(
                    data.public_user_data.user_id, 
                    data.organization.id, 
                    data.role
                );
                console.log(`Updated Role to: ${data.role}`);
                break;

            case 'organizationMembership.deleted':
                await queries.deleteMembership(
                    data.public_user_data.user_id, 
                    data.organization.id
                );
                console.log(`Deleted Membership`);
                break;
        }

        res.status(200).send('Webhook processed');
    } catch (err) {
        console.error('Database Sync Error:', err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { 
    webhookParser: bodyParser.raw({ type: 'application/json' }), 
    handleClerkWebhook 
};
