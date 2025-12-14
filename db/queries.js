// db/queries.js

const { Pool } = require('pg');

// Configuration for the PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // **NEW FIX:** Explicitly set the search path to ensure 'teams' is found in the 'public' schema
    options: '-c search_path=public' 
});

// Simple query function to run any SQL query
const query = (text, params) => pool.query(text, params);

// --- Core Multi-Tenant Functions (Examples) ---

// Example 1: Function to get all customers for a specific team
const getCustomersByTeamId = async (teamId) => {
    const text = 'SELECT * FROM customers WHERE team_id = $1';
    const values = [teamId];
    const result = await query(text, values);
    return result.rows;
};

// Example 2: Function used by the Webhook to save a new team
const createTeam = async (clerkOrgId, name) => {
    // FINAL FIX: Target the 'clerk_id' column for the Clerk ID value (TEXT type)
    // Use ON CONFLICT (clerk_id) DO NOTHING to prevent errors on re-run.
    const text = `
        INSERT INTO teams(clerk_id, name) 
        VALUES($1, $2) 
        ON CONFLICT (clerk_id) DO NOTHING 
        RETURNING *
    `;
    const values = [clerkOrgId, name];
    const result = await query(text, values);
    return result.rows[0];
};


module.exports = {
    pool,
    query,
    getCustomersByTeamId,
    createTeam,
    // Add other core functions here (e.g., saveMessage, getUsersInTeam, etc.)
};