import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Use Client-side key if server-side isn't available
const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Correct initialization for the 2025 SDK
const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

// Helper to extract text safely from the new SDK response format
const getResponseText = (response) => {
    if (!response) return "";
    return typeof response.text === 'function' ? response.text() : (response.text || "");
};

export const generateLeadsBatch = async (query, batchSize, batchIndex, ignoreList = []) => {
    if (!genAI) throw new Error("Gemini API Key is missing. Check your environment variables.");
    
    const modelId = "gemini-1.5-flash"; // Stable 2025 model
    const exclusionText = ignoreList.length > 0 ? `EXCLUDE these companies: ${ignoreList.slice(-50).join(", ")}.` : "";
    
    const prompt = `
    ROLE: Elite B2B Data Researcher.
    TASK: Find ${batchSize} verified B2B leads matching: "${query}".
    BATCH: #${batchIndex + 1}. ${exclusionText}
    
    REQUIRED JSON STRUCTURE:
    [{
        "company": "string",
        "description": "string",
        "location": "City, Country",
        "website": "string",
        "industry": "string",
        "management": [{ "name": "string", "role": "string", "email": "string" }]
    }]
    `;

    const maxRetries = 4;
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const result = await genAI.models.generateContent({
                model: modelId,
                contents: prompt,
                config: {
                    temperature: 0.3,
                    systemInstruction: "Output strictly valid JSON. No conversational filler.",
                },
            });

            let text = getResponseText(result.response);
            if (!text) throw new Error("Empty response from Gemini");

            // Clean markdown
            text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
            const firstBracket = text.indexOf('[');
            const lastBracket = text.lastIndexOf(']');
            text = text.substring(firstBracket, lastBracket + 1);

            const rawData = JSON.parse(text);
            return rawData.map((l, i) => ({
                ...l,
                id: `lead_${Date.now()}_${i}`,
                status: 'new',
                management: (l.management || []).map(m => ({
                    ...m,
                    email: isValidEmail(m.email) ? m.email : ""
                }))
            }));
        } catch (error) {
            console.warn(`Attempt ${attempt + 1} failed:`, error.message);
            lastError = error;
            const isRateLimit = error.message?.includes('429') || error.message?.includes('quota');
            await delay(isRateLimit ? 65000 : 2000 * (attempt + 1));
        }
    }
    return [];
};

export const generateSalesStrategy = async (productDescription) => {
    if (!genAI) throw new Error("API Key missing");
    const prompt = `Analyze product: "${productDescription}". Return JSON with: icp, painPoints, valueProp, pitch, suggestedSearchQuery.`;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", temperature: 0.7 }
        });
        return JSON.parse(getResponseText(result.response) || "{}");
    } catch (e) {
        console.error("Strategy generation failed", e);
        throw e;
    }
};

export const chatWithPersona = async (lead, history, userInput) => {
    if (!genAI) throw new Error("API Key missing");
    const conversation = history.map(m => `${m.role === 'user' ? 'Sales Rep' : 'Prospect'}: ${m.text}`).join('\n');
    
    const prompt = `Roleplay as ${lead.management?.[0]?.name || 'Prospect'} from ${lead.company}. 
    User says: "${userInput}". 
    History: ${conversation}. 
    Keep it 1-2 sentences. Be professional but skeptical.`;

    const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: { temperature: 0.9 }
    });
    return getResponseText(result.response);
};

export const extractLeadFromImage = async (file) => {
    if (!genAI) throw new Error("API Key missing");
    
    const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
    });

    const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
            { text: "Extract business card info into JSON: company, name, role, email, phone, website." },
            { inlineData: { mimeType: file.type, data: base64Data } }
        ],
        config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(getResponseText(result.response));
    return {
        id: Date.now(),
        company: data.company || "New Company",
        website: data.website || "",
        status: 'new',
        management: [{ name: data.name, role: data.role, email: data.email }]
    };
};
