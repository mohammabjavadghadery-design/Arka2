// ============================================
// ARKA SYSTEM MANAGER - MAIN JAVASCRIPT
// Version: 1.0.0
// Description: Core application logic
// ============================================

// ============================================
// Section 1: Initialization
// ============================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Arka System Manager v1.0 initialized');
    
    // Welcome message in console
    console.log(`
    ╔═══════════════════════════════════════╗
    ║      Arka System Manager v1.0         ║
    ║     Smart Windows Management with AI  ║
    ╚═══════════════════════════════════════╝
    `);
    
    // Initialize components
    await initializeComponents();
    
    // Start system monitoring
    startSystemMonitoring();
    
    // Load saved data
    loadSavedData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Run system health check
    runSystemHealthCheck();
    
    // Hide loading screen
    hideLoadingState();
});

/**
 * Initialize all system components
 */
async function initializeComponents() {
    try {
        // Show loading state
        showLoadingState('Initializing Arka...', 20);
        
        // 1. Initialize charts
        await initializeCharts();
        showLoadingState('Monitoring charts ready...', 40);
        
        // 2. Initialize AI Assistant
        initializeAIAssistant();
        showLoadingState('AI Assistant activated...', 60);
        
        // 3. Load system profiles
        loadSystemProfiles();
        showLoadingState('System profiles loaded...', 80);
        
        // 4. Initialize alert system
        initializeAlertSystem();
        showLoadingState('Alert system activated...', 95);
        
        // Complete initialization
        await delay(500);
        
        console.log('✅ All components initialized successfully');
        
        // Track analytics
        if (window.ArkaUtils) {
            window.ArkaUtils.trackEvent('system_initialized', {
                components: ['charts', 'ai_assistant', 'profiles', 'alerts']
            });
        }
        
    } catch (error) {
        console.error('❌ Component initialization error:', error);
        if (window.ArkaUtils) {
            window.ArkaUtils.showToast('System initialization error', 'error');
        }
    }
}

// ============================================
// Section 2: State Management
// ============================================

// Main application state
const AppState = {
    // System status
    systemStatus: {
        cpu: { usage: 0, temperature: 45, cores: 8, frequency: 3.2 },
        ram: { usage: 0, total: 16, used: 0, free: 16, cache: 2 },
        disk: { usage: 0, total: 512, used: 128, free: 384 },
        network: { up: 0, down: 0, connections: 0, ping: 28 },
        lastUpdate: null
    },
    
    // User settings
    userSettings: {
        theme: 'dark',
        autoOptimize: true,
        notifications: true,
        selectedProfile: 'default',
        aiAssistantEnabled: true,
        chartTimeRange: '5m'
    },
    
    // System profiles
    profiles: {
        gaming: {
            id: 'gaming',
            name: 'Gaming',
            icon: '🎮',
            description: 'Optimized for heavy gaming',
            settings: {
                priority: 'high',
                backgroundApps: 'minimal',
                powerMode: 'performance',
                visualEffects: false
            },
            active: false
        },
        work: {
            id: 'work',
            name: 'Work',
            icon: '💼',
            description: 'Suitable for office work and programming',
            settings: {
                priority: 'normal',
                backgroundApps: 'normal',
                powerMode: 'balanced',
                visualEffects: true
            },
            active: false
        },
        editing: {
            id: 'editing',
            name: 'Video Editing',
            icon: '🎬',
            description: 'Optimized for video editing software',
            settings: {
                priority: 'high',
                backgroundApps: 'limited',
                powerMode: 'performance',
                visualEffects: true
            },
            active: false
        },
        default: {
            id: 'default',
            name: 'Default',
            icon: '⚙️',
            description: 'Normal system settings',
            settings: {
                priority: 'normal',
                backgroundApps: 'normal',
                powerMode: 'balanced',
                visualEffects: true
            },
            active: true
        }
    },
    
    // AI Assistant history
    aiHistory: [],
    pinnedCommands: [],
    
    // Charts
    charts: {
        cpu: null,
        ram: null,
        disk: null,
        network: null
    },
    
    // Current page
    currentPage: 'dashboard'
};

// ============================================
// Section 3: Charts and System Monitoring
// ============================================

/**
 * Initialize system charts
 */
