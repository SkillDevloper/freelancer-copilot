const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const config = require('./config');
const aiService = require('./services/ai-service');

const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: config.security.corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
}));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
    points: config.security.rateLimitMax,
    duration: config.security.rateLimitWindow * 60 // Convert minutes to seconds
});

const rateLimiterMiddleware = (req, res, next) => {
    rateLimiter.consume(req.ip)
        .then(() => next())
        .catch(() => {
            res.status(429).json({
                error: 'Too many requests. Please wait before making more requests.'
            });
        });
};

app.use(rateLimiterMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'Freelancer Copilot API',
        version: '1.0.0',
        aiProvider: config.ai.provider
    });
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Message is required and must be a string'
            });
        }
        
        if (message.length > 5000) {
            return res.status(400).json({
                error: 'Message too long. Maximum 5000 characters.'
            });
        }
        
        console.log(`Analyzing message (${message.length} chars)`);
        
        // Get AI analysis
        const analysis = await aiService.analyzeMessage(message);
        
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            analysis: analysis
        });
        
    } catch (error) {
        console.error('Analysis error:', error.message);
        
        // Handle different types of errors
        if (error.message.includes('API key') || error.message.includes('authentication')) {
            return res.status(401).json({
                error: 'AI service authentication failed. Check API key.'
            });
        }
        
        if (error.message.includes('rate limit') || error.message.includes('quota')) {
            return res.status(429).json({
                error: 'AI service rate limit exceeded. Please try again later.'
            });
        }
        
        res.status(500).json({
            error: 'Failed to analyze message. Please try again.'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
    console.log(`
    🚀 Freelancer Copilot API running on port ${PORT}
    📝 Environment: ${config.server.nodeEnv}
    🤖 AI Provider: ${config.ai.provider}
    🌐 CORS Origin: ${config.security.corsOrigin}
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});