// ============================================
// ARKA SYSTEM MANAGER - UTILITIES LIBRARY
// Version: 3.0.0
// Description: Comprehensive helper functions
// ============================================

// ============================================
// Section 1: General Helper Functions
// ============================================

/**
 * Create delay (for simulating async operations)
 * @param {number} ms - Delay duration in milliseconds
 * @returns {Promise} - Promise that resolves after delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Format numbers (e.g., 1000 to "1,000" or "1K")
 * @param {number} num - Input number
 * @param {boolean} compact - Compact mode (e.g., 1K)
 * @returns {string} - Formatted string
 */
const formatNumber = (num, compact = false) => {
    if (compact && num >= 1000) {
        const units = ['', 'K', 'M', 'G'];
        const unitIndex = Math.floor(Math.log10(num) / 3);
        const scaled = num / Math.pow(1000, unitIndex);
        return `${scaled.toFixed(1)}${units[unitIndex]}`;
    }
    return num.toLocaleString('en-US');
};

/**
 * Generate color based on percentage (Green → Yellow → Red)
 * @param {number} percent - Percentage (0-100)
 * @returns {string} - HEX color code
 */
const getPercentageColor = (percent) => {
    if (percent < 50) return '#10b981'; // Green
    if (percent < 80) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
};

/**
 * Deep clone objects
 * @param {any} obj - Object to clone
 * @returns {any} - Cloned object
 */
const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
};

/**
 * Merge objects deeply
 * @param {object} target - Target object
 * @param {object} source - Source object
 * @returns {object} - Merged object
 */
const deepMerge = (target, source) => {
    const output = deepClone(target);
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                output[key] = deepMerge(output[key] || {}, source[key]);
            } else {
                output[key] = source[key];
            }
        }
    }
    return output;
};

// ============================================
// Section 2: Chart and Data Functions
// ============================================

/**
 * Generate simulated data for charts
 * @param {number} count - Number of data points
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} type - Data type: cpu, ram, disk, network
 * @returns {Array} - Array of data points
 */
const generateChartData = (count = 60, min = 20, max = 90, type = 'cpu') => {
    const data = [];
    const now = Date.now();
    const baseValue = (min + max) / 2;
    
    for (let i = count - 1; i >= 0; i--) {
        const timeOffset = i * 1000; // Each point 1 second ago
        const timestamp = now - timeOffset;
        
        // Create more natural fluctuations
        let value;
        const randomFactor = Math.random() * 0.1 - 0.05;
        
        switch(type) {
            case 'cpu':
                value = baseValue * (1 + Math.sin(i * 0.1) * 0.3 + randomFactor);
                break;
            case 'ram':
                value = baseValue * (1 + Math.sin(i * 0.05) * 0.2 + randomFactor);
                break;
            case 'disk':
                value = baseValue * (1 + Math.sin(i * 0.03) * 0.15 + randomFactor);
                break;
            case 'network':
                value = baseValue * (1 + Math.sin(i * 0.2) * 0.4 + randomFactor);
                break;
            default:
                value = baseValue * (1 + randomFactor);
        }
        
        // Limit value between min and max
        value = Math.max(min, Math.min(max, value));
        
        data.push({
            x: new Date(timestamp),
            y: Number(value.toFixed(1))
        });
    }
    
    return data;
};

/**
 * Filter chart data by time range
 * @param {Array} data - Original data
 * @param {string} range - Time range: '1m', '5m', '1h', '1d'
 * @returns {Array} - Filtered data
 */
const filterDataByTimeRange = (data, range = '1m') => {
    const now = Date.now();
    let timeLimit;
    
    switch(range) {
        case '1m': timeLimit = 60 * 1000; break;
        case '5m': timeLimit = 5 * 60 * 1000; break;
        case '1h': timeLimit = 60 * 60 * 1000; break;
        case '1d': timeLimit = 24 * 60 * 60 * 1000; break;
        default: timeLimit = 60 * 1000;
    }
    
    return data.filter(point => {
        const pointTime = point.x instanceof Date ? point.x.getTime() : point.x;
        return (now - pointTime) <= timeLimit;
    });
};

