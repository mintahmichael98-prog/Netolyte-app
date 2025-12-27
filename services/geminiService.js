import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
const API_KEY = process.env.API_KEY;
// Fallback if key is missing to prevent crash on init
const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Helper for strict email validation
const isValidEmail = (email) => {
    if (!email)
        return false;
    // Basic robust regex for email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};
export const generateLeadsBatch = async (query, batchSize, batchIndex, ignoreList = []) => {
    if (!genAI)
        throw new Error("API Key is missing.");
    const modelId = "gemini-2.5-flash";
    // Construct exclusion text (limit to last 50 to save tokens)
    const exclusionText = ignoreList.length > 0
        ? `EXCLUDE these companies: ${ignoreList.slice(-50).join(", ")}.`
        : "";
    const prompt = `
    ROLE: Elite B2B Data Researcher & Lead Generator.
    TASK: Find ${batchSize} high-quality, verified B2B leads matching EXACTLY: "${query}".
    
    CONTEXT: Batch #${batchIndex + 1}. ${exclusionText}
    
    STRICT SEARCH PROTOCOLS (MUST FOLLOW):
    1. ACCURACY FIRST: 
       - Location Match: If query implies a location (e.g. "London"), companies MUST be in that city.
       - Industry Match: If query implies an industry (e.g. "Software"), companies MUST be in that industry.
       - If you cannot find ${batchSize} perfect matches, return FEWER. Do not fill with irrelevant data.
    
    2. CONTACT DATA PRIORITY:
       - WORK EMAILS: You MUST find or highly confidently deduce the work email (name@company.com) for the decision maker. 
       - Avoid generic info@ or sales@ if possible.
       - Verify email patterns (e.g. first.last@domain.com) before outputting.
    
    3. NO HALLUCINATIONS:
       - Real companies only.
       - Real people only.
       - Real websites only.
    
    OUTPUT FORMAT:
    Strictly a JSON Array of objects. No markdown. No conversational text.
    
    REQUIRED JSON STRUCTURE:
    [
      {
        "company": "string (Exact registered name)",
        "description": "string (1 sentence summary relevant to search)",
        "location": "City, Country",
        "googleMapsUrl": "string (optional)",
        "confidence": number (90-100 for verified, <70 if uncertain),
        "website": "string (Full URL)",
        "contact": "Phone Number",
        "industry": "string",
        "employees": "string (e.g. 10-50)",
        "socials": { "linkedin": "url", "twitter": "url", "facebook": "url", "instagram": "url" },
        "management": [{ "name": "string", "role": "string", "email": "string (Work Email)", "linkedin": "url" }]
      }
    ]
  `;
    // Increase retries to handle long pauses
    const maxRetries = 4;
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await genAI.models.generateContent({
                model: modelId,
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                    systemInstruction: "Output strictly valid JSON. No markdown.",
                    temperature: 0.3, // Lower temperature for high accuracy
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                },
            });
            let text = response.text;
            if (!text) {
                console.warn(`Batch ${batchIndex} attempt ${attempt}: Empty text response`);
                throw new Error("Empty response from Gemini");
            }
            // CLEANUP: Aggressively remove markdown and conversational filler
            // 1. Remove markdown code blocks
            text = text.replace(/```json/gi, "").replace(/```/g, "");
            // 2. Find the JSON array
            const firstBracket = text.indexOf('[');
            const lastBracket = text.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                text = text.substring(firstBracket, lastBracket + 1);
            }
            else {
                // Fallback: Check for single object
                const firstBrace = text.indexOf('{');
                const lastBrace = text.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1) {
                    text = `[${text.substring(firstBrace, lastBrace + 1)}]`;
                }
                else {
                    console.error("Invalid Response Format:", text.substring(0, 200));
                    throw new Error("Model did not return a JSON array");
                }
            }
            let rawData = [];
            try {
                rawData = JSON.parse(text);
            }
            catch (e) {
                console.warn(`JSON Parse failed on attempt ${attempt + 1}. Trying cleanup.`);
                // Attempt to fix common trailing comma or unclosed array
                try {
                    let cleanText = text.trim();
                    if (cleanText.endsWith(','))
                        cleanText = cleanText.slice(0, -1);
                    if (!cleanText.endsWith(']'))
                        cleanText += ']';
                    rawData = JSON.parse(cleanText);
                }
                catch (e2) {
                    throw new Error("Invalid JSON syntax");
                }
            }
            if (!Array.isArray(rawData)) {
                throw new Error("Response was valid JSON but not an array");
            }
            // Process and validate
            const processedLeads = rawData.map((l, i) => ({
                ...l,
                id: Date.now() + i + Math.random(),
                confidence: l.confidence || 85,
                industry: l.industry || "Unknown",
                website: l.website || "",
                contact: l.contact || "N/A",
                socials: l.socials || {},
                management: Array.isArray(l.management)
                    ? l.management.map((m) => ({
                        ...m,
                        // Validate email format strictly.
                        email: isValidEmail(m.email) ? m.email : ""
                    }))
                    : [],
                coordinates: null, // Geocoded by UI
                googleMapsUrl: l.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.company + " " + l.location)}`,
                status: 'new',
                activity: [{
                        id: `create_${Date.now()}_${i}`,
                        type: 'creation',
                        content: 'Lead discovered by AI',
                        author: 'System',
                        timestamp: new Date().toISOString()
                    }]
            }));
            return processedLeads;
        }
        catch (error) {
            console.warn(`Batch ${batchIndex + 1} attempt ${attempt + 1} error:`, error);
            lastError = error;
            // Check for rate limit error patterns (429 Resource Exhausted)
            const isRateLimit = error.status === 429 ||
                error.code === 429 ||
                (error.message && error.message.includes('429')) ||
                (error.message && error.message.toLowerCase().includes('quota'));
            let waitTime = Math.pow(2, attempt) * 1000;
            if (isRateLimit) {
                console.log("Quota exceeded. Cooling down for 65 seconds...");
                // Wait for quota reset (usually 1 minute window) plus buffer
                waitTime = 65000 + (Math.random() * 2000);
            }
            if (attempt < maxRetries - 1) {
                await delay(waitTime);
            }
            else {
                if (isRateLimit)
                    throw new Error("API Quota Reached. The system paused but could not recover. Please try again in a few minutes.");
            }
        }
    }
    console.error("Batch failed after retries:", lastError);
    return [];
};
export const analyzeCompetitors = async (website, location) => {
    if (!genAI)
        throw new Error("API Key is missing.");
    const locationContext = location ? `operating in or near ${location}` : '';
    const searchContext = location ? `in ${location}` : '';
    const prompt = `
    Analyze this company domain: "${website}" ${locationContext}.
    
    1. Identify Company Name, Industry, Summary.
    2. Search for 5-8 DIRECT COMPETITORS ${searchContext}.
    3. Return strictly valid JSON.
    
    Structure:
    {
      "target": { "name": "...", "industry": "...", "summary": "..." },
      "competitors": [
        { 
          "name": "...", 
          "website": "...", 
          "description": "...", 
          "strength": "...", 
          "weakness": "...",
          "socials": { "linkedin": "", "twitter": "", "instagram": "", "facebook": "" }
        }
      ]
    }
  `;
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                    systemInstruction: "You are a market researcher. Output strictly valid JSON.",
                    temperature: 0.5,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ]
                }
            });
            let text = response.text;
            if (!text)
                throw new Error("Empty response");
            text = text.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "").trim();
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                text = text.substring(firstBrace, lastBrace + 1);
                return JSON.parse(text);
            }
        }
        catch (error) {
            console.warn("Competitor analysis retry:", error);
            // Handle rate limits here too
            const isRateLimit = error.status === 429 || (error.message && error.message.includes('429'));
            const waitTime = isRateLimit ? 65000 : 2000 * (attempt + 1);
            if (attempt < maxRetries - 1)
                await delay(waitTime);
        }
    }
    throw new Error("Analysis failed");
};
export const findLookalikes = async (website) => {
    if (!genAI)
        throw new Error("API Key is missing.");
    const prompt = `
    Find 20 "Lookalike" companies similar to: "${website}".
    Match Revenue Model, Tech Stack, and Customer Base.
    Verify they exist with Google Search.
    
    Output strictly valid JSON Array of Lead objects.
    Structure: [{ "company": "...", "description": "...", "location": "...", "website": "...", "contact": "...", "industry": "...", "employees": "...", "socials": {}, "management": [{ "name": "...", "role": "...", "email": "..." }] }]
  `;
    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: "Output JSON only.",
                temperature: 0.6,
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ]
            }
        });
        let text = response.text || "";
        text = text.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "").trim();
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
            text = text.substring(firstBracket, lastBracket + 1);
            const rawData = JSON.parse(text);
            return rawData.map((l, i) => ({
                ...l,
                id: Date.now() + i,
                confidence: l.confidence || 85,
                status: 'new',
                socials: l.socials || {},
                management: l.management || [],
                activity: [{
                        id: `create_${Date.now()}_${i}`,
                        type: 'creation',
                        content: 'Lead lookalike generated by AI',
                        author: 'System',
                        timestamp: new Date().toISOString()
                    }]
            }));
        }
        return [];
    }
    catch (e) {
        console.error("Lookalike search failed", e);
        throw new Error("Failed to find lookalike audiences.");
    }
};
export const generateSalesStrategy = async (productDescription) => {
    if (!genAI)
        throw new Error("API Key missing");
    const prompt = `
    ACT AS: Expert Sales Strategist.
    PRODUCT: "${productDescription}"
    
    TASK: 
    1. Identify the Ideal Customer Profile (ICP).
    2. Determine 3 key PAIN POINTS these customers face that this product solves.
    3. Write a 1-sentence Value Proposition.
    4. Write a short elevator pitch.
    5. Create a search query string to find these leads.

    OUTPUT JSON FORMAT:
    {
      "icp": { 
         "industries": ["string"], 
         "roles": ["string"], 
         "companySize": ["string"],
         "location": "string (best regions)"
      },
      "painPoints": [
         { "title": "string", "description": "string" }
      ],
      "valueProp": "string",
      "pitch": "string",
      "suggestedSearchQuery": "string"
    }
  `;
    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", temperature: 0.7 }
        });
        return JSON.parse(response.text || "{}");
    }
    catch (e) {
        console.error("Strategy generation failed", e);
        throw new Error("Failed to generate sales strategy.");
    }
};
export const chatWithPersona = async (lead, history, userInput) => {
    if (!genAI)
        throw new Error("API Key missing");
    const name = lead.management?.[0]?.name || "The Prospect";
    const role = lead.management?.[0]?.role || "Decision Maker";
    // Construct conversation history text
    const conversation = history.map(m => `${m.role === 'user' ? 'Sales Rep' : name}: ${m.text}`).join('\n');
    const prompt = `
    ROLEPLAY SIMULATION
    You are ${name}, the ${role} of ${lead.company} (${lead.industry}).
    Location: ${lead.location}.
    Company Description: ${lead.description}.
    
    Your Personality: Skeptical, busy, professional, but open to value.
    
    The user is a sales rep trying to sell you services.
    
    Current Conversation:
    ${conversation}
    Sales Rep: ${userInput}
    
    INSTRUCTION:
    Reply as ${name}.
    - Keep it short (1-2 sentences).
    - Be realistic. If the pitch is generic, ignore it or be annoyed. If it's personalized, ask a question.
    - Raise common B2B objections (budget, timing, current vendor).
    - Do NOT break character.
  `;
    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            temperature: 0.9, // Higher temp for more natural/varied responses
        }
    });
    return response.text || "...";
};
export const getCoachingFeedback = async (history) => {
    if (!genAI)
        throw new Error("API Key missing");
    const conversation = history.map(m => `${m.role === 'user' ? 'Sales Rep' : 'Prospect'}: ${m.text}`).join('\n');
    const prompt = `
    Analyze this sales roleplay transcript:
    
    ${conversation}
    
    Provide structured feedback in JSON format:
    {
      "score": number (0-100),
      "strengths": ["string", "string"],
      "weaknesses": ["string", "string"],
      "summary": "string (brief overview)",
      "improved_pitch": "string (rewrite the opening or key pitch better)"
    }
  `;
    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    try {
        return JSON.parse(response.text || "{}");
    }
    catch (e) {
        return { score: 0, summary: "Failed to parse feedback." };
    }
};
export const monitorLeadSignals = async (leads) => {
    if (!genAI || leads.length === 0)
        return [];
    // Reduce batch size for signals to avoid timeout/quota issues
    // Process in chunks of 5
    const chunkSize = 5;
    const allSignals = [];
    // Helper to process a chunk
    const processChunk = async (chunk, chunkIndex) => {
        const companiesToSearch = chunk.map(l => ({
            name: l.company,
            website: l.website,
            industry: l.industry
        }));
        const prompt = `
        You are a business intelligence analyst. Your task is to find a SINGLE, RECENT (last 30 days), and SIGNIFICANT news event for each company provided.

        INSTRUCTIONS:
        1. Use Google Search for each company.
        2. A "significant event" includes: Funding, M&A, Product Launch, Executive Hiring, Expansion, Earnings.
        3. AVOID: Generic blogs, minor updates, old news (>30 days).
        4. If NO significant event is found for a company, COMPLETELY OMIT it.
        
        Companies:
        ${JSON.stringify(companiesToSearch, null, 2)}

        Return ONLY a valid JSON array:
        [
          {
            "leadCompany": "string (Exact company name from input)",
            "title": "string (Headline)",
            "summary": "string (1 sentence)",
            "source": "string (URL)",
            "timestamp": "string (ISO date)"
          }
        ]
      `;
        try {
            const response = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                    systemInstruction: "Output strictly valid JSON.",
                    temperature: 0.3,
                }
            });
            let text = response.text || "[]";
            text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
            const start = text.indexOf('[');
            const end = text.lastIndexOf(']');
            if (start !== -1 && end !== -1) {
                const json = JSON.parse(text.substring(start, end + 1));
                // Add leadId
                return json.map((s) => {
                    const lead = chunk.find(l => l.company === s.leadCompany);
                    return { ...s, leadId: lead?.id || 0 };
                });
            }
            return [];
        }
        catch (e) {
            console.warn("Signal chunk failed", e);
            return [];
        }
    };
    for (let i = 0; i < leads.length; i += chunkSize) {
        const chunk = leads.slice(i, i + chunkSize);
        const signals = await processChunk(chunk, i);
        allSignals.push(...signals);
        if (i + chunkSize < leads.length)
            await delay(2000); // Rate limit buffer
    }
    return allSignals;
};
export const generateCallScript = async (lead) => {
    if (!genAI)
        throw new Error("API Key missing");
    const name = lead.management?.[0]?.name || "The Prospect";
    const role = lead.management?.[0]?.role || "Decision Maker";
    const company = lead.company;
    const industry = lead.industry;
    const description = lead.description;
    const prompt = `
    ROLE: Expert Sales Copywriter & Cold Caller.
    TASK: Write a high-converting cold call script for calling ${company}.
    
    LEAD DETAILS:
    - Company: ${company}
    - Industry: ${industry}
    - Description: ${description}
    - Contact Person: ${name} (${role})
    
    INSTRUCTIONS:
    - Create a structured script with sections: "Opener", "Value Prop", "Qualifying Questions", "Common Objections & Rebuttals", and "Closing".
    - Use Markdown formatting (### Section Title).
    - Keep it concise, natural, and persuasive.
    - Focus on pain points relevant to ${industry}.
  `;
    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        return response.text || "Failed to generate script.";
    }
    catch (error) {
        console.error("Script generation failed:", error);
        throw new Error("Failed to generate call script");
    }
};
export const extractLeadFromImage = async (file) => {
    if (!genAI)
        throw new Error("API Key missing");
    const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result;
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
    });
    const prompt = `
    Analyze this image of a business card.
    Extract lead details into a strictly valid JSON object.
    
    Fields required:
    - company (string)
    - name (string)
    - role (string)
    - email (string)
    - phone (string)
    - website (string)
    - address (string)
    
    If field is missing, use empty string.
  `;
    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            { text: prompt },
            { inlineData: { mimeType: file.type, data: base64Data } }
        ],
        config: { responseMimeType: "application/json" }
    });
    const text = response.text;
    if (!text)
        throw new Error("No data extracted");
    const data = JSON.parse(text);
    return {
        id: Date.now(),
        company: data.company || "Unknown Company",
        description: "Imported from Business Card",
        location: data.address || "Unknown",
        confidence: 100,
        website: data.website || "",
        contact: data.phone || data.email || "N/A",
        industry: "Imported",
        employees: "Unknown",
        status: 'new',
        management: data.name ? [{ name: data.name, role: data.role || "Contact", email: data.email }] : [],
        activity: [{
                id: `card_${Date.now()}`,
                type: 'creation',
                content: 'Lead captured from Business Card',
                author: 'AI Scanner',
                timestamp: new Date().toISOString()
            }]
    };
};
export const extractLeadFromVCard = async (vcardText) => {
    if (!genAI)
        throw new Error("API Key missing");
    const prompt = `
    Parse this vCard/Contact text into a strictly valid JSON object for a B2B lead.
    
    Text:
    ${vcardText}
    
    Fields required:
    - company (string)
    - name (string)
    - role (string)
    - email (string)
    - phone (string)
    - website (string)
    - address (string)
  `;
    const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    const text = response.text;
    if (!text)
        throw new Error("No data extracted");
    const data = JSON.parse(text);
    return {
        id: Date.now(),
        company: data.company || "Unknown Company",
        description: "Imported from vCard",
        location: data.address || "Unknown",
        confidence: 100,
        website: data.website || "",
        contact: data.phone || data.email || "N/A",
        industry: "Imported",
        employees: "Unknown",
        status: 'new',
        management: data.name ? [{ name: data.name, role: data.role || "Contact", email: data.email }] : [],
        activity: [{
                id: `vcard_${Date.now()}`,
                type: 'creation',
                content: 'Lead imported from vCard',
                author: 'AI Parser',
                timestamp: new Date().toISOString()
            }]
    };
};
export const generateCallAnalysis = async (transcript, notes) => {
    if (!genAI)
        throw new Error("API Key missing");
    const formattedTranscript = transcript.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n');
    const prompt = `
    ANALYZE THIS SALES CALL.
    
    Transcript:
    ${formattedTranscript}
    
    Sales Rep Notes:
    ${notes}
    
    TASK:
    1. Summarize the call.
    2. Determine sentiment (positive/neutral/negative).
    3. Give a Confidence Score (0-100) based on likelihood to close.
    4. Provide 2-3 specific coaching tips for the rep (what could they have done better?).
    5. List 1-2 missed opportunities or questions they should have asked.
    
    OUTPUT JSON format only:
    {
      "summary": "string",
      "confidenceScore": number,
      "sentiment": "string",
      "coachingTips": ["string"],
      "missedOpportunities": ["string"]
    }
  `;
    try {
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { responseMimeType: "application/json", temperature: 0.4 }
        });
        return JSON.parse(response.text || "{}");
    }
    catch (error) {
        console.error("Call Analysis Failed", error);
        throw new Error("Failed to analyze call");
    }
};
