// db/queries.js
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    options: '-c search_path=public' 
});

const query = (text, params) => pool.query(text, params);

// --- AUTH SYNC FUNCTIONS (Teams, Users, Memberships) ---
const createTeam = async (clerkOrgId, name) => {
    const text = `INSERT INTO teams(clerk_id, name) VALUES($1, $2) ON CONFLICT (clerk_id) DO NOTHING RETURNING *`;
    return (await query(text, [clerkOrgId, name])).rows[0];
};

const createUser = async (clerkUserId, email, firstName, lastName) => {
    const text = `INSERT INTO users(clerk_user_id, email, first_name, last_name) VALUES($1, $2, $3, $4) ON CONFLICT (clerk_user_id) DO NOTHING RETURNING *`;
    return (await query(text, [clerkUserId, email, firstName, lastName])).rows[0];
};

const updateUser = async (clerkUserId, email, firstName, lastName) => {
    const text = `UPDATE users SET email = $2, first_name = $3, last_name = $4, updated_at = NOW() WHERE clerk_user_id = $1 RETURNING *`;
    return (await query(text, [clerkUserId, email, firstName, lastName])).rows[0];
};

const createMembership = async (clerkUserId, clerkOrgId, role) => {
    const text = `INSERT INTO memberships(clerk_user_id, clerk_org_id, role) VALUES($1, $2, $3) ON CONFLICT (clerk_user_id, clerk_org_id) DO UPDATE SET role = $3 RETURNING *`;
    return (await query(text, [clerkUserId, clerkOrgId, role])).rows[0];
};

const updateMembershipRole = async (clerkUserId, clerkOrgId, role) => {
    const text = `UPDATE memberships SET role = $3, updated_at = NOW() WHERE clerk_user_id = $1 AND clerk_org_id = $2 RETURNING *`;
    return (await query(text, [clerkUserId, clerkOrgId, role])).rows[0];
};

const deleteMembership = async (clerkUserId, clerkOrgId) => {
    const text = `DELETE FROM memberships WHERE clerk_user_id = $1 AND clerk_org_id = $2`;
    await query(text, [clerkUserId, clerkOrgId]);
};

// --- MULTI-TENANT PROJECT FUNCTIONS ---

const createProject = async (name, description, clerkOrgId) => {
    const text = `INSERT INTO projects(name, description, team_id) VALUES($1, $2, $3) RETURNING *`;
    const result = await query(text, [name, description, clerkOrgId]);
    return result.rows[0];
};

const getProjectsForUser = async (clerkUserId, clerkOrgId) => {
    const text = `
        SELECT p.* FROM projects p
        JOIN memberships m ON p.team_id = m.clerk_org_id
        WHERE m.clerk_user_id = $1 
        AND m.clerk_org_id = $2
    `;
    const result = await query(text, [clerkUserId, clerkOrgId]);
    return result.rows;
};

module.exports = {
    pool, query, createTeam, createUser, updateUser, 
    createMembership, updateMembershipRole, deleteMembership,
    createProject, getProjectsForUser
};