async function initializeCharts() {
    try {
        // Check for Chart.js
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js not loaded');
            return;
        }
        
        // Chart default settings
        Chart.defaults.font.family = "'Vazirmatn', 'Segoe UI', Tahoma, sans-serif";
        Chart.defaults.color = '#94a3b8';
        
        // Chart colors
        const chartColors = {
            cpu: { border: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' },
            ram: { border: '#10b981', background: 'rgba(16, 185, 129, 0.1)' },
            disk: { border: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' },
        network: { border: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }
        };
        
        // Common options
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { family: "'Vazirmatn', sans-serif" },
                    bodyFont: { family: "'Vazirmatn', sans-serif" },
                    rtl: true
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { maxRotation: 0 }
                },
                y: {
                    display: true,
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: function(value) { return value + '%'; }
                    }
                }
            }
        };
        
        // CPU Chart
        const cpuCtx = document.getElementById('cpuChart')?.getContext('2d');
        if (cpuCtx) {
            AppState.charts.cpu = new Chart(cpuCtx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'CPU Usage',
                        data: [],
                        borderColor: chartColors.cpu.border,
                        backgroundColor: chartColors.cpu.background,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        title: {
                            display: true,
                            text: 'CPU Usage',
                            color: '#f1f5f9',
                            font: { size: 14, family: "'Vazirmatn', sans-serif" }
                        }
                    }
                }
            });
        }
        
        // RAM Chart
        const ramCtx = document.getElementById('ramChart')?.getContext('2d');
        if (ramCtx) {
            AppState.charts.ram = new Chart(ramCtx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'RAM Usage',
                        data: [],
                        borderColor: chartColors.ram.border,
                        backgroundColor: chartColors.ram.background,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        title: {
                            display: true,
                            text: 'RAM Usage',
                            color: '#f1f5f9',
                            font: { size: 14, family: "'Vazirmatn', sans-serif" }
                        }
                    }
                }
            });
        }
        
        // Disk Chart
        const diskCtx = document.getElementById('diskChart')?.getContext('2d');
        if (diskCtx) {
            AppState.charts.disk = new Chart(diskCtx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Disk Usage',
                        data: [],
                        borderColor: chartColors.disk.border,
                        backgroundColor: chartColors.disk.background,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        title: {
                            display: true,
                            text: 'Storage Usage',
                            color: '#f1f5f9',
                            font: { size: 14, family: "'Vazirmatn', sans-serif" }
                        }
                    }
                }
            });
        }
        
        // Network Chart
        const networkCtx = document.getElementById('networkChart')?.getContext('2d');
        if (networkCtx) {
            AppState.charts.network = new Chart(networkCtx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Network Activity',
                        data: [],
                        borderColor: chartColors.network.border,
                        backgroundColor: chartColors.network.background,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    ...commonOptions,
                    plugins: {
                        ...commonOptions.plugins,
                        title: {
                            display: true,
                            text: 'Network Activity',
                            color: '#f1f5f9',
                            font: { size: 14, family: "'Vazirmatn', sans-serif" }
                        }
                    }
                }
            });
        }
        
        console.log('✅ System charts created');
        
    } catch (error) {
        console.error('❌ Chart creation error:', error);
    }
}

/**
 * Start real-time system monitoring
 */
function startSystemMonitoring() {
    // Simulate system monitoring every 2 seconds
    setInterval(() => {
        updateSystemStatus();
        updateCharts();
        checkAlerts();
    }, 2000);
    
    console.log('🔄 System monitoring started');
}

/**
 * Update system status
 */
function updateSystemStatus() {
    // Simulate system data
    AppState.systemStatus = {
        cpu: {
            usage: Math.min(100, Math.max(10, Math.random() * 80 + 10)),
            temperature: 40 + Math.random() * 20,
            cores: 8,
            frequency: 2.5 + Math.random() * 1.7
        },
        ram: {
            usage: Math.min(100, Math.max(20, Math.random() * 60 + 20)),
            total: 16,
            used: Math.floor(Math.random() * 10 + 6),
            free: 16 - (Math.floor(Math.random() * 10 + 6)),
            cache: 1 + Math.random() * 3
        },
        disk: {
            usage: Math.min(100, Math.max(15, Math.random() * 50 + 15)),
            total: 512,
            used: 128 + Math.random() * 100,
            free: 384 - Math.random() * 100
        },
        network: {
            up: Math.floor(Math.random() * 50),
            down: Math.floor(Math.random() * 100),
            connections: Math.floor(Math.random() * 20),
            ping: 20 + Math.random() * 50
        },
        lastUpdate: new Date()
    };
    
    // Update UI
    updateSystemStatusUI();
}

