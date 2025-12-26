// webhookHandler.js
const bodyParser = require('body-parser');
const queries = require('./db/queries'); 

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

    try {
        switch (type) {
            // 1. ORGANIZATIONS (Teams)
            case 'organization.created':
                await queries.createTeam(data.id, data.name);
                console.log(`[Webhook] Team Created: ${data.name}`);
                break;

            // 2. USERS
            case 'user.created':
                await queries.createUser(
                    data.id, 
                    data.email_addresses[0]?.email_address, 
                    data.first_name, 
                    data.last_name
                );
                console.log(`[Webhook] User Created: ${data.id}`);
                break;

            case 'user.updated':
                await queries.updateUser(
                    data.id, 
                    data.email_addresses[0]?.email_address, 
                    data.first_name, 
                    data.last_name
                );
                console.log(`[Webhook] User Updated: ${data.id}`);
                break;

            // 3. MEMBERSHIPS (The Link)
            case 'organizationMembership.created':
                await queries.createMembership(
                    data.public_user_data.user_id, 
                    data.organization.id, 
                    data.role
                );
                console.log(`[Webhook] Membership Linked: ${data.public_user_data.user_id}`);
                break;

            case 'organizationMembership.updated':
                await queries.updateMembershipRole(
                    data.public_user_data.user_id, 
                    data.organization.id, 
                    data.role
                );
                console.log(`[Webhook] Role Updated: ${data.role}`);
                break;

            case 'organizationMembership.deleted':
                await queries.deleteMembership(
                    data.public_user_data.user_id, 
                    data.organization.id
                );
                console.log(`[Webhook] Membership Deleted`);
                break;

            default:
                console.log(`[Webhook] Unhandled event type: ${type}`);
        }

        res.status(200).send('Webhook processed successfully');

    } catch (err) {
        console.error(`[Webhook Error] Failed processing ${type}:`, err);
        res.status(500).send('Database operation failed.');
    }
};

module.exports = { webhookParser, handleClerkWebhook };
