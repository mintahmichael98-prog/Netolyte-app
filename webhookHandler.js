// webhookHandler.js

const bodyParser = require('body-parser');
const queries = require('./db/queries'); 

const handleClerkWebhook = async (req, res) => { 
    let payload;
    try {
        payload = JSON.parse(req.body.toString());
    } catch (e) {
        return res.status(400).send('Invalid JSON');
    }

    const { type, data } = payload;

    // 1. Organizations
    if (type === 'organization.created') {
        await queries.createTeam(data.id, data.name);
    } 
    
    // 2. Users
    else if (type === 'user.created') {
        const email = data.email_addresses[0]?.email_address;
        await queries.createUser(data.id, email, data.first_name, data.last_name);
    } 
    else if (type === 'user.updated') {
        const email = data.email_addresses[0]?.email_address;
        await queries.updateUser(data.id, email, data.first_name, data.last_name);
    }

    // 3. Memberships (THE LINK)
    else if (type === 'organizationMembership.created') {
        const clerkUserId = data.public_user_data.user_id;
        const clerkOrgId = data.organization.id;
        const role = data.role;

        try {
            await queries.createMembership(clerkUserId, clerkOrgId, role);
            console.log(`[Webhook] Linked User ${clerkUserId} to Org ${clerkOrgId}`);
        } catch (err) {
            console.error('[Webhook Error] Membership Link Failed:', err);
        }
    }
    
    else if (type === 'organizationMembership.deleted') {
        const clerkUserId = data.public_user_data.user_id;
        const clerkOrgId = data.organization.id;
        await queries.deleteMembership(clerkUserId, clerkOrgId);
    }

    res.status(200).send('OK'); 
};

module.exports = { webhookParser: bodyParser.raw({ type: 'application/json' }), handleClerkWebhook };