/**
 * Update system status UI
 */
function updateSystemStatusUI() {
    const status = AppState.systemStatus;
    
    // Update CPU card
    const cpuElement = document.getElementById('cpuUsage');
    if (cpuElement) {
        cpuElement.textContent = `${status.cpu.usage.toFixed(1)}%`;
        cpuElement.style.color = window.ArkaUtils ? 
            window.ArkaUtils.getPercentageColor(status.cpu.usage) : '#3b82f6';
    }
    
    // Update RAM card
    const ramElement = document.getElementById('ramUsage');
    if (ramElement) {
        ramElement.textContent = `${status.ram.usage.toFixed(1)}%`;
        ramElement.style.color = window.ArkaUtils ? 
            window.ArkaUtils.getPercentageColor(status.ram.usage) : '#10b981';
    }
    
    // Update Disk card
    const diskElement = document.getElementById('diskUsage');
    if (diskElement) {
        diskElement.textContent = `${status.disk.usage.toFixed(1)}%`;
        diskElement.style.color = window.ArkaUtils ? 
            window.ArkaUtils.getPercentageColor(status.disk.usage) : '#8b5cf6';
    }
    
    // Update Network card
    const networkElement = document.getElementById('networkActivity');
    if (networkElement) {
        networkElement.textContent = `${status.network.down} ↓ | ${status.network.up} ↑`;
    }
    
    // Update last update time
    const timeElement = document.getElementById('lastUpdateTime');
    if (timeElement && status.lastUpdate) {
        timeElement.textContent = status.lastUpdate.toLocaleTimeString('fa-IR');
    }
}

/**
 * Update charts with new data
 */
