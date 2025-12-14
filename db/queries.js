// db/queries.js

const { Pool } = require('pg');

// Configuration for the PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // Ensure the correct schema is used for finding the 'teams' table
    options: '-c search_path=public' 
});

// Simple query function to run any SQL query
const query = (text, params) => pool.query(text, params);

// Function used by the Webhook to save a new team
const createTeam = async (clerkOrgId, name) => {
    // FINAL FIX: Targets the 'clerk_id' column for the Clerk ID value (TEXT type)
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

// Example: Function to get all customers for a specific team
const getCustomersByTeamId = async (teamId) => {
    const text = 'SELECT * FROM customers WHERE team_id = $1';
    const values = [teamId];
    const result = await query(text, values);
    return result.rows;
};


module.exports = {
    pool,
    query,
    getCustomersByTeamId,
    createTeam,
    // Add other core functions here
};