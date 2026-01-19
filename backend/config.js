require('dotenv').config();

const config = {
    server: {
        port: process.env.PORT || 3000,
        nodeEnv: process.env.NODE_ENV || 'development'
    },
    ai: {
        // Use OpenAI by default, can switch to Gemini
        provider: process.env.AI_PROVIDER || 'openai',
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-4-1106-preview',
            temperature: 0.3,
            maxTokens: 1000
        },
        gemini: {
            apiKey: process.env.GEMINI_API_KEY,
            model: process.env.GEMINI_MODEL || 'gemini-pro'
        }
    },
    security: {
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
        rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100
    }
};

// Validate required configuration
if (!config.ai.openai.apiKey && !config.ai.gemini.apiKey) {
    console.error('ERROR: No AI API key found. Set OPENAI_API_KEY or GEMINI_API_KEY in .env file');
    process.exit(1);
}

module.exports = config;