function updateCharts() {
    const now = new Date();
    
    // Update each chart
    Object.keys(AppState.charts).forEach(chartKey => {
        const chart = AppState.charts[chartKey];
        if (!chart) return;
        
        // Generate new data
        const newValue = AppState.systemStatus[chartKey]?.usage || 
                        (Math.random() * 60 + 20);
        
        // Add new data point
        chart.data.labels = chart.data.labels || [];
        chart.data.datasets[0].data = chart.data.datasets[0].data || [];
        
        // Add new point
        chart.data.labels.push(now.toLocaleTimeString('fa-IR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        }));
        chart.data.datasets[0].data.push(newValue);
        
        // Keep maximum 60 data points
        if (chart.data.labels.length > 60) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        
        // Update chart
        chart.update('none');
    });
}

// ============================================
// Section 4: AI Assistant
// ============================================

/**
 * Initialize AI Assistant
 */
function initializeAIAssistant() {
    // Load history from localStorage
    if (window.ArkaUtils) {
        AppState.aiHistory = window.ArkaUtils.loadFromStorage('arka_chat_history') || [];
        AppState.pinnedCommands = window.ArkaUtils.loadFromStorage('arka_pinned_commands') || [];
        
        // Update UI
        renderChatHistory();
        renderPinnedCommands();
    }
    
    // Load AI templates
    loadAITemplates();
    
    console.log('🤖 AI Assistant ready');
}

/**
 * Load AI templates
 */
function loadAITemplates() {
    const templatesContainer = document.getElementById('aiTemplates');
    if (!templatesContainer || !window.ArkaUtils) return;
    
    // Available templates
    const templates = [
        { id: 'analyze_slowdown', title: 'Analyze Slowdown', icon: '⏱️' },
        { id: 'gaming_optimization', title: 'Gaming Optimization', icon: '🎮' },
        { id: 'security_scan', title: 'Security Scan', icon: '🛡️' },
        { id: 'create_script', title: 'Create Script', icon: '📝' },
        { id: 'system_report', title: 'System Report', icon: '📊' }
    ];
    
    // Create template HTML
    templatesContainer.innerHTML = templates.map(template => `
        <div class="template-btn" data-template="${template.id}">
            <div class="template-icon">${template.icon}</div>
            <div class="template-title">${template.title}</div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.template-btn').forEach(template => {
        template.addEventListener('click', function() {
            const templateId = this.dataset.template;
            loadAITemplate(templateId);
        });
    });
}

/**
 * Load specific template into chat input
 * @param {string} templateId - Template ID
 */
function loadAITemplate(templateId) {
    if (!window.ArkaUtils) return;
    
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;
    
    const template = window.ArkaUtils.getAITemplate(templateId);
    if (template) {
        chatInput.value = template;
        chatInput.focus();
        
        // Show confirmation
        window.ArkaUtils.showToast(`Template "${templateId}" loaded`, 'success');
    }
}

/**
 * Send message to AI Assistant
 */
async function sendAIMessage() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput || !chatInput.value.trim()) return;
    
    const message = chatInput.value.trim();
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatMessages) return;
    
    try {
        // Sanitize user input
        const sanitizedMessage = window.ArkaUtils ? 
            window.ArkaUtils.sanitizeInput(message) : message;
        
        // Show user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user-message';
        userMessageDiv.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <div class="message-text">${sanitizedMessage}</div>
                <div class="message-time">${new Date().toLocaleTimeString('fa-IR')}</div>
            </div>
        `;
        chatMessages.appendChild(userMessageDiv);
        
        // Clear input
        chatInput.value = '';
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai-message typing';
        typingIndicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-text">
                    <span class="typing-dots">
                        <span>.</span><span>.</span><span>.</span>
                    </span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Simulate AI response delay
        await delay(1000 + Math.random() * 2000);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Generate AI response
        const aiResponse = await generateAIResponse(message);
        
        // Show AI response
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        aiMessageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-text">${aiResponse}</div>
                <div class="message-actions">
                    <button class="action-btn copy-btn" title="Copy">
                        📋
                    </button>
                    <button class="action-btn pin-btn" title="Save">
                        📌
                    </button>
                </div>
                <div class="message-time">${new Date().toLocaleTimeString('fa-IR')}</div>
            </div>
        `;
        chatMessages.appendChild(aiMessageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Save to history
        if (window.ArkaUtils) {
            const category = window.ArkaUtils.categorizeCommand(message);
            window.ArkaUtils.chatHistoryManager.addEntry(
                message,
                aiResponse,
                category
            );
            
            // Update UI history
            renderChatHistory();
        }
        
        // Track analytics
        if (window.ArkaUtils) {
            window.ArkaUtils.trackEvent('ai_message_sent', {
                category: category || 'general',
                length: message.length
            });
        }
        
    } catch (error) {
        console.error('❌ Message sending error:', error);
        if (window.ArkaUtils) {
            window.ArkaUtils.showToast('Error communicating with AI', 'error');
        }
    }
}

/**
 * Generate AI response (simulation)
 * @param {string} message - User message
 * @returns {Promise<string>} - AI response
 */
async function generateAIResponse(message) {
    // Simulate processing delay
    await delay(500 + Math.random() * 1000);
    
    const lowerMessage = message.toLowerCase();
    
    // Predefined responses
    if (lowerMessage.includes('slow') || lowerMessage.includes('کند')) {
        return `✅ Analyzing your system performance:
        
• CPU Usage: ${AppState.systemStatus.cpu.usage.toFixed(1)}% (${AppState.systemStatus.cpu.usage > 70 ? 'High' : 'Normal'})
• RAM Usage: ${AppState.systemStatus.ram.usage.toFixed(1)}% (${AppState.systemStatus.ram.usage > 80 ? 'Needs freeing' : 'Good'})
• Temperature: ${AppState.systemStatus.cpu.temperature.toFixed(1)}°C

💡 Suggestions:
1. Run "Memory Optimization" to free up RAM
2. Close unnecessary background applications
3. Check for Windows updates
4. Consider using "Gaming" profile for better performance

Would you like me to run memory optimization?`;
    }
    
    if (lowerMessage.includes('game') || lowerMessage.includes('گیم')) {
        return `🎮 For gaming optimization:
        
1. Switch to "Gaming" profile for best performance
2. Close background apps: Discord, Chrome, Spotify
3. Set process priority to High
4. Disable Windows Update temporarily
5. Current CPU temperature: ${AppState.systemStatus.cpu.temperature.toFixed(1)}°C

⚡ Performance improvements:
• 15-25% better FPS in most games
• Reduced input lag
• Smoother gameplay experience

Would you like to activate the Gaming profile?`;
    }
    
    if (lowerMessage.includes('security') || lowerMessage.includes('اسکن')) {
        return `🛡️ Running security analysis...
        
✅ Status:
• Windows Firewall: Active
• Windows Defender: Updated
• Open ports: ${AppState.systemStatus.network.connections}
• Security patches: Checking...

🔍 Scan Results:
• No malware detected
• 2 tracking cookies found and removed
• Network security: Good
• System integrity: Verified

📋 Recommendations:
1. Keep Windows updated
2. Use strong passwords
3. Enable two-factor authentication
4. Regular security scans

Would you like me to schedule automatic security scans?`;
    }
    
    // General responses
    const responses = [
        "I've received your request and I'm processing it...",
        "System check completed. Overall status is good.",
        "Do you need more detailed guidance?",
        "I can create a custom optimization script for you.",
        "I recommend selecting the profile that matches your current task.",
        "System analysis shows normal performance levels.",
        "Would you like me to check for any performance issues?",
        "I can help automate routine system maintenance tasks."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Render chat history in sidebar
 */
function renderChatHistory() {
    const historyContainer = document.getElementById('chatHistory');
    if (!historyContainer || !window.ArkaUtils) return;
    
    // Get last 10 items
    const recentHistory = AppState.aiHistory.slice(0, 10);
    
    historyContainer.innerHTML = recentHistory.length > 0 ? 
        recentHistory.map(entry => `
            <div class="history-item" data-id="${entry.id}">
                <div class="history-preview">${entry.userInput.substring(0, 50)}...</div>
                <div class="history-time">
                    ${new Date(entry.timestamp).toLocaleDateString('fa-IR')}
                </div>
            </div>
        `).join('') : 
        '<div class="empty-state">No history found</div>';
    
    // Add event listeners
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', function() {
            const entryId = this.dataset.id;
            const entry = AppState.aiHistory.find(e => e.id === entryId);
            if (entry) {
                loadChatHistoryEntry(entry);
            }
        });
    });
}

/**
 * Render pinned commands
 */
function renderPinnedCommands() {
    const pinnedContainer = document.getElementById('pinnedCommands');
    if (!pinnedContainer) return;
    
    pinnedContainer.innerHTML = AppState.pinnedCommands.length > 0 ? 
        AppState.pinnedCommands.map(cmd => `
            <div class="pinned-command">
                <div class="command-text">${cmd.command.substring(0, 60)}...</div>
                <button class="remove-pin" data-id="${cmd.id}">×</button>
            </div>
        `).join('') : 
        '<div class="empty-state">No saved commands</div>';
}

/**
 * Load chat history entry
 * @param {object} entry - History entry
 */
function loadChatHistoryEntry(entry) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    // Clear current messages
    chatMessages.innerHTML = '';
    
    // Add messages
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">
            <div class="message-text">${entry.userInput}</div>
            <div class="message-time">${new Date(entry.timestamp).toLocaleTimeString('fa-IR')}</div>
        </div>
    `;
    chatMessages.appendChild(userMessageDiv);
    
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'message ai-message';
    aiMessageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="message-text">${entry.aiResponse}</div>
            <div class="message-time">${new Date(entry.timestamp).toLocaleTimeString('fa-IR')}</div>
        </div>
    `;
    chatMessages.appendChild(aiMessageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ============================================
// Section 5: System Operations
// ============================================

/**
 * Run system optimization
 * @param {string} operationType - Operation type
 */
async function runSystemOperation(operationType) {
    try {
        // Show operation modal
        const operationModal = document.getElementById('progressModal');
        const operationTitle = document.getElementById('operationTitle');
        const operationProgress = document.getElementById('operationProgress');
        const operationLog = document.getElementById('operationLog');
        
        if (!operationModal || !operationTitle || !operationProgress || !operationLog) {
            throw new Error('Operation elements not found');
        }
        
        // Operation settings
        const operations = {
            memory_optimization: {
                title: 'Memory Optimization',
                color: '#10b981'
            },
            security_scan: {
                title: 'Security Scan',
                color: '#ef4444'
            },
            troubleshoot: {
                title: 'System Troubleshooting',
                color: '#f59e0b'
            }
        };
        
        const operation = operations[operationType] || operations.memory_optimization;
        
        // Set title
        operationTitle.textContent = operation.title;
        operationProgress.style.backgroundColor = operation.color;
        
        // Clear previous log
        operationLog.innerHTML = '<p>Starting operation...</p>';
        
        // Show modal
        operationModal.style.display = 'flex';
        
        // Run operation
        if (window.ArkaUtils) {
            const result = await window.ArkaUtils.simulateSystemOperation(operationType);
            
            // Update UI with results
            updateOperationResult(result);
            
            // Track event
            window.ArkaUtils.trackEvent('system_operation_completed', {
                type: operationType,
                success: result.success
            });
        }
        
        // Close modal after 3 seconds
        setTimeout(() => {
            operationModal.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('❌ Operation execution error:', error);
        if (window.ArkaUtils) {
            window.ArkaUtils.showToast('Operation execution error', 'error');
        }
    }
}

/**
 * Update operation result
 * @param {object} result - Operation result
 */
function updateOperationResult(result) {
    // Update system with new results
    if (result.success) {
        if (window.ArkaUtils) {
            window.ArkaUtils.showToast('Operation completed successfully', 'success');
        }
        
        // Update system status
        if (result.freedMemory > 0) {
            AppState.systemStatus.ram.free += result.freedMemory / 1024; // Convert to GB
            AppState.systemStatus.ram.usage = 
                ((AppState.systemStatus.ram.total - AppState.systemStatus.ram.free) / 
                AppState.systemStatus.ram.total) * 100;
        }
    } else {
        if (window.ArkaUtils) {
            window.ArkaUtils.showToast('Operation encountered an error', 'error');
        }
    }
}

// ============================================
// Section 6: Profile Management
// ============================================

/**
 * Load system profiles
 */
function loadSystemProfiles() {
    const profilesContainer = document.getElementById('systemProfiles');
    if (!profilesContainer) return;
    
    // Create profile HTML
    profilesContainer.innerHTML = Object.values(AppState.profiles).map(profile => `
        <div class="profile-card ${profile.active ? 'active' : ''}" data-profile="${profile.id}">
            <div class="profile-icon">${profile.icon}</div>
            <div class="profile-info">
                <h4>${profile.name}</h4>
                <p>${profile.description}</p>
                <div class="profile-tags">
                    ${Object.entries(profile.settings).map(([key, value]) => 
                        `<span class="profile-tag">${key}: ${value}</span>`
                    ).join('')}
                </div>
            </div>
            <button class="activate-btn ${profile.active ? 'active' : ''}">
                ${profile.active ? 'Active' : 'Activate'}
            </button>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.activate-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const profileCard = this.closest('.profile-card');
            const profileId = profileCard.dataset.profile;
            activateProfile(profileId);
        });
    });
    
    console.log('✅ System profiles loaded');
}

