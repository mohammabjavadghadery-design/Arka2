// ======================
// 🔐 Security Manager
// ======================
class SecurityManager {
  constructor() {
    this.sanitizer = new Sanitizer();
    this.xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\(/gi,
      /document\.cookie/gi
    ];
    this.sensitiveDataPatterns = [
      /api[_-]?key/i,
      /password/i,
      /secret/i,
      /token/i,
      /private[_-]?key/i,
      /access[_-]?token/i
    ];
    this.init();
  }

  init() {
    this.setupEventListeners();
    console.log('🔐 Security manager initialized');
  }

  setupEventListeners() {
    document.addEventListener('copy', (event) => this.handleCopyEvent(event));
    document.addEventListener('paste', (event) => this.handlePasteEvent(event));
    document.addEventListener('keydown', (event) => this.handleKeyboardEvent(event));
  }

  sanitizeInput(input) {
    if (!input || typeof input !== 'string') return input;
    
    let sanitized = input;
    this.xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized.trim();
  }

  containsXSS(input) {
    return this.xssPatterns.some(pattern => pattern.test(input));
  }

  containsSensitiveData(input) {
    return this.sensitiveDataPatterns.some(pattern => pattern.test(input));
  }

  handleCopyEvent(event) {
    const selection = window.getSelection().toString();
    if (selection && this.containsSensitiveData(selection)) {
      event.preventDefault();
      this.showSecurityWarning('کپی کردن این داده‌ها محدود شده است.');
    }
  }

  handlePasteEvent(event) {
    if (event.clipboardData) {
      const text = event.clipboardData.getData('text');
      if (this.containsXSS(text)) {
        event.preventDefault();
        this.showSecurityWarning('داده‌های کپی شده حاوی محتوای ناامن هستند.');
      }
    }
  }

  handleKeyboardEvent(event) {
    if (event.ctrlKey && event.key === 'u') {
      event.preventDefault();
      this.showSecurityWarning('مشاهده کد منبع محدود شده است.');
    }
  }

