document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const messageInput = document.getElementById('messageInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exampleBtn = document.getElementById('exampleBtn');
    const outputSection = document.getElementById('outputSection');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const copyReplyBtn = document.getElementById('copyReplyBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const apiEndpointInput = document.getElementById('apiEndpoint');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const charCount = document.getElementById('charCount');
    
    // State
    let analysisHistory = [];
    let settings = {
        apiEndpoint: 'http://localhost:3000',
        enableHistory: true,
        autoCopy: false,
        theme: 'light'
    };
    
    // Initialize
    init();
    
    async function init() {
        loadSettings();
        checkBackendConnection();
        setupEventListeners();
        updateCharCount();
        loadHistory();
        
        // Check backend connection every 30 seconds
        setInterval(checkBackendConnection, 30000);
    }
    
    function setupEventListeners() {
        // Input events
        messageInput.addEventListener('input', updateCharCount);
        messageInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                analyzeMessage();
            }
        });
        
        // Button events
        analyzeBtn.addEventListener('click', analyzeMessage);
        clearBtn.addEventListener('click', clearInput);
        exampleBtn.addEventListener('click', loadExample);
        copyAllBtn.addEventListener('click', copyAllAnalysis);
        copyReplyBtn.addEventListener('click', copyReplyAndClose);
        
        // Settings modal
        settingsBtn.addEventListener('click', openSettingsModal);
        saveSettingsBtn.addEventListener('click', saveSettings);
        
        // Close modal when clicking X
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        // Copy buttons
        document.querySelectorAll('.copy-btn[data-target]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.currentTarget.getAttribute('data-target');
                const content = document.getElementById(targetId).textContent;
                copyToClipboard(content);
                showNotification('Copied to clipboard!');
            });
        });
    }
    
    async function checkBackendConnection() {
        try {
            statusDot.classList.remove('connected', 'error');
            statusText.textContent = 'Checking connection...';
            
            const response = await fetch(`${settings.apiEndpoint}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok) {
                const data = await response.json();
                statusDot.classList.add('connected');
                statusText.textContent = `Connected (${data.aiProvider})`;
            } else {
                throw new Error('Server responded with error');
            }
        } catch (error) {
            console.error('Connection check failed:', error);
            statusDot.classList.add('error');
            statusText.textContent = 'Disconnected - Check backend';
        }
    }
    
    async function analyzeMessage() {
        const message = messageInput.value.trim();
        
        if (!message) {
            showNotification('Please enter a message to analyze', 'warning');
            return;
        }
        
        if (message.length < 10) {
            showNotification('Message seems too short. Please provide more context.', 'warning');
            return;
        }
        
        // Disable analyze button and show loading state
        const originalText = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        analyzeBtn.disabled = true;
        
        try {
            // Show loading state on output section
            outputSection.style.display = 'block';
            document.getElementById('guidanceContent').innerHTML = 
                '<div class="spinner"></div><p style="text-align: center;">Analyzing message...</p>';
            document.getElementById('replyContent').innerHTML = 
                '<div class="spinner"></div><p style="text-align: center;">Generating reply...</p>';
            document.getElementById('riskBadge').textContent = 'ANALYZING';
            document.getElementById('riskBadge').className = 'risk-badge';
            document.getElementById('riskReason').textContent = 'Processing your message...';
            
            // Call backend API
            const response = await fetch(`${settings.apiEndpoint}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update UI with analysis results
            updateAnalysisUI(data.analysis);
            document.getElementById('analysisTime').textContent = 
                `Analyzed at ${new Date().toLocaleTimeString()}`;
            
            // Save to history
            if (settings.enableHistory) {
                saveToHistory(message, data.analysis);
            }
            
            // Auto-copy if enabled
            if (settings.autoCopy) {
                copyToClipboard(data.analysis.clientReply);
                showNotification('Reply copied to clipboard!');
            }
            
            showNotification('Analysis complete!', 'success');
            
        } catch (error) {
            console.error('Analysis failed:', error);
            showNotification(`Analysis failed: ${error.message}`, 'error');
            
            // Show error state
            document.getElementById('guidanceContent').innerHTML = 
                `<p class="placeholder">Error: ${error.message}</p>`;
            document.getElementById('replyContent').innerHTML = 
                `<p class="placeholder">Could not generate reply. Please try again.</p>`;
            document.getElementById('riskBadge').textContent = 'ERROR';
            document.getElementById('riskBadge').className = 'risk-badge';
            document.getElementById('riskReason').textContent = 'Analysis failed';
            
        } finally {
            // Restore analyze button
            analyzeBtn.innerHTML = originalText;
            analyzeBtn.disabled = false;
        }
    }
    
    function updateAnalysisUI(analysis) {
        // Update risk card
        const riskCard = document.getElementById('riskCard');
        const riskBadge = document.getElementById('riskBadge');
        const riskReason = document.getElementById('riskReason');
        
        riskBadge.textContent = analysis.riskLevel;
        riskBadge.className = `risk-badge ${analysis.riskLevel.toLowerCase()}`;
        riskReason.textContent = analysis.riskReason;
        
        riskCard.className = `card risk-card ${analysis.riskLevel.toLowerCase()}-risk`;
        
        // Update guidance
        const guidanceContent = document.getElementById('guidanceContent');
        guidanceContent.innerHTML = formatHinglishText(analysis.internalGuidance);
        
        // Update reply
        const replyContent = document.getElementById('replyContent');
        replyContent.innerHTML = formatEnglishText(analysis.clientReply);
    }
    
    function formatHinglishText(text) {
        // Add some formatting for Hinglish text
        return text
            .split('\n')
            .map(line => {
                if (line.trim().startsWith('-')) {
                    return `<div class="bullet-point">${line}</div>`;
                }
                if (line.trim().length === 0) {
                    return '<br>';
                }
                return `<p>${line}</p>`;
            })
            .join('');
    }
    
    function formatEnglishText(text) {
        // Format English reply with better readability
        return `<div class="reply-text">${text.replace(/\n/g, '<br>')}</div>`;
    }
    
    function saveToHistory(originalMessage, analysis) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message: originalMessage.substring(0, 100) + (originalMessage.length > 100 ? '...' : ''),
            riskLevel: analysis.riskLevel,
            replyPreview: analysis.clientReply.substring(0, 150) + (analysis.clientReply.length > 150 ? '...' : '')
        };
        
        analysisHistory.unshift(historyItem); // Add to beginning
        if (analysisHistory.length > 10) {
            analysisHistory = analysisHistory.slice(0, 10); // Keep only last 10
        }
        
        saveHistory();
        updateHistoryUI();
    }
    
    function updateHistoryUI() {
        const historyList = document.getElementById('historyList');
        
        if (analysisHistory.length === 0) {
            historyList.innerHTML = '<p class="empty-history">No recent analysis. Your analysis history will appear here.</p>';
            return;
        }
        
        historyList.innerHTML = analysisHistory.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-meta">
                    <span class="risk-badge ${item.riskLevel.toLowerCase()}">${item.riskLevel}</span>
                    <span>${new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <p class="history-preview">${item.message}</p>
                <div class="history-meta">
                    <small>Click to copy reply</small>
                </div>
            </div>
        `).join('');
        
        // Add click events to history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const historyItem = analysisHistory.find(h => h.id == item.dataset.id);
                if (historyItem) {
                    messageInput.value = historyItem.message;
                    analyzeMessage();
                }
            });
        });
    }
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }
    
    function copyAllAnalysis() {
        const guidance = document.getElementById('guidanceContent').textContent;
        const reply = document.getElementById('replyContent').textContent;
        const risk = document.getElementById('riskBadge').textContent + ' - ' + 
                     document.getElementById('riskReason').textContent;
        
        const allText = `RISK: ${risk}\n\nINTERNAL GUIDANCE:\n${guidance}\n\nREADY-TO-SEND REPLY:\n${reply}`;
        
        copyToClipboard(allText);
        showNotification('All analysis copied to clipboard!');
    }
    
    function copyReplyAndClose() {
        const reply = document.getElementById('replyContent').textContent;
        copyToClipboard(reply);
        showNotification('Reply copied! Ready to paste in Fiverr/Upwork.');
        
        // Optionally clear the input for next message
        messageInput.value = '';
        updateCharCount();
    }
    
    function clearInput() {
        if (messageInput.value.trim() && !confirm('Clear the message?')) {
            return;
        }
        messageInput.value = '';
        updateCharCount();
        outputSection.style.display = 'none';
        showNotification('Input cleared');
    }
    
    function loadExample() {
        const examples = [
            "Hi, I need a complete e-commerce website with payment gateway integration. I want to use WooCommerce. Can you give me a fixed price and timeline? Also, I need it within 2 weeks.",
            "URGENT: Contact me on WhatsApp at +1234567890 to discuss my project. I'll pay you double your rate if you start today.",
            "I need someone to fix my WordPress site that's showing a white screen. The error log shows PHP memory issues. Can you help debug this? What's your hourly rate?",
            "I want to build a website like Facebook but better. I have $100 budget. Can you do it? Contact me on Telegram for details.",
            "Hello, I need a responsive website for my consulting business. I have a logo and brand colors. Can you show me examples of similar sites you've built?"
        ];
        
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        messageInput.value = randomExample;
        updateCharCount();
        showNotification('Example loaded. Click "Analyze Message" to see how it works.');
    }
    
    function updateCharCount() {
        const count = messageInput.value.length;
        charCount.textContent = count;
        
        if (count > 5000) {
            charCount.style.color = 'var(--danger-color)';
            analyzeBtn.disabled = true;
        } else if (count > 4000) {
            charCount.style.color = 'var(--warning-color)';
            analyzeBtn.disabled = false;
        } else {
            charCount.style.color = '';
            analyzeBtn.disabled = false;
        }
    }
    
    function openSettingsModal() {
        apiEndpointInput.value = settings.apiEndpoint;
        document.getElementById('enableHistory').checked = settings.enableHistory;
        document.getElementById('autoCopy').checked = settings.autoCopy;
        document.getElementById('settingsModal').style.display = 'flex';
    }
    
    function saveSettings() {
        settings.apiEndpoint = apiEndpointInput.value.trim();
        settings.enableHistory = document.getElementById('enableHistory').checked;
        settings.autoCopy = document.getElementById('autoCopy').checked;
        
        saveSettingsToStorage();
        checkBackendConnection();
        document.getElementById('settingsModal').style.display = 'none';
        showNotification('Settings saved!');
    }
    
    function loadSettings() {
        const saved = localStorage.getItem('freelancerCopilotSettings');
        if (saved) {
            try {
                settings = { ...settings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
    }
    
    function saveSettingsToStorage() {
        localStorage.setItem('freelancerCopilotSettings', JSON.stringify(settings));
    }
    
    function loadHistory() {
        const saved = localStorage.getItem('freelancerCopilotHistory');
        if (saved) {
            try {
                analysisHistory = JSON.parse(saved);
                updateHistoryUI();
            } catch (e) {
                console.error('Failed to load history:', e);
            }
        }
    }
    
    function saveHistory() {
        localStorage.setItem('freelancerCopilotHistory', JSON.stringify(analysisHistory));
    }
    
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? 'var(--danger-color)' : 
                        type === 'warning' ? 'var(--warning-color)' : 
                        type === 'success' ? 'var(--safe-color)' : 'var(--primary-color)'};
            color: white;
            border-radius: 8px;
            box-shadow: var(--shadow-hover);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        document.body.appendChild(notification);
        
        // Add keyframes for animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Helper function for API calls with timeout
    window.AbortSignal.timeout = function(ms) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(new Error('Request timeout')), ms);
        return controller.signal;
    };
});