/**
 * Activate system profile
 * @param {string} profileId - Profile ID
 */
function activateProfile(profileId) {
    // Deactivate all profiles
    Object.keys(AppState.profiles).forEach(key => {
        AppState.profiles[key].active = false;
    });
    
    // Activate selected profile
    if (AppState.profiles[profileId]) {
        AppState.profiles[profileId].active = true;
        AppState.userSettings.selectedProfile = profileId;
        
        // Update UI
        loadSystemProfiles();
        
        // Apply profile settings
        applyProfileSettings(profileId);
        
        // Show notification
        if (window.ArkaUtils) {
            window.ArkaUtils.showToast(`Profile "${AppState.profiles[profileId].name}" activated`, 'success');
        }
        
        // Track event
        if (window.ArkaUtils) {
            window.ArkaUtils.trackEvent('profile_activated', {
                profile: profileId
            });
        }
    }
}

/**
 * Apply profile settings
 * @param {string} profileId - Profile ID
 */
function applyProfileSettings(profileId) {
    const profile = AppState.profiles[profileId];
    if (!profile) return;
    
    console.log(`🎯 Applying profile settings: ${profile.name}`);
    
    // Simulate applying settings
    switch (profileId) {
        case 'gaming':
            console.log('🎮 Gaming mode activated');
            break;
        case 'work':
            console.log('💼 Work mode activated');
            break;
        case 'editing':
            console.log('🎬 Editing mode activated');
            break;
    }
}

