// Cyberpunk Password Security Audit HUD controller

let commonPasswords = new Set();
let alarmActive = false;

// Track previous states to avoid flooding console logs on every keystroke
let previousStates = {
  length: false,
  upper: false,
  lower: false,
  number: false,
  symbol: false,
  isBlacklisted: false
};

// DOM References
const passwordInput = document.getElementById('password-input');
const toggleBtn = document.getElementById('toggle-visible-btn');
const strengthLabel = document.getElementById('strength-label');
const scoreText = document.getElementById('score-text');
const leakAlarm = document.getElementById('leak-alarm');
const footerStatus = document.getElementById('footer-status');
const logsContainer = document.getElementById('console-logs');
const strengthBars = document.querySelectorAll('.bar-segment');
const clockEl = document.getElementById('hud-clock');

// System Clock
function updateClock() {
  if (clockEl) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    clockEl.textContent = timeStr;
  }
}
setInterval(updateClock, 1000);
updateClock();

// Log to Virtual Console
function addLog(message, type = 'system') {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  const logLine = document.createElement('div');
  logLine.className = `log-line ${type}-log`;
  logLine.textContent = `[${timeStr}] ${message}`;
  
  if (logsContainer) {
    logsContainer.appendChild(logLine);
    logsContainer.scrollTop = logsContainer.scrollHeight;
    
    // Cap log history
    while (logsContainer.children.length > 50) {
      logsContainer.removeChild(logsContainer.firstChild);
    }
  }
}

// Load Blacklist from Disk
async function loadBlacklist() {
  addLog('ACCESSING HASH SIGNATURE DATABASE...', 'system');
  try {
    const response = await fetch('common_passwords.txt');
    if (!response.ok) {
      throw new Error(`HTTP code ${response.status}`);
    }
    const text = await response.text();
    // Split lines, trim, and filter out empty
    const list = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    commonPasswords = new Set(list);
    addLog(`DATABASE SYNC COMPLETE. ${commonPasswords.size} COMMON SIGNATURES CACHED.`, 'ok');
  } catch (error) {
    addLog(`DATABASE SYNC FAILURE: ${error.message}`, 'err');
    addLog('SYSTEM RUNNING IN COMPROMISED OFFLINE MODE. COMPLEXITY AUDIT ONLY.', 'warn');
  }
}

// Rules Definition
const rules = {
  length: {
    el: document.getElementById('rule-length'),
    test: (p) => p.length >= 8,
    desc: 'MINIMUM_LENGTH >= 8'
  },
  upper: {
    el: document.getElementById('rule-upper'),
    test: (p) => /[A-Z]/.test(p),
    desc: 'UPPERCASE_CHAR [A-Z]'
  },
  lower: {
    el: document.getElementById('rule-lower'),
    test: (p) => /[a-z]/.test(p),
    desc: 'LOWERCASE_CHAR [a-z]'
  },
  number: {
    el: document.getElementById('rule-number'),
    test: (p) => /[0-9]/.test(p),
    desc: 'NUMERIC_DIGIT [0-9]'
  },
  symbol: {
    el: document.getElementById('rule-symbol'),
    test: (p) => /[^A-Za-z0-9]/.test(p),
    desc: 'SPECIAL_SYMBOL'
  }
};

// Reset HUD to default state
function resetUI() {
  document.body.className = '';
  strengthLabel.textContent = 'STANDBY';
  scoreText.textContent = 'SCORE: 0 / 5';
  footerStatus.textContent = 'MONITORING';
  footerStatus.className = 'green-text';
  
  // Clear strength bars
  strengthBars.forEach(bar => bar.classList.remove('active'));
  
  // Clear checklist status
  for (const key in rules) {
    rules[key].el.className = 'audit-item status-fail';
    rules[key].el.querySelector('.item-icon').textContent = '[FAIL]';
    previousStates[key] = false;
  }
  
  if (previousStates.isBlacklisted) {
    addLog('DATABASE MATCH TERMINATED. SYSTEM ENVELOPE SECURED.', 'ok');
    previousStates.isBlacklisted = false;
  }
}

