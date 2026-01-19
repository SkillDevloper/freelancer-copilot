# Freelancer Copilot 🤖

A private AI assistant for freelance web developers to analyze client messages from platforms like Fiverr and Upwork.

## 🎯 Purpose

This is **NOT** a client-facing chatbot. It's an internal tool that helps freelancers:
- Analyze buyer intent and detect potential risks
- Generate professional, platform-safe responses
- Avoid scams and unclear requirements
- Save time on client communications

## ✨ Features

### Core Features
- **AI Analysis**: Uses OpenAI GPT-4 or Google Gemini to analyze messages
- **Risk Detection**: Identifies scams, vague requests, and platform policy violations
- **Hinglish Guidance**: Internal advice in Hindi-English mix
- **Ready-to-Send Replies**: Professional, platform-safe response templates
- **Risk Level Assessment**: LOW/MEDIUM/HIGH classification with reasons

### User Experience
- Clean, modern web interface
- Real-time character counting
- Analysis history
- One-click copy functionality
- Responsive design for all devices
- Connection status indicator

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- An AI API key (OpenAI or Google Gemini)
- Modern web browser

### Installation

1. **Clone or download the project**
   ```bash
   git clone https://github.com/skikkdevloper/freelancer-copilot.git
   cd freelancer-copilot
    ```
2. **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
3. **Configure Environment**
    ```bash
    cp .env.example .env
    # Edit .env and add your API key
    ```
4. **Start Backend Server**
    ```bash
    npm start
    # Server runs on http://localhost:3000
    ```
5. **Start Frontend**
- Open `frontend/index.html` in your browser
- Or use a simple HTTP server:
    ```bash
    npx serve frontend
    # Frontend runs on http://localhost:8080
    ```
### Configuration
**AI Provider Selection**
Choose either OpenAI or Google Gemini in `.env`:
    ```bash

    # For OpenAI (default)
    OPENAI_API_KEY=your_key_here
    AI_PROVIDER=openai

    # For Google Gemini
    GEMINI_API_KEY=your_key_here
    AI_PROVIDER=gemini

### Customize Backend

- Edit backend/config.js for:
- API endpoint configuration
- Rate limiting
- CORS settings
- AI model parameters

### How to Use

1.   **Copy a client message** from Fiverr, Upwork, or any platform
2.   **Paste it** into the text area in the web app
3.   Click "**Analyze Message**" to get AI analysis
4.   **Review the results** in three sections:
- Internal Guidance (Hinglish advice)
- Ready-to-Send Reply (Professional English)
- Risk Level (With explanation)
5.  **Copy the reply** and paste it back to your client

## Project Structure
    freelancer-copilot/
    ├── backend/              # Node.js server
    │   ├── server.js        # Main server file
    │   ├── services/        # AI service logic
    │   ├── package.json     # Dependencies
    │   └── .env            # Environment variables
    ├── frontend/            # Web interface
    │   ├── index.html      # Main HTML file
    │   ├── style.css       # Styling
    │   └── script.js       # Frontend logic
    └── README.md           # This file
### API Endpoints
`GET /health` Health check endpoint

    {
    "status": "ok",
    "service": "Freelancer Copilot API",
    "version": "1.0.0",
    "aiProvider": "openai"
    }
`POST /api/analyze` Analyze a buyer message

    Request:
    {
    "message": "Your buyer message here"
    }

    Response:
    {
        "success": true,
        "timestamp": "2024-01-09T10:30:00Z",
        "analysis": {
            "internalGuidance": "Hinglish analysis here...",
            "clientReply": "Professional reply here...",
            "riskLevel": "LOW",
            "riskReason": "Clear legitimate request"
        }
    }

### Security Features

- **No Data Storage**: Messages are not stored permanently (MVP uses localStorage)
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Only allows requests from configured origins
- **Input Validation**: Sanitizes and validates all inputs
- **HTTPS Ready**: Configured for secure deployment

### Tips for Best Results

- **Include Context**: Paste the entire client message for better analysis
- **Review Always**: AI suggestions are guides - always review before sending
- **Platform Rules**: The tool respects Fiverr/Upwork policies
- **False Positives**: Some legitimate requests might get flagged - use your judgment

### Deployment
**Option 1: Local Development**

- Perfect for individual use
- All data stays on your machine
- No monthly costs besides API usage

**Option 2: VPS Deployment**

    # On your VPS (Ubuntu example)
    sudo apt update
    sudo apt install nodejs npm nginx
    git clone <your-repo>
    cd freelancer-copilot/backend
    npm install
    npm run build
    # Configure PM2 for process management
    pm2 start server.js
    # Configure Nginx as reverse proxy

### Disclaimer
- This tool provides suggestions only. You are responsible for:
- Reviewing all AI-generated content
- Ensuring compliance with platform policies
- Making final decisions on client interactions
- Protecting your sensitive information

### Credits
Built for freelance web developers who want to work smarter, not harder.