// ============================================
// Section 7: Alert System
// ============================================

/**
 * Initialize alert system
 */
function initializeAlertSystem() {
    console.log('🔔 Alert system activated');
}

/**
 * Check for alert conditions
 */
function checkAlerts() {
    const status = AppState.systemStatus;
    
    // Check CPU
    if (status.cpu.usage > 85) {
        showAlert('High CPU Usage Alert', 
            `CPU usage reached ${status.cpu.usage.toFixed(1)}%`, 
            'warning');
    }
    
    // Check RAM
    if (status.ram.usage > 90) {
        showAlert('High RAM Usage Alert',
            `RAM usage reached ${status.ram.usage.toFixed(1)}%`,
            'critical');
    }
    
    // Check temperature
    if (status.cpu.temperature > 75) {
        showAlert('High CPU Temperature',
            `CPU temperature reached ${status.cpu.temperature.toFixed(1)}°C`,
            'warning');
    }
}

/**
 * Show alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {string} type - Alert type
 */
function showAlert(title, message, type = 'info') {
    // Only if notifications are enabled
    if (!AppState.userSettings.notifications) return;
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `system-alert alert-${type}`;
    alertDiv.innerHTML = `
        <div class="alert-icon">
            ${type === 'critical' ? '🔥' : 
              type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
        </div>
        <button class="alert-close">×</button>
    `;
    
    // Add to page
    const alertsContainer = document.getElementById('alertsContainer');
    if (alertsContainer) {
        alertsContainer.appendChild(alertDiv);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.classList.add('fade-out');
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.parentNode.removeChild(alertDiv);
                    }
                }, 300);
            }
        }, 10000);
        
        // Close button
        alertDiv.querySelector('.alert-close').addEventListener('click', () => {
            alertDiv.classList.add('fade-out');
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 300);
        });
    }
}