// ============================================
// Section 3: LocalStorage Management
// ============================================

const STORAGE_KEYS = {
    CHAT_HISTORY: 'arka_chat_history',
    PINNED_COMMANDS: 'arka_pinned_commands',
    USER_PROFILES: 'arka_user_profiles',
    SYSTEM_SETTINGS: 'arka_system_settings',
    ANALYTICS: 'arka_analytics'
};

/**
 * Save item to localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 * @param {boolean} useCompression - Use compression (for large data)
 */
const saveToStorage = (key, data, useCompression = false) => {
    try {
        let dataToSave = data;
        
        if (useCompression && typeof data === 'object') {
            // Simple compression for large data
            const jsonStr = JSON.stringify(data);
            if (jsonStr.length > 5000) {
                dataToSave = btoa(encodeURIComponent(jsonStr));
            }
        }
        
        const storageData = {
            value: dataToSave,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        localStorage.setItem(key, JSON.stringify(storageData));
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        return false;
    }
};

/**
 * Load item from localStorage
 * @param {string} key - Storage key
 * @returns {any} - Loaded data
 */
const loadFromStorage = (key) => {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return null;
        
        const parsed = JSON.parse(stored);
        
        // Check expiry (optional - can be configured)
        const EXPIRY_TIME = 30 * 24 * 60 * 60 * 1000; // 30 days
        if (Date.now() - parsed.timestamp > EXPIRY_TIME) {
            localStorage.removeItem(key);
            return null;
        }
        
        let data = parsed.value;
        
        // Detect and extract compressed data
        if (typeof data === 'string' && data.length > 100 && /^[A-Za-z0-9+/=]+$/.test(data)) {
            try {
                data = JSON.parse(decodeURIComponent(atob(data)));
            } catch {
                // If not compressed, continue
            }
        }
        
        return data;
    } catch (error) {
        console.error('Storage load error:', error);
        return null;
    }
};

/**
 * Chat history manager
 */
const chatHistoryManager = {
    addEntry: (userInput, aiResponse, category = 'general') => {
        const history = loadFromStorage(STORAGE_KEYS.CHAT_HISTORY) || [];
        const newEntry = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            userInput,
            aiResponse,
            category,
            timestamp: Date.now(),
            tags: []
        };
        
        history.unshift(newEntry); // Add to beginning
        if (history.length > 100) history.pop(); // Limit count
        
        saveToStorage(STORAGE_KEYS.CHAT_HISTORY, history);
        return newEntry;
    },
    
    getByCategory: (category) => {
        const history = loadFromStorage(STORAGE_KEYS.CHAT_HISTORY) || [];
        return history.filter(entry => entry.category === category);
    },
    
    searchHistory: (keyword) => {
        const history = loadFromStorage(STORAGE_KEYS.CHAT_HISTORY) || [];
        const searchLower = keyword.toLowerCase();
        return history.filter(entry => 
            entry.userInput.toLowerCase().includes(searchLower) ||
            entry.aiResponse.toLowerCase().includes(searchLower)
        );
    },
    
    clearHistory: () => {
        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    }
};

// ============================================
// Section 4: Security and Sanitization
// ============================================

/**
 * Sanitize and clean user input (prevent XSS)
 * @param {string} input - Input text
 * @returns {string} - Sanitized text
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    
    // Convert special characters to entities
    let sanitized = tempDiv.innerHTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    
    // Remove dangerous tags (if any remain)
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    return sanitized;
};

/**
 * Validate email
 * @param {string} email - Email address
 * @returns {boolean} - Validity
 */
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validate system commands (prevent code injection)
 * @param {string} command - Input command
 * @returns {boolean} - Safe command
 */