  showSecurityWarning(message) {
    const notification = document.createElement('div');
    notification.className = 'security-warning js-error';
    notification.innerHTML = `
      <i class="fas fa-shield-alt"></i>
      <span>${this.sanitizeInput(message)}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  validateCommand(command) {
    const dangerousCommands = [
      'format',
      'del /s',
      'rm -rf',
      'diskpart',
      'cipher',
      'attrib',
      'net user',
      'net localgroup'
    ];
    
    return !dangerousCommands.some(dangerous => 
      command.toLowerCase().includes(dangerous)
    );
  }
}

// ======================
// 🎵 Audio Manager
// ======================
class AudioManager {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {};
    this.volume = 0.7;
    this.enabled = true;
    this.init();
  }

  async init() {
    await this.loadSounds();
    console.log('🎵 Audio manager initialized');
  }

  async loadSounds() {
    const soundFiles = {
      click: 'https://arka-command-hub.ir/assets/media/sounds/click.wav',
      success: 'https://arka-command-hub.ir/assets/media/sounds/success.wav',
      error: 'https://arka-command-hub.ir/assets/media/sounds/error.wav',
      terminal: 'https://arka-command-hub.ir/assets/media/sounds/terminal.wav',
      notification: 'https://arka-command-hub.ir/assets/media/sounds/notification.wav'
    };

    for (const [name, url] of Object.entries(soundFiles)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
        this.sounds[name] = audioBuffer;
      } catch (error) {
        console.warn(`Failed to load sound ${name}:`, error);
      }
    }
  }

  play(name, volume = this.volume) {
    if (!this.enabled || !this.sounds[name]) return;

    const source = this.context.createBufferSource();
    source.buffer = this.sounds[name];

    const gainNode = this.context.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.context.destination);

    source.start(0);
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  toggle() {
    this.enabled = !this.enabled;
  }
}

// ======================
// 🎨 Theme Manager
// ======================
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
    console.log('🎨 Theme manager initialized');
  }

  setupEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  applyTheme(theme) {
    document.documentElement.classList.remove('dark-theme', 'light-theme', 'neon-theme');
    document.documentElement.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme);
    this.currentTheme = theme;
  }

  toggleTheme() {
    const themes = ['dark', 'neon'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.applyTheme(themes[nextIndex]);
  }
}

// ======================
// 🌐 System Profiler
// ======================
class SystemProfiler {
  constructor() {
    this.permissions = {
      basicInfo: false,
      performance: false,
      display: false,
      network: false,
      location: false
    };
    this.data = {};
    this.init();
  }

  async init() {
    this.showPermissionModal();
    console.log('🌐 System profiler initialized');
  }

  async showPermissionModal() {
    const modal = document.getElementById('system-profiler-modal');
    const overlay = document.getElementById('modal-overlay');
    
    if (modal && overlay) {
      overlay.style.display = 'flex';
      modal.classList.add('active');
      
      // Setup modal events
      modal.querySelector('.allow-btn').addEventListener('click', async () => {
        await this.requestPermission('basic');
        overlay.style.display = 'none';
        modal.classList.remove('active');
      });
      
      modal.querySelector('.deny-btn').addEventListener('click', () => {
        overlay.style.display = 'none';
        modal.classList.remove('active');
      });
    }
  }

  async requestPermission(level) {
    switch (level) {
      case 'basic':
        this.permissions.basicInfo = true;
        this.permissions.performance = false;
        break;
      case 'full':
        this.permissions.basicInfo = true;
        this.permissions.performance = true;
        break;
      case 'none':
        this.permissions.basicInfo = false;
        this.permissions.performance = false;
        break;
    }
    
    if (this.permissions.basicInfo) {
      await this.collectBasicInfo();
    }
    
    if (this.permissions.performance) {
      await this.collectPerformanceInfo();
    }
    
    localStorage.setItem('system-permissions', JSON.stringify(this.permissions));
    return true;
  }

  async collectBasicInfo() {
    if (!this.permissions.basicInfo) return null;
    
    this.data.basic = {
      os: this.detectOS(),
      browser: this.detectBrowser(),
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      hardware: {
        cores: navigator.hardwareConcurrency || 'نامشخص',
        deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'نامشخص'
      }
    };
    
    return this.data.basic;
  }

  async collectPerformanceInfo() {
    if (!this.permissions.performance) return null;
    
    this.data.performance = {
      cpu: await this.getCPUInfo(),
      memory: await this.getMemoryInfo(),
      network: await this.getNetworkInfo()
    };
    
    return this.data.performance;
  }

  detectOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows NT 10.0')) return 'Windows 10';
    if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
    if (ua.includes('Windows NT 6.2')) return 'Windows 8';
    if (ua.includes('Windows NT 6.1')) return 'Windows 7';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'نامشخص';
  }

  detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    return 'نامشخص';
  }

  async getCPUInfo() {
    // Basic CPU info using available APIs
    return {
      usage: Math.floor(Math.random() * 100), // Placeholder - real implementation needed
      temperature: Math.floor(Math.random() * 80) + 30, // Placeholder
      cores: navigator.hardwareConcurrency || 4,
      frequency: '2.4 GHz' // Placeholder
    };
  }

  async getMemoryInfo() {
    if ('deviceMemory' in navigator) {
      const totalMemory = navigator.deviceMemory;
      return {
        total: totalMemory,
        used: Math.floor(totalMemory * 0.7), // Placeholder
        free: Math.floor(totalMemory * 0.3)  // Placeholder
      };
    }
    return { total: 'نامشخص', used: 'نامشخص', free: 'نامشخص' };
  }

  async getNetworkInfo() {
    return {
      download: '12.8 Mbps', // Placeholder
      upload: '2.4 Mbps',    // Placeholder
      ping: '24ms',          // Placeholder
      connection: 'Wi-Fi'    // Placeholder
    };
  }
}

// ======================
// 🧠 AI Engine (Local)
// ======================
class AILocalEngine {
  constructor() {
    this.templates = {
      system_optimization: `# 🔧 بهینه‌سازی سیستم

**درخواست شما:** "{query}"

**راه‌حل‌های پیشنهادی:**

## 1. پاک‌سازی فایل‌های موقت
\`\`\`cmd
cleanmgr /sagerun:1
\`\`\`
*این دستور Disk Cleanup ویندوز را اجرا می‌کند.*

## 2. بهینه‌سازی Startup
\`\`\`powershell
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location
\`\`\`
*برای مشاهده برنامه‌های Startup*

## 3. آزادسازی حافظه
\`\`\`cmd
%windir%\\system32\\rundll32.exe advapi32.dll,ProcessIdleTasks
\`\`\`
*اجرای تسک‌های پس‌زمینه*

**نکات امنیتی:**
- قبل از اجرای دستورات، از داده‌های مهم بکاپ بگیرید
- دستورات را در محیط تست امتحان کنید
`,

      file_management: `# 📁 مدیریت فایل‌ها

**درخواست شما:** "{query}"

**راه‌حل‌های پیشنهادی:**

## 1. مشاهده فایل‌های حجیم
\`\`\`powershell
Get-ChildItem -Path C:\\ -Recurse -File | Sort-Object Length -Descending | Select-Object -First 10 FullName, Length
\`\`\`

## 2. پاک‌سازی فایل‌های موقت
\`\`\`cmd
del /q /s %temp%\\*.*
\`\`\`

**هشدار امنیتی:** ⚠️ دستور حذف فایل دائمی است. قبل از اجرا مطمئن شوید.
`,

      network: `# 🌐 مدیریت شبکه

**درخواست شما:** "{query}"

**راه‌حل‌های پیشنهادی:**

## 1. تست اتصال
\`\`\`cmd
ping 8.8.8.8 -t
\`\`\`
*برای خروج Ctrl+C را بزنید*

## 2. نمایش تنظیمات شبکه
\`\`\`cmd
ipconfig /all
\`\`\`
`,

      general: `# 🤖 آرکا - دستیار هوشمند

**سلام!** من آرکا هستم، دستیار هوشمند مدیریت سیستم ویندوز.

درخواست شما: "{query}"

برای کمک به شما، لطفاً یکی از موارد زیر را انجام دهید:

## 🎯 گزینه‌های موجود:

1. **درخواست را دقیق‌تر کنید**
   - مثلاً: "چگونه فایل‌های موقت را پاک کنم؟"
   - یا: "سرعت اینترنت را چطور تست کنم؟"

2. **از دستورات از پیش تعریف شده استفاده کنید**
   - به بخش "دستورات" مراجعه کنید
   - محیط CMD، PowerShell یا Run را انتخاب کنید

3. **سیستم خود را بررسی کنید**
   - از بخش "مانیتور" وضعیت سیستم را ببینید
   - مشکلات احتمالی را شناسایی کنید
`
    };
  }

  processQuery(query) {
    const lowerQuery = query.toLowerCase();
    let intent = 'general';

    if (lowerQuery.includes('بهینه') || lowerQuery.includes('سرعت') || lowerQuery.includes('کند')) {
      intent = 'system_optimization';
    } else if (lowerQuery.includes('فایل') || lowerQuery.includes('پاک') || lowerQuery.includes('حذف')) {
      intent = 'file_management';
    } else if (lowerQuery.includes('شبکه') || lowerQuery.includes('اینترنت') || lowerQuery.includes('اتصال')) {
      intent = 'network';
    }

    const template = this.templates[intent] || this.templates.general;
    return template.replace('{query}', query);
  }
}