// ============================================
// Section 8: Event Listeners
// ============================================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // System operation buttons
    document.querySelectorAll('[data-operation]').forEach(btn => {
        btn.addEventListener('click', function() {
            const operationType = this.dataset.operation;
            runSystemOperation(operationType);
        });
    });
    
    // Send message button
    const sendBtn = document.getElementById('sendMessageBtn');
    const chatInput = document.getElementById('chatInput');
    
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', sendAIMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAIMessage();
            }
        });
    }
    
    // Chart time range buttons
    document.querySelectorAll('[data-time-range]').forEach(btn => {
        btn.addEventListener('click', function() {
            const range = this.dataset.timeRange;
            changeChartTimeRange(range);
        });
    });
    
    // Settings toggles
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const settingId = this.id;
            const value = this.checked;
            
            // Update settings
            if (settingId === 'autoOptimizeToggle') {
                AppState.userSettings.autoOptimize = value;
            } else if (settingId === 'notificationsToggle') {
                AppState.userSettings.notifications = value;
            }
            
            // Save settings
            saveUserSettings();
        });
    });
    
    // Navigation
    setupNavigation();
    
    console.log('✅ Event listeners configured');
}

/**
 * Setup navigation
 */
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.dataset.page;
            switchPage(pageId);
        });
    });
}

/**
 * Switch between pages
 * @param {string} pageId - Page ID
 */
function switchPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        AppState.currentPage = pageId;
        
        // Update page title
        const pageTitles = {
            dashboard: 'Dashboard',
            'ai-center': 'AI Center',
            commands: 'Commands',
            monitor: 'Monitoring',
            security: 'Security',
            profiles: 'Profiles',
            docs: 'Documentation',
            market: 'Market',
            terminal: 'Terminal',
            about: 'About'
        };
        
        if (window.ArkaUtils) {
            window.ArkaUtils.setPageTitle(pageTitles[pageId] || 'Arka');
        }
        
        // Track page view
        if (window.ArkaUtils) {
            window.ArkaUtils.trackEvent('page_view', { page: pageId });
        }
    }
}

/**
 * Change chart time range
 * @param {string} range - Time range
 */
