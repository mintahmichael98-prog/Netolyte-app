// --- MOCK BACKEND SERVICE ---
// In a real app, this would be replaced by Supabase/Firebase calls.
const STORAGE_KEY_USER = 'leadgenius_user';
const STORAGE_KEY_TRANSACTIONS = 'leadgenius_transactions';
const STORAGE_KEY_TEAM = 'leadgenius_team';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getMockTeam = () => {
    const saved = localStorage.getItem(STORAGE_KEY_TEAM);
    if (saved)
        return JSON.parse(saved);
    const defaults = [
        { id: '1', email: 'admin@leadgenius.ai', name: 'Admin User', credits: 1000, plan: 'enterprise', role: 'admin', createdAt: new Date().toISOString(), status: 'online' },
        { id: '2', email: 'sarah@leadgenius.ai', name: 'Sarah Sales', credits: 500, plan: 'pro', role: 'user', createdAt: new Date().toISOString(), status: 'away' },
        { id: '3', email: 'mike@leadgenius.ai', name: 'Mike Market', credits: 200, plan: 'free', role: 'user', createdAt: new Date().toISOString(), status: 'online' },
    ];
    localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(defaults));
    return defaults;
};
export const authService = {
    // Simulate Login/Signup with Provider logic
    login: async (email, provider = 'email') => {
        // Simulate network authentication delay
        await delay(1500);
        // Normalize email
        const normalizedEmail = email.toLowerCase();
        const existing = localStorage.getItem(`${STORAGE_KEY_USER}_${normalizedEmail}`);
        // Simulate Email Verification check for new corporate emails
        if (provider === 'email' && !existing && !normalizedEmail.endsWith('@gmail.com') && !normalizedEmail.endsWith('@yahoo.com')) {
            // Just a simulation of a check
            console.log("Verifying corporate domain...");
            await delay(500);
        }
        if (existing) {
            return JSON.parse(existing);
        }
        else {
            // Generate realistic mock data based on provider
            let name = normalizedEmail.split('@')[0];
            name = name.charAt(0).toUpperCase() + name.slice(1);
            let avatar = '';
            if (provider === 'google') {
                avatar = `https://ui-avatars.com/api/?name=${name}&background=DB4437&color=fff`;
            }
            else if (provider === 'linkedin') {
                avatar = `https://ui-avatars.com/api/?name=${name}&background=0077B5&color=fff`;
            }
            else {
                avatar = `https://ui-avatars.com/api/?name=${name}&background=random`;
            }
            // New User Signup
            const newUser = {
                id: Date.now().toString(),
                email: normalizedEmail,
                name,
                credits: 50, // Sign up bonus
                plan: 'free',
                createdAt: new Date().toISOString(),
                role: 'admin', // Default to admin for demo so they can see everything
                status: 'online',
                avatar
            };
            localStorage.setItem(`${STORAGE_KEY_USER}_${normalizedEmail}`, JSON.stringify(newUser));
            // Record initial transaction
            const tx = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                type: 'bonus',
                amount: 50,
                description: 'Welcome Bonus'
            };
            const txs = [tx];
            localStorage.setItem(`${STORAGE_KEY_TRANSACTIONS}_${normalizedEmail}`, JSON.stringify(txs));
            return newUser;
        }
    },
    // Get User Profile
    getUser: async (email) => {
        // await delay(200);
        const userStr = localStorage.getItem(`${STORAGE_KEY_USER}_${email}`);
        if (!userStr)
            throw new Error("User not found");
        return JSON.parse(userStr);
    },
    // Simulate Credit Deduction
    deductCredits: async (email, amount, description) => {
        // await delay(200);
        const userStr = localStorage.getItem(`${STORAGE_KEY_USER}_${email}`);
        if (!userStr)
            throw new Error("User not found");
        const user = JSON.parse(userStr);
        if (user.credits < amount) {
            throw new Error("Insufficient credits");
        }
        user.credits -= amount;
        localStorage.setItem(`${STORAGE_KEY_USER}_${email}`, JSON.stringify(user));
        // Log Transaction
        const tx = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: 'search',
            amount: -amount,
            description
        };
        authService.addTransaction(email, tx);
        return user;
    },
    // Simulate Buying Credits
    addCredits: async (email, amount, plan) => {
        await delay(1000);
        const userStr = localStorage.getItem(`${STORAGE_KEY_USER}_${email}`);
        if (!userStr)
            throw new Error("User not found");
        const user = JSON.parse(userStr);
        user.credits += amount;
        user.plan = plan; // Upgrade plan
        localStorage.setItem(`${STORAGE_KEY_USER}_${email}`, JSON.stringify(user));
        const tx = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: 'purchase',
            amount: amount,
            description: `Purchased ${plan.toUpperCase()} Plan`
        };
        authService.addTransaction(email, tx);
        return user;
    },
    getTransactions: (email) => {
        const txs = localStorage.getItem(`${STORAGE_KEY_TRANSACTIONS}_${email}`);
        return txs ? JSON.parse(txs) : [];
    },
    addTransaction: (email, tx) => {
        const txs = authService.getTransactions(email);
        txs.unshift(tx); // Add to top
        localStorage.setItem(`${STORAGE_KEY_TRANSACTIONS}_${email}`, JSON.stringify(txs));
    },
    getTeamMembers: async () => {
        await delay(500);
        return getMockTeam();
    },
    inviteMember: async (email, role) => {
        await delay(500);
        const team = getMockTeam();
        if (team.find(m => m.email === email)) {
            throw new Error("User already in team");
        }
        const newUser = {
            id: Date.now().toString(),
            email,
            name: email.split('@')[0],
            credits: 0,
            plan: 'free',
            role,
            createdAt: new Date().toISOString(),
            status: 'offline'
        };
        team.push(newUser);
        localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(team));
    },
    updateStatus: async (email, status) => {
        // await delay(100);
        const userStr = localStorage.getItem(`${STORAGE_KEY_USER}_${email}`);
        if (!userStr)
            throw new Error("User not found");
        const user = JSON.parse(userStr);
        user.status = status;
        localStorage.setItem(`${STORAGE_KEY_USER}_${email}`, JSON.stringify(user));
        // Also update in team list for demo
        const teamStr = localStorage.getItem(STORAGE_KEY_TEAM);
        if (teamStr) {
            const team = JSON.parse(teamStr);
            const idx = team.findIndex(u => u.id === user.id);
            if (idx !== -1) {
                team[idx].status = status;
                localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(team));
            }
        }
        return user;
    },
    logout: () => {
        // Just client side cleanup
    }
};