// Show Blacklist Breach Alarm
function triggerAlarm() {
  alarmActive = true;
  leakAlarm.classList.remove('hidden');
  document.body.className = 'state-rejected';
  footerStatus.textContent = 'BREACH_DETECTED';
  footerStatus.className = 'log-line err-log';
  
  if (!previousStates.isBlacklisted) {
    addLog('!!! BLACKLIST MATCH !!! KEY IDENTIFIED IN KNOWN EXPOSURE ARCHIVES.', 'err');
    addLog('STATUS: ACCESS DENIED. ROTATING KEY ADVISED IMMEDIATELY.', 'err');
    previousStates.isBlacklisted = true;
  }
}

// Dismiss Breach Alarm
function dismissAlarm() {
  alarmActive = false;
  leakAlarm.classList.add('hidden');
  passwordInput.value = '';
  resetUI();
  addLog('ALARM DISMISSED. AUDIT CORE RESET.', 'system');
}

// Evaluate Password Strength
function evaluatePassword(password) {
  if (password.length === 0) {
    resetUI();
    return;
  }

  // 1. Blacklist Check
  if (commonPasswords.has(password)) {
    triggerAlarm();
    return;
  }

  // If we came back from a blacklist state without dismissing via alarm overlay key
  if (alarmActive) {
    leakAlarm.classList.add('hidden');
    alarmActive = false;
  }

  // 2. Complexity Rules Check
  let score = 0;
  
  for (const key in rules) {
    const rule = rules[key];
    const isMet = rule.test(password);
    
    // Log state change transitions
    if (isMet !== previousStates[key]) {
      if (isMet) {
        addLog(`AUDIT PASSED: ${rule.desc}`, 'ok');
      } else {
        addLog(`AUDIT FAILED: ${rule.desc} required`, 'warn');
      }
      previousStates[key] = isMet;
    }

    // Update checkbox elements
    if (isMet) {
      rule.el.className = 'audit-item status-ok';
      rule.el.querySelector('.item-icon').textContent = '[ OK ]';
      score++;
    } else {
      rule.el.className = 'audit-item status-fail';
      rule.el.querySelector('.item-icon').textContent = '[FAIL]';
    }
  }

  // Update strength bars
  strengthBars.forEach(bar => {
    const idx = parseInt(bar.getAttribute('data-index'));
    if (idx <= score) {
      bar.classList.add('active');
    } else {
      bar.classList.remove('remove'); // remove active
      bar.classList.remove('active');
    }
  });

  // Calculate and update score label + overall theme state
  scoreText.textContent = `SCORE: ${score} / 5`;
  
  let status = 'WEAK';
  let bodyClass = 'state-weak';
  
  if (score === 5) {
    status = 'SECURE';
    bodyClass = 'state-strong';
  } else if (score >= 3) {
    status = 'MODERATE';
    bodyClass = ''; // Default green theme
  }

  document.body.className = bodyClass;
  strengthLabel.textContent = status;
  footerStatus.textContent = 'COMPILING';
}

// Toggle Visibility (Decrypt/Encrypt visual)
toggleBtn.addEventListener('click', () => {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.textContent = 'ENCRYPT_VISUAL';
    toggleBtn.style.background = 'var(--neon-color)';
    toggleBtn.style.color = '#000';
    addLog('DECRYPT VISUALIZER ACTIVATED. EXPOSING CLEAR-TEXT ENVELOPE.', 'warn');
  } else {
    passwordInput.type = 'password';
    toggleBtn.textContent = 'DECRYPT_VISUAL';
    toggleBtn.style.background = 'rgba(0, 255, 0, 0.1)';
    toggleBtn.style.color = 'var(--neon-color)';
    addLog('ENCRYPT VISUALIZER ENGAGED. SHIELDING ENTROPY BLOCKS.', 'system');
  }
});

// Event Listeners
passwordInput.addEventListener('input', (e) => {
  evaluatePassword(e.target.value);
});

// Keyboard listener for dismissing alarm overlay
window.addEventListener('keydown', (e) => {
  if (alarmActive) {
    dismissAlarm();
  }
});

// Initial sequence
resetUI();
loadBlacklist();