const validateSystemCommand = (command) => {
    const dangerousPatterns = [
        /rm\s+-rf/,
        /format\s+[a-z]:/i,
        /del\s+\/s/i,
        /shutdown\s+-\w*s/i,
        /mkfs\./,
        /dd\s+if=/,
        /wget\s+http/i,
        /curl\s+http/i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(command));
};

/**
 * Generate UUID
 * @returns {string} - UUID string
 */
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Hash string (simple hash for internal use)
 * @param {string} str - String to hash
 * @returns {string} - Hash
 */
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
};

// ============================================
// Section 5: SEO and Optimization
// ============================================

/**
 * Dynamically set page title
 * @param {string} title - New title
 */
const setPageTitle = (title) => {
    if (title && typeof title === 'string') {
        document.title = `${title} - Arka System Manager`;
        
        // Also update meta description for better SEO
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', 
                `Arka - ${title}. Smart Windows management system with AI. Optimization, monitoring and automatic troubleshooting.`);
        }
    }
};

/**
 * Track analytics events (simplified)
 * @param {string} eventName - Event name
 * @param {object} eventData - Event data
 */
const trackEvent = (eventName, eventData = {}) => {
    // In production, this would be Google Analytics or Matomo
    console.log(`📊 Event tracked: ${eventName}`, {
        ...eventData,
        timestamp: new Date().toISOString(),
        url: window.location.href
    });
    
    // Save in localStorage for internal reporting
    const analytics = loadFromStorage(STORAGE_KEYS.ANALYTICS) || [];
    analytics.push({
        event: eventName,
        data: eventData,
        time: Date.now()
    });
    
    if (analytics.length > 500) analytics.shift();
    saveToStorage(STORAGE_KEYS.ANALYTICS, analytics);
};

// ============================================
// Section 6: AI Assistant Functions
// ============================================

/**
 * Generate ready-made templates for AI Assistant
 * @param {string} templateType - Template type
 * @returns {string} - Template text
 */
const getAITemplate = (templateType) => {
    const templates = {
        'analyze_slowdown': `My system has slowed down. Please:
1. Analyze which processes are consuming the most CPU and RAM
2. Suggest unnecessary services that can be disabled
3. Provide optimal settings to increase system speed`,
        
        'gaming_optimization': `I want to optimize my system for gaming. Please:
1. Suggest optimal graphics and energy settings for gaming
2. Windows services that can be temporarily disabled during gaming
3. Process priority settings for games`,
        
        'create_script': `I need a script for:
[Specify script purpose here]
Please design the script structure and provide execution guide`,
        
        'security_scan': `Perform a security check:
1. Check suspicious files
2. Analyze open ports
3. Check necessary security patches
4. Report antivirus status`,
        
        'system_report': `Generate a comprehensive system report including:
1. Hardware specifications
2. Performance metrics
3. Security status
4. Optimization recommendations`,
        
        'network_troubleshoot': `My network is slow. Please:
1. Diagnose network issues
2. Check for bandwidth hogs
3. Optimize network settings
4. Suggest improvements`
    };
    
    return templates[templateType] || 'Please enter your question or request.';
};

/**
 * Auto-categorize AI commands based on content
 * @param {string} command - Input command
 * @returns {string} - Category
 */
const categorizeCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    const categories = {
        'system': ['cpu', 'ram', 'memory', 'processing', 'process', 'memory', 'system'],
        'network': ['network', 'internet', 'ping', 'port', 'speed', 'download', 'upload'],
        'security': ['security', 'virus', 'antivirus', 'scan', 'malware', 'firewall'],
        'gaming': ['game', 'gaming', 'graphics', 'fps', 'performance'],
        'optimization': ['optimize', 'fast', 'slow', 'speed', 'boost', 'performance'],
        'disk': ['disk', 'storage', 'drive', 'hdd', 'ssd', 'space'],
        'automation': ['script', 'automation', 'batch', 'schedule', 'task']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowerCommand.includes(keyword))) {
            return category;
        }
    }
    
    return 'general';
};