function changeChartTimeRange(range) {
    AppState.userSettings.chartTimeRange = range;
    
    // Update active buttons
    document.querySelectorAll('[data-time-range]').forEach(btn => {
        if (btn.dataset.timeRange === range) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Show notification
    if (window.ArkaUtils) {
        window.ArkaUtils.showToast(`Chart time range changed to ${range}`, 'info');
    }
}

// ============================================
// Section 9: Utility Functions
// ============================================

/**
 * Show loading state
 * @param {string} message - Loading message
 * @param {number} percent - Progress percentage
 */
function showLoadingState(message, percent) {
    const loadingElement = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const loadingBar = document.getElementById('loadingBar');
    
    if (loadingElement && loadingText) {
        loadingElement.style.display = 'flex';
        loadingText.textContent = message;
        
        if (loadingBar) {
            loadingBar.style.width = `${percent}%`;
        }
    }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const loadingElement = document.getElementById('loadingOverlay');
    if (loadingElement) {
        loadingElement.classList.add('fade-out');
        setTimeout(() => {
            loadingElement.style.display = 'none';
            loadingElement.classList.remove('fade-out');
        }, 500);
    }
}

/**
 * Load saved data
 */
function loadSavedData() {
    if (window.ArkaUtils) {
        const savedSettings = window.ArkaUtils.loadFromStorage('arka_system_settings');
        if (savedSettings) {
            AppState.userSettings = { ...AppState.userSettings, ...savedSettings };
            applyUserSettings();
        }
    }
}

/**
 * Save user settings
 */
function saveUserSettings() {
    if (window.ArkaUtils) {
        window.ArkaUtils.saveToStorage('arka_system_settings', AppState.userSettings);
    }
}

/**
 * Apply user settings
 */
function applyUserSettings() {
    // Apply theme
    document.body.setAttribute('data-theme', AppState.userSettings.theme);
    
    // Apply toggle switches
    const autoOptimizeToggle = document.getElementById('autoOptimizeToggle');
    const notificationsToggle = document.getElementById('notificationsToggle');
    
    if (autoOptimizeToggle) {
        autoOptimizeToggle.checked = AppState.userSettings.autoOptimize;
    }
    
    if (notificationsToggle) {
        notificationsToggle.checked = AppState.userSettings.notifications;
    }
}

/**
 * Run system health check
 */
function runSystemHealthCheck() {
    setTimeout(() => {
        const status = AppState.systemStatus;
        let healthScore = 100;
        
        // Calculate health score
        if (status.cpu.usage > 80) healthScore -= 20;
        if (status.ram.usage > 85) healthScore -= 20;
        if (status.disk.usage > 90) healthScore -= 15;
        if (status.cpu.temperature > 70) healthScore -= 10;
        
        // Update UI
        const healthElement = document.getElementById('systemHealth');
        if (healthElement) {
            healthElement.textContent = `Health Score: ${healthScore}/100`;
            healthElement.className = `health-status ${
                healthScore > 80 ? 'excellent' : 
                healthScore > 60 ? 'good' : 
                healthScore > 40 ? 'fair' : 'poor'
            }`;
        }
    }, 3000);
}

/**
 * Utility delay function
 * @param {number} ms - Milliseconds
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Section 10: Export for Console Access
// ============================================

// For developer console access
window.ArkaApp = {
    version: '1.0.0',
    state: AppState,
    utils: {
        runOptimization: (type) => runSystemOperation(type),
        activateProfile: (id) => activateProfile(id),
        sendAIMessage: sendAIMessage,
        showToast: (msg, type) => window.ArkaUtils ? window.ArkaUtils.showToast(msg, type) : null,
        getSystemStatus: () => AppState.systemStatus,
        switchPage: switchPage
    },
    debug: {
        resetSettings: () => {
            localStorage.clear();
            location.reload();
        },
        simulateHighLoad: () => {
            AppState.systemStatus.cpu.usage = 95;
            AppState.systemStatus.ram.usage = 98;
            updateSystemStatusUI();
            showAlert('Simulated high load', 'CPU and RAM usage artificially increased', 'warning');
        },
        testAI: (message) => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = message;
                sendAIMessage();
            }
        }
    }
};

console.log('💡 Use `ArkaApp` in console to access application functions.');

// ============================================
// Mobile Warning Handler
// ============================================

// Show mobile warning on small screens
function checkMobileWarning() {
    const isMobile = window.innerWidth < 768;
    const mobileWarning = document.getElementById('mobile-warning');
    
    if (isMobile && mobileWarning) {
        mobileWarning.style.display = 'flex';
    }
}

// Dismiss mobile warning
function dismissMobileWarning() {
    const mobileWarning = document.getElementById('mobile-warning');
    if (mobileWarning) {
        mobileWarning.style.display = 'none';
    }
}

// Check on load and resize
window.addEventListener('load', checkMobileWarning);
window.addEventListener('resize', checkMobileWarning);

// ============================================
// END OF MAIN.JS
// ============================================

console.log('✅ main.js loaded successfully.');
