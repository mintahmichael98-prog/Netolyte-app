// db/queries.js

const { Pool } = require('pg');

// Connection configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    options: '-c search_path=public' 
});

const query = (text, params) => pool.query(text, params);

// --- TEAM FUNCTIONS ---
const createTeam = async (clerkOrgId, name) => {
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

// --- USER FUNCTIONS ---
const createUser = async (clerkUserId, email, firstName, lastName) => {
    const text = `
        INSERT INTO users(clerk_user_id, email, first_name, last_name) 
        VALUES($1, $2, $3, $4) 
        ON CONFLICT (clerk_user_id) DO NOTHING 
        RETURNING *
    `;
    const values = [clerkUserId, email, firstName, lastName];
    const result = await query(text, values);
    return result.rows[0];
};

const updateUser = async (clerkUserId, email, firstName, lastName) => {
    // Updates existing user data based on the Clerk ID
    const text = `
        UPDATE users 
        SET email = $2, first_name = $3, last_name = $4, updated_at = NOW()
        WHERE clerk_user_id = $1
        RETURNING *
    `;
    const values = [clerkUserId, email, firstName, lastName];
    const result = await query(text, values);
    return result.rows[0];
};

// --- UTILITY FUNCTIONS ---
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
    createUser,
    updateUser, // Exported for use in the handler
};