// ============================================
// Section 7: UI and Animation
// ============================================

/**
 * Animate progress bar smoothly
 * @param {HTMLElement} element - Progress bar element
 * @param {number} targetPercent - Target percentage
 * @param {number} duration - Animation duration (ms)
 * @returns {Promise} - Promise that resolves when animation completes
 */
const animateProgressBar = async (element, targetPercent, duration = 2000) => {
    if (!element) return;
    
    const startTime = Date.now();
    const startPercent = parseFloat(element.style.width) || 0;
    
    return new Promise((resolve) => {
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for natural movement
            const easeOut = (t) => 1 - Math.pow(1 - t, 3);
            const currentPercent = startPercent + (targetPercent - startPercent) * easeOut(progress);
            
            element.style.width = `${currentPercent}%`;
            
            // Change color based on percentage
            if (currentPercent < 50) {
                element.style.backgroundColor = '#10b981';
            } else if (currentPercent < 80) {
                element.style.backgroundColor = '#f59e0b';
            } else {
                element.style.backgroundColor = '#ef4444';
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        };
        
        requestAnimationFrame(animate);
    });
};

/**
 * Create glow effect on cards
 * @param {HTMLElement} card - Card element
 * @param {boolean} enable - Enable/disable
 */
const setCardGlowEffect = (card, enable = true) => {
    if (!card) return;
    
    if (enable) {
        card.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
        card.style.transition = 'box-shadow 0.3s ease';
    } else {
        card.style.boxShadow = '';
    }
};

/**
 * Show toast notification
 * @param {string} message - Message text
 * @param {string} type - Message type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Display duration (ms)
 */
const showToast = (message, type = 'info', duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="toast-icon"></i>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? 'rgba(16, 185, 129, 0.9)' :
                   type === 'error' ? 'rgba(239, 68, 68, 0.9)' :
                   type === 'warning' ? 'rgba(245, 158, 11, 0.9)' :
                   'rgba(59, 130, 246, 0.9)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px'
    });
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    });
};

// ============================================
// Section 8: System Simulation
// ============================================

/**
 * Simulate a system operation (like scan or optimization)
 * @param {string} operationType - Operation type
 * @returns {Promise<object>} - Operation result
 */
const simulateSystemOperation = async (operationType) => {
    const operations = {
        'memory_optimization': {
            name: 'Memory Optimization',
            steps: ['Checking processes', 'Clearing cache', 'Reallocating memory', 'Completed'],
            duration: 3000
        },
        'security_scan': {
            name: 'Security Scan',
            steps: ['Scanning system files', 'Checking registry', 'Analyzing network', 'Generating report', 'Completed'],
            duration: 5000
        },
        'troubleshoot': {
            name: 'System Troubleshooting',
            steps: ['Diagnosing problem', 'Checking logs', 'Finding solution', 'Applying settings', 'Completed'],
            duration: 4000
        },
        'disk_cleanup': {
            name: 'Disk Cleanup',
            steps: ['Scanning for temp files', 'Analyzing disk usage', 'Removing junk files', 'Optimizing storage', 'Completed'],
            duration: 6000
        },
        'registry_scan': {
            name: 'Registry Scan',
            steps: ['Scanning registry', 'Finding errors', 'Creating backup', 'Fixing issues', 'Completed'],
            duration: 4500
        }
    };
    
    const operation = operations[operationType] || operations.memory_optimization;
    const log = [];
    
    // Simulate steps
    for (let i = 0; i < operation.steps.length; i++) {
        const step = operation.steps[i];
        const progress = ((i + 1) / operation.steps.length) * 100;
        
        log.push({
            step: step,
            progress: progress,
            timestamp: new Date().toLocaleTimeString('fa-IR'),
            status: i === operation.steps.length - 1 ? 'completed' : 'in_progress'
        });
        
        // Delay between steps
        await delay(operation.duration / operation.steps.length);
    }
    
    // Final result
    const results = {
        success: Math.random() > 0.1, // 90% success rate
        freedMemory: operationType === 'memory_optimization' ? Math.floor(Math.random() * 500) + 100 : 0,
        threatsFound: operationType === 'security_scan' ? Math.floor(Math.random() * 3) : 0,
        issuesResolved: operationType === 'troubleshoot' ? Math.floor(Math.random() * 5) + 1 : 0,
        filesCleaned: operationType === 'disk_cleanup' ? Math.floor(Math.random() * 1000) + 100 : 0,
        registryFixed: operationType === 'registry_scan' ? Math.floor(Math.random() * 20) + 5 : 0,
        executionTime: operation.duration,
        log: log
    };
    
    return results;
};