// ======================
// 🎨 Quantum Background
// ======================
class QuantumBackground {
  constructor() {
    this.canvas = document.getElementById('quantum-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this.animationFrame = null;
    this.init();
  }

  init() {
    this.resizeCanvas();
    this.createParticles(100);
    this.setupEventListeners();
    this.start();
    console.log('🌌 Quantum background initialized');
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  createParticles(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: this.getRandomNeonColor()
      });
    }
  }

  getRandomNeonColor() {
    const colors = ['#00ff8c', '#00ffff', '#ff00ff', '#ff8c00', '#ffff00'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animate() {
    if (!this.running) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around edges
      if (particle.x < 0) particle.x = window.innerWidth;
      if (particle.x > window.innerWidth) particle.x = 0;
      if (particle.y < 0) particle.y = window.innerHeight;
      if (particle.y > window.innerHeight) particle.y = 0;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    });

    // Draw connections between nearby particles
    this.particles.forEach((particle1, i) => {
      this.particles.slice(i + 1).forEach(particle2 => {
        const dx = particle1.x - particle2.x;
        const dy = particle1.y - particle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle1.x, particle1.y);
          this.ctx.lineTo(particle2.x, particle2.y);
          this.ctx.strokeStyle = `rgba(0, 255, 140, ${0.1 * (1 - distance / 100)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      });
    });

    this.animationFrame = requestAnimationFrame(() => this.animate());
  }

  start() {
    this.running = true;
    this.animate();
  }

  pause() {
    this.running = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  resume() {
    this.running = true;
    this.animate();
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.particles = [];
      this.createParticles(100);
    });
  }

  cleanup() {
    this.pause();
  }
}

// ======================
// 📱 Device Detector
// ======================
class DeviceDetector {
  constructor() {
    this.isMobile = this.detectMobile();
    this.isTablet = this.detectTablet();
    this.isDesktop = !this.isMobile && !this.isTablet;
    this.init();
  }

  init() {
    if (this.isMobile || this.isTablet) {
      this.showMobileWarning();
    }
    console.log('📱 Device detector initialized');
  }

  detectMobile() {
    const userAgent = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }

  detectTablet() {
    const userAgent = navigator.userAgent;
    return /iPad|Android|Tablet/i.test(userAgent) && !/Mobile/i.test(userAgent);
  }

  showMobileWarning() {
    const warning = document.getElementById('mobile-warning');
    if (warning) {
      warning.style.display = 'flex';
      
      // Setup warning events
      warning.querySelector('#close-warning').addEventListener('click', () => {
        warning.style.display = 'none';
      });
      
      warning.querySelector('#proceed-anyway').addEventListener('click', () => {
        warning.style.display = 'none';
      });
    }
  }
}

// ======================
// 🎯 Notification Manager
// ======================
class NotificationManager {
  constructor() {
    this.init();
  }

  init() {
    console.log('🔔 Notification manager initialized');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} js-error`;
    notification.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }
}

// ======================
// 🏗️ Main Application
// ======================
class ArkaCommandHub {
  constructor() {
    this.securityManager = new SecurityManager();
    this.audioManager = new AudioManager();
    this.themeManager = new ThemeManager();
    this.systemProfiler = new SystemProfiler();
    this.aiEngine = new AILocalEngine();
    this.quantumBackground = new QuantumBackground();
    this.deviceDetector = new DeviceDetector();
    this.notificationManager = new NotificationManager();
    
    this.loadingProgress = 0;
    this.init();
  }

  async init() {
    await this.initializeLoadingScreen();
    await this.setupEventListeners();
    await this.initializePages();
    await this.updateSystemStats();
    this.hideLoadingScreen();
    
    console.log('🚀 Arka Command Hub initialized successfully');
  }

  async initializeLoadingScreen() {
    const loadingBar = document.getElementById('loading-bar');
    const loadingDetails = document.getElementById('loading-details');
    
    const steps = [
      { text: 'بارگذاری هسته سیستم...', progress: 20 },
      { text: 'راه‌اندازی امنیت...', progress: 40 },
      { text: 'پیکربندی صدا...', progress: 60 },
      { text: 'راه‌اندازی هوش مصنوعی...', progress: 80 },
      { text: 'آماده‌سازی رابط کاربری...', progress: 100 }
    ];

    for (const step of steps) {
      if (loadingBar) loadingBar.style.width = `${step.progress}%`;
      if (loadingDetails) loadingDetails.textContent = step.text;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = item.getAttribute('data-page');
        this.switchPage(pageId);
      });
    });

    // AI Quick Input
    const aiQuickInput = document.getElementById('ai-quick-input');
    const aiQuickSubmit = document.getElementById('ai-quick-submit');
    
    if (aiQuickInput && aiQuickSubmit) {
      aiQuickSubmit.addEventListener('click', () => this.handleAIQuickQuery());
      aiQuickInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleAIQuickQuery();
      });
    }

    // AI Suggestions
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        aiQuickInput.value = query;
        this.handleAIQuickQuery();
      });
    });

    // Network status
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));
  }

  handleAIQuickQuery() {
    const input = document.getElementById('ai-quick-input');
    if (!input || !input.value.trim()) return;

    const query = input.value.trim();
    this.processAIQuery(query);
    input.value = '';
  }

  processAIQuery(query) {
    this.audioManager.play('terminal');
    
    const response = this.aiEngine.processQuery(query);
    this.showAIResponse(query, response);
    this.addToCommandHistory(query, 'AI Query', 'success');
  }

  showAIResponse(query, response) {
    const modal = document.getElementById('ai-response-modal');
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('ai-modal-content');
    
    if (modal && overlay && content) {
      content.innerHTML = `
        <div class="ai-response-header">
          <h4>پاسخ هوش مصنوعی</h4>
          <p><strong>درخواست:</strong> ${query}</p>
        </div>
        <div class="ai-response-content">
          <pre class="response-text">${response}</pre>
        </div>
        <div class="ai-response-actions">
          <button class="btn btn-outline-primary" id="copy-ai-response">
            <i class="fas fa-copy"></i> کپی پاسخ
          </button>
        </div>
      `;
      
      overlay.style.display = 'flex';
      modal.classList.add('active');
      
      // Setup copy button
      const copyBtn = document.getElementById('copy-ai-response');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(response);
          this.audioManager.play('success');
          this.notificationManager.showSuccess('پاسخ با موفقیت کپی شد!');
        });
      }
      
      // Close on overlay click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.style.display = 'none';
          modal.classList.remove('active');
        }
      });
    }
  }

  addToCommandHistory(command, name, status) {
    const historyList = document.getElementById('recent-commands-list');
    if (!historyList) return;

    const item = document.createElement('div');
    item.className = 'command-item';
    item.innerHTML = `
      <div class="command-info">
        <span class="command-text">${command}</span>
        <span class="command-time">${new Date().toLocaleTimeString('fa-IR')}</span>
      </div>
      <span class="command-status ${status}">${status === 'success' ? 'موفق' : 'ناموفق'}</span>
    `;
    
    historyList.prepend(item);
    
    // Limit to 10 items
    if (historyList.children.length > 10) {
      historyList.removeChild(historyList.lastChild);
    }
  }

  async initializePages() {
    // Load initial page data
    await this.loadDashboardData();
  }

  async loadDashboardData() {
    // Simulate loading dashboard data
    setTimeout(() => {
      this.updateSystemStats();
    }, 1000);
  }

  updateSystemStats() {
    // Update CPU stats
    const cpuValue = document.getElementById('cpu-value');
    const cpuGauge = document.getElementById('cpu-gauge');
    if (cpuValue && cpuGauge) {
      const cpuUsage = Math.floor(Math.random() * 100);
      cpuValue.textContent = `${cpuUsage}%`;
      cpuGauge.style.width = `${cpuUsage}%`;
    }

    // Update RAM stats
    const ramUsed = document.getElementById('ram-used');
    const ramFree = document.getElementById('ram-free');
    const ramTotal = document.getElementById('ram-total');
    if (ramUsed && ramFree && ramTotal) {
      const total = 16; // GB
      const used = Math.floor(total * Math.random() * 0.8 + 2);
      const free = total - used;
      
      ramUsed.textContent = `${used}GB`;
      ramFree.textContent = `${free}GB`;
      ramTotal.textContent = `${total}GB`;
    }

    // Update disk stats
    const diskProgressText = document.getElementById('disk-progress-text');
    if (diskProgressText) {
      const usedPercent = 78; // Fixed for demo
      diskProgressText.textContent = `${usedPercent}% پر - 156GB آزاد`;
    }

    // Update network stats
    const networkDownload = document.getElementById('network-download');
    const networkUpload = document.getElementById('network-upload');
    const networkPing = document.getElementById('network-ping');
    if (networkDownload && networkUpload && networkPing) {
      networkDownload.textContent = '12.8 Mbps';
      networkUpload.textContent = '2.4 Mbps';
      networkPing.textContent = '24ms';
    }
  }

  switchPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    
    // Remove active class from nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(`${pageId}-page`);
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    
    if (page && navItem) {
      page.classList.add('active');
      navItem.classList.add('active');
      
      // Play sound
      this.audioManager.play('click');
    }
  }

  handleNetworkChange(isOnline) {
    const statusElement = document.getElementById('network-status');
    if (!statusElement) return;

    if (isOnline) {
      statusElement.innerHTML = '<i class="fas fa-wifi"></i> <span>اتصال فعال</span>';
      statusElement.style.background = 'rgba(0, 255, 140, 0.2)';
      statusElement.style.color = '#00ff8c';
    } else {
      statusElement.innerHTML = '<i class="fas fa-wifi"></i> <span>اتصال قطع</span>';
      statusElement.style.background = 'rgba(255, 26, 26, 0.2)';
      statusElement.style.color = '#ff1a1a';
      
      // Show offline warning
      const offlineWarning = document.createElement('div');
      offlineWarning.className = 'js-error';
      offlineWarning.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ff1a1a;
        color: white;
        padding: 10px 15px;
        border-radius: var(--border-radius);
        z-index: var(--z-modal);
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      `;
      offlineWarning.innerHTML = '<i class="fas fa-wifi-slash"></i> وضعیت آفلاین - برخی ویژگی‌ها غیرفعال شدند';
      document.body.appendChild(offlineWarning);
      
      setTimeout(() => {
        offlineWarning.style.opacity = '0';
        offlineWarning.style.transform = 'translateY(100%)';
        setTimeout(() => offlineWarning.remove(), 300);
      }, 5000);
    }
  }
}

// ======================
// 🚀 Initialize Application
// ======================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize main application
    window.arkaApp = new ArkaCommandHub();
  } catch (error) {
    console.error('Failed to initialize Arka Command Hub:', error);
    
    // Show error screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div class="error-state" style="text-align: center; padding: 2rem;">
          <i class="fas fa-exclamation-triangle" style="color: var(--danger-neon); font-size: 3rem;"></i>
          <h2 style="color: var(--danger-neon); margin: 1rem 0;">خطای سیستم</h2>
          <p style="margin: 1rem 0; color: var(--text-secondary);">${error.message || 'خطای ناشناخته'}</p>
          <button onclick="location.reload()" class="btn btn-danger" style="margin-top: 1.5rem;">
            <i class="fas fa-redo"></i> تلاش مجدد
          </button>
        </div>
      `;
    }
  }
});

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const errorDisplay = document.getElementById('js-error');
  if (errorDisplay) {
    errorDisplay.style.display = 'block';
    errorDisplay.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <span>خطا: ${event.message || 'خطای ناشناخته'}</span>
    `;
    setTimeout(() => {
      errorDisplay.style.display = 'none';
    }, 5000);
  }
});

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
