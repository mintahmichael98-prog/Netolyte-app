const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const queries = require('../db/queries');

module.exports = ClerkExpressWithAuth(async (req, res) => {
    const { userId, orgId } = req.auth;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!orgId) {
        return res.status(400).json({ error: "No organization selected" });
    }

    try {
        if (req.method === 'GET') {
            const projects = await queries.getProjectsForUser(userId, orgId);
            return res.status(200).json(projects);
        } 
        
        if (req.method === 'POST') {
            const { name, description } = req.body;
            const newProject = await queries.createProject(name, description, orgId);
            return res.status(201).json(newProject);
        }

        return res.status(405).json({ error: "Method not allowed" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});
