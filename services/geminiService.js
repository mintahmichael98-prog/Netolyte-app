import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// 1. Initialization
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.API_KEY;
const genAI = API_KEY ? new GoogleGenAI(API_KEY) : null; 
const modelId = "gemini-1.5-flash";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

const getResponseText = (response) => {
    if (!response) return "";
    return typeof response.text === 'function' ? response.text() : (response.text || "");
};

// --- EXISTING CORE LOGIC ---

export const generateLeadsBatch = async (query, batchSize, batchIndex, ignoreList = []) => {
    if (!genAI) throw new Error("Gemini API Key is missing.");
    const model = genAI.getGenerativeModel({ model: modelId });
    const exclusionText = ignoreList.length > 0 ? `EXCLUDE: ${ignoreList.slice(-50).join(", ")}.` : "";
    
    const prompt = `Find ${batchSize} B2B leads for: "${query}". Batch #${batchIndex + 1}. ${exclusionText} 
    Return strictly JSON: [{ "company": "string", "description": "string", "location": "string", "website": "string", "industry": "string", "management": [{ "name": "string", "role": "string", "email": "string" }] }]`;

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const result = await model.generateContent(prompt);
            let text = getResponseText(result.response).replace(/```json/gi, "").replace(/```/g, "").trim();
            const rawData = JSON.parse(text);
            return rawData.map((l, i) => ({
                ...l,
                id: `lead_${Date.now()}_${i}`,
                status: 'new',
                management: (l.management || []).map(m => ({ ...m, email: isValidEmail(m.email) ? m.email : "" }))
            }));
        } catch (error) {
            await delay(2000 * (attempt + 1));
        }
    }
    return [];
};

export const generateSalesStrategy = async (productDescription) => {
    if (!genAI) throw new Error("API Key missing");
    const model = genAI.getGenerativeModel({ model: modelId });
    const prompt = `Analyze product: "${productDescription}". Return JSON: {icp, painPoints, valueProp, pitch, suggestedSearchQuery}.`;
    const result = await model.generateContent(prompt);
    return JSON.parse(getResponseText(result.response) || "{}");
};

// --- ADDED MISSING EXPORTS (TO FIX BUILD ERRORS) ---

export const generateCallScript = async (lead) => {
    if (!genAI) return "API Key missing";
    const model = genAI.getGenerativeModel({ model: modelId });
    const prompt = `Create a cold call script for ${lead.company}. Goal: Book demo.`;
    const result = await model.generateContent(prompt);
    return getResponseText(result.response);
};

export const analyzeCompetitors = async (company, industry) => {
    if (!genAI) return "API Key missing";
    const model = genAI.getGenerativeModel({ model: modelId });
    const prompt = `Identify competitors for ${company} in ${industry}.`;
    const result = await model.generateContent(prompt);
    return getResponseText(result.response);
};

export const extractLeadFromVCard = async (text) => {
    if (!genAI) return null;
    const model = genAI.getGenerativeModel({ model: modelId });
    const prompt = `Extract name, email, company from text: ${text}`;
    const result = await model.generateContent(prompt);
    return getResponseText(result.response);
};

export const monitorLeadSignals = async (lead) => {
    if (!genAI) return "No signals found";
    const model = genAI.getGenerativeModel({ model: modelId });
    const prompt = `Buying triggers for ${lead.company}.`;
    const result = await model.generateContent(prompt);
    return getResponseText(result.response);
};

export const findLookalikes = async (lead) => {
    if (!genAI) return [];
    const model = genAI.getGenerativeModel({ model: modelId });
    const prompt = `List 5 companies like ${lead.company}.`;
    const result = await model.generateContent(prompt);
    return getResponseText(result.response);
};

export const generateCallAnalysis = async (transcript) => {
    if (!genAI) return "Analysis unavailable";
    const model = genAI.getGenerativeModel({ model: modelId });
    const prompt = `Summarize call: ${transcript}`;
    const result = await model.generateContent(prompt);
    return getResponseText(result.response);
};

export const getCoachingFeedback = async (transcript) => {
    if (!genAI) return "Feedback unavailable";
    const model = genAI.getGenerativeModel({ model: modelId });
    const prompt = `Coach this sales call: ${transcript}`;
    const result = await model.generateContent(prompt);
    return getResponseText(result.response);
};

// --- VISION & CHAT ---

export const chatWithPersona = async (lead, history, userInput) => {
    if (!genAI) throw new Error("API Key missing");
    const model = genAI.getGenerativeModel({ model: modelId });
    const prompt = `Roleplay as ${lead.company}. History: ${JSON.stringify(history)}. User: ${userInput}`;
    const result = await model.generateContent(prompt);
    return getResponseText(result.response);
};

export const extractLeadFromImage = async (file) => {
    if (!genAI) throw new Error("API Key missing");
    const model = genAI.getGenerativeModel({ model: modelId });
    const base64Data = await new Promise(r => {
        const reader = new FileReader();
        reader.onload = () => r(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
    });
    const result = await model.generateContent([
        { text: "Extract business card info to JSON." },
        { inlineData: { mimeType: file.type, data: base64Data } }
    ]);
    const data = JSON.parse(getResponseText(result.response));
    return { id: Date.now(), company: data.company, status: 'new', management: [{ name: data.name, email: data.email }] };
};
