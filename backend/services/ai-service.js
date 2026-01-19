const axios = require('axios');
const config = require('../config');

class AIService {
    constructor() {
        this.provider = config.ai.provider;
        this.openaiConfig = config.ai.openai;
        this.geminiConfig = config.ai.gemini;
    }
    
    async analyzeMessage(message) {
        if (this.provider === 'openai') {
            return await this.analyzeWithOpenAI(message);
        } else if (this.provider === 'gemini') {
            return await this.analyzeWithGemini(message);
        } else {
            throw new Error(`Unsupported AI provider: ${this.provider}`);
        }
    }
    
    async analyzeWithOpenAI(message) {
        const SYSTEM_PROMPT = `You are "Freelancer Copilot" - an internal AI assistant for a freelance web developer. Analyze buyer messages and provide guidance.

OUTPUT FORMAT - Respond with these 3 sections exactly:

A. INTERNAL GUIDANCE (HINGLISH)
- Buyer ka intent samjhao
- Risks highlight karo if any
- Strategy advice do
- Counter-questions suggest karo if needed
- Tone: Casual Hinglish mix, direct advice

B. READY-TO-SEND CLIENT REPLY (ENGLISH)
- Professional, polite, platform-safe reply
- If risky: polite redirect without accusation
- If unclear: ask clarifying questions professionally
- NEVER accuse or be rude
- Keep it concise and actionable

C. RISK LEVEL
- Only: LOW / MEDIUM / HIGH
- One-line reason in English`;

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: this.openaiConfig.model,
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: message }
                    ],
                    temperature: this.openaiConfig.temperature,
                    max_tokens: this.openaiConfig.maxTokens,
                    top_p: 0.9,
                    frequency_penalty: 0.1,
                    presence_penalty: 0.1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.openaiConfig.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000 // 30 seconds timeout
                }
            );
            
            const aiResponse = response.data.choices[0].message.content;
            return this.parseResponse(aiResponse);
            
        } catch (error) {
            if (error.response) {
                console.error('OpenAI API error:', error.response.status, error.response.data);
                throw new Error(`OpenAI API error: ${error.response.data.error?.message || 'Unknown error'}`);
            } else if (error.request) {
                console.error('OpenAI request error:', error.message);
                throw new Error('Network error while connecting to OpenAI');
            } else {
                console.error('OpenAI configuration error:', error.message);
                throw error;
            }
        }
    }
    
    async analyzeWithGemini(message) {
        const SYSTEM_PROMPT = `You are "Freelancer Copilot" - an internal AI assistant. Analyze buyer messages. Output EXACTLY in this format:

A. INTERNAL GUIDANCE (HINGLISH)
[Your analysis in Hinglish]

B. READY-TO-SEND CLIENT REPLY (ENGLISH)
[Professional reply]

C. RISK LEVEL
[LOW/MEDIUM/HIGH] - [one line reason]`;

        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiConfig.model}:generateContent?key=${this.geminiConfig.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: `${SYSTEM_PROMPT}\n\nBuyer message: ${message}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1000,
                        topP: 0.9,
                        topK: 40
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
            
            const aiResponse = response.data.candidates[0].content.parts[0].text;
            return this.parseResponse(aiResponse);
            
        } catch (error) {
            if (error.response) {
                console.error('Gemini API error:', error.response.status, error.response.data);
                throw new Error(`Gemini API error: ${error.response.data.error?.message || 'Unknown error'}`);
            } else {
                console.error('Gemini request error:', error.message);
                throw new Error('Network error while connecting to Gemini');
            }
        }
    }
    
    parseResponse(text) {
        try {
            // Extract sections using regex
            const sections = {};
            
            // Extract Internal Guidance
            const guidanceMatch = text.match(/A\. INTERNAL GUIDANCE \(HINGLISH\)\s*\n([\s\S]*?)(?=\n\s*B\.|$)/i);
            sections.internalGuidance = guidanceMatch ? guidanceMatch[1].trim() : 'Could not parse guidance';
            
            // Extract Client Reply
            const replyMatch = text.match(/B\. READY-TO-SEND CLIENT REPLY \(ENGLISH\)\s*\n([\s\S]*?)(?=\n\s*C\.|$)/i);
            sections.clientReply = replyMatch ? replyMatch[1].trim() : 'Could not parse reply';
            
            // Extract Risk Level
            const riskMatch = text.match(/C\. RISK LEVEL\s*\n([\s\S]*?)(?=\n\s*\n|$)/i);
            const riskText = riskMatch ? riskMatch[1].trim() : 'LOW - Could not parse risk level';
            
            // Determine risk category
            let riskLevel = 'LOW';
            let riskReason = riskText;
            
            if (riskText.toUpperCase().includes('HIGH')) {
                riskLevel = 'HIGH';
            } else if (riskText.toUpperCase().includes('MEDIUM')) {
                riskLevel = 'MEDIUM';
            }
            
            // Extract reason (remove the risk level from the text)
            riskReason = riskText.replace(/^(LOW|MEDIUM|HIGH)\s*[:\-]\s*/i, '').trim();
            
            sections.riskLevel = riskLevel;
            sections.riskReason = riskReason || 'No specific reason provided';
            
            return sections;
            
        } catch (error) {
            console.error('Error parsing AI response:', error);
            return {
                internalGuidance: 'Error parsing response. Please try again.',
                clientReply: 'Thank you for your message. Could you please provide more details about your project?',
                riskLevel: 'LOW',
                riskReason: 'Parsing error occurred'
            };
        }
    }
}

module.exports = new AIService();