// ============================================
// Section 9: Date and Time
// ============================================

/**
 * Format Persian date
 * @param {Date} date - Date object
 * @param {string} format - Format string
 * @returns {string} - Formatted date
 */
const formatPersianDate = (date, format = 'YYYY/MM/DD') => {
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch {
        return date.toLocaleDateString();
    }
};

/**
 * Get relative time (e.g., "2 minutes ago")
 * @param {Date} date - Date object
 * @returns {string} - Relative time string
 */
const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'همین الان';
    if (minutes < 60) return `${minutes} دقیقه پیش`;
    if (hours < 24) return `${hours} ساعت پیش`;
    if (days < 7) return `${days} روز پیش`;
    
    return formatPersianDate(date);
};

// ============================================
// Section 10: Network Utilities
// ============================================

/**
 * Check internet connection
 * @returns {Promise<boolean>} - Connection status
 */
const checkInternetConnection = async () => {
    try {
        const response = await fetch('https://www.google.com/favicon.ico', {
            method: 'HEAD',
            mode: 'no-cors'
        });
        return true;
    } catch {
        return false;
    }
};

/**
 * Simulate ping to servers
 * @param {Array} servers - Array of server addresses
 * @returns {Promise<Array>} - Ping results
 */
const pingServers = async (servers = ['8.8.8.8', '1.1.1.1']) => {
    const results = [];
    
    for (const server of servers) {
        const start = Date.now();
        await delay(Math.random() * 100 + 20); // Simulate network delay
        const latency = Date.now() - start;
        
        results.push({
            server,
            latency,
            status: 'online'
        });
    }
    
    return results;
};

// ============================================
// Section 11: Export
// ============================================

// Export for ES6 modules
export {
    delay,
    formatNumber,
    getPercentageColor,
    deepClone,
    deepMerge,
    generateChartData,
    filterDataByTimeRange,
    saveToStorage,
    loadFromStorage,
    STORAGE_KEYS,
    chatHistoryManager,
    sanitizeInput,
    validateEmail,
    validateSystemCommand,
    generateUUID,
    hashString,
    setPageTitle,
    trackEvent,
    getAITemplate,
    categorizeCommand,
    animateProgressBar,
    setCardGlowEffect,
    showToast,
    simulateSystemOperation,
    formatPersianDate,
    getRelativeTime,
    checkInternetConnection,
    pingServers
};

// Also set as global for script tag compatibility
if (typeof window !== 'undefined') {
    window.ArkaUtils = {
        delay,
        formatNumber,
        getPercentageColor,
        deepClone,
        deepMerge,
        generateChartData,
        filterDataByTimeRange,
        saveToStorage,
        loadFromStorage,
        STORAGE_KEYS,
        chatHistoryManager,
        sanitizeInput,
        validateEmail,
        validateSystemCommand,
        generateUUID,
        hashString,
        setPageTitle,
        trackEvent,
        getAITemplate,
        categorizeCommand,
        animateProgressBar,
        setCardGlowEffect,
        showToast,
        simulateSystemOperation,
        formatPersianDate,
        getRelativeTime,
        checkInternetConnection,
        pingServers
    };
}

console.log('✅ utils.js loaded successfully with 25+ helper functions.');
