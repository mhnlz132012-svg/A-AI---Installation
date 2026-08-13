/* ==========================================================================
   A-AI Core Client Application Controller (v1.1.2)
   ========================================================================== */

// Defensive Element Finder Utility
function safeEl(id) {
  return document.getElementById(id);
}

function safeListen(id, event, cb) {
  const el = safeEl(id);
  if (el) {
    el.addEventListener(event, cb);
    return true;
  }
  return false;
}

// Global Application State Context
let conversationHistory = [];
try {
  conversationHistory = JSON.parse(localStorage.getItem("a_ai_chat_history_v1_1")) || [];
} catch(e) {
  conversationHistory = [];
}

let isSoundEnabled = true;
let abortController = null;
let isGenerating = false;
let userIsScrolling = false;
let userCustomAvatar = localStorage.getItem("a_ai_user_avatar") || "👤";

// Set default custom theme settings if exist
let customGradStart = localStorage.getItem("a_ai_grad_start") || "#a855f7";
let customGradEnd = localStorage.getItem("a_ai_grad_end") || "#6366f1";
let customGlassOpacity = localStorage.getItem("a_ai_glass_opacity") || "75";
let customTextSize = localStorage.getItem("a_ai_text_size") || "15";
let customFontClass = localStorage.getItem("a_ai_font_class") || "font-lexend";
let customScheme = localStorage.getItem("a_ai_scheme") || "light";

// Sound Library
const sounds = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playClick() {
    if (!isSoundEnabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch(e) {}
  },
  playSuccess() {
    if (!isSoundEnabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch(e) {}
  },
  playFail() {
    if (!isSoundEnabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch(e) {}
  }
};

// =========================================================================
// High Performance physics particle canvas overlay
// =========================================================================
let particles = [];
const canvas = safeEl("sparkles-canvas");
let ctx = canvas ? canvas.getContext("2d") : null;

if (canvas && ctx) {
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 4 + 2;
      this.speedX = (Math.random() - 0.5) * 8;
      this.speedY = (Math.random() - 0.5) * 8 - 4; // Biased upwards
      this.color = color || "rgba(168, 85, 247, 0.8)";
      this.alpha = 1;
      this.gravity = 0.15;
      this.fade = Math.random() * 0.015 + 0.015;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.alpha -= this.fade;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  window.triggerSparkles = function(x, y, themeColor) {
    const color = themeColor || getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || "#a855f7";
    for (let i = 0; i < 35; i++) {
      particles.push(new Particle(x, y, color));
    }
  };

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      } else {
        p.draw();
      }
    }
    requestAnimationFrame(animateParticles);
  }
  requestAnimationFrame(animateParticles);
} else {
  window.triggerSparkles = function() {};
}

// Core App Initialization block
window.addEventListener("DOMContentLoaded", () => {
  // Pre-apply saved options
  const savedTheme = localStorage.getItem("a_ai_theme_v1_1") || "purple";
  document.body.setAttribute("data-theme", savedTheme);
  
  // Set default backdrop scheme (LIGHT mode is default)
  document.body.setAttribute("data-scheme", customScheme);
  const schBtn = safeEl("scheme-toggle-btn");
  if (schBtn) {
    schBtn.textContent = `MODE: ${customScheme.toUpperCase()}`;
  }
  
  applySavedGradient();
  applySavedGlassOpacity();
  applySavedTypography();
  
  // Render past conversation logs
  const chatBox = safeEl("chat-box");
  if (chatBox) {
    chatBox.innerHTML = "";
    conversationHistory.forEach((msg) => {
      const isUser = msg.role === "user";
      const msgDiv = appendMessage(msg.content, isUser ? "user-message" : "bot-message", true, isUser);
      if (!isUser) {
        addMessageActions(msgDiv, msg.content);
      }
    });
  }

  // Bind Sidebar Slide drawer controls
  safeListen("sidebar-toggle-btn", "click", () => {
    sounds.playClick();
    safeEl("settings-sidebar").classList.add("open");
    safeEl("sidebar-overlay").classList.add("active");
  });

  safeListen("close-sidebar-btn", "click", closeSidebar);
  safeListen("sidebar-overlay", "click", closeSidebar);

  function closeSidebar() {
    sounds.playClick();
    safeEl("settings-sidebar").classList.remove("open");
    safeEl("sidebar-overlay").classList.remove("active");
  }

  // Backdrop Scheme Toggle click
  safeListen("scheme-toggle-btn", "click", () => {
    sounds.playClick();
    const current = document.body.getAttribute("data-scheme") || "light";
    const target = current === "light" ? "dark" : "light";
    document.body.setAttribute("data-scheme", target);
    localStorage.setItem("a_ai_scheme", target);
    safeEl("scheme-toggle-btn").textContent = `MODE: ${target.toUpperCase()}`;
    
    if (window.innerWidth && window.triggerSparkles) {
      window.triggerSparkles(window.innerWidth / 2, window.innerHeight / 2);
    }
  });

  // Bind theme buttons
  const pills = document.querySelectorAll(".theme-pill[data-theme]");
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      sounds.playClick();
      const theme = pill.dataset.theme;
      document.body.setAttribute("data-theme", theme);
      localStorage.setItem("a_ai_theme_v1_1", theme);
      
      // Auto sync gradient pickers with theme defaults
      const colors = {
        purple: { start: "#a855f7", end: "#6366f1" },
        green: { start: "#10b981", end: "#3b82f6" },
        gold: { start: "#f59e0b", end: "#ef4444" },
        cyberpunk: { start: "#ec4899", end: "#06b6d4" },
        crimson: { start: "#ef4444", end: "#7f1d1d" },
        phantom: { start: "#d4af37", end: "#111115" }
      };

      if (colors[theme]) {
        safeEl("grad-start").value = colors[theme].start;
        safeEl("grad-end").value = colors[theme].end;
        updateCustomGradients(colors[theme].start, colors[theme].end);
      }
      
      if (window.innerWidth && window.triggerSparkles) {
        window.triggerSparkles(window.innerWidth / 2, window.innerHeight / 2);
      }
    });
  });

  // Bind Custom Gradient Pickers
  safeListen("grad-start", "input", syncGradInput);
  safeListen("grad-end", "input", syncGradInput);

  function syncGradInput() {
    const start = safeEl("grad-start").value;
    const end = safeEl("grad-end").value;
    updateCustomGradients(start, end);
  }

  function updateCustomGradients(start, end) {
    document.documentElement.style.setProperty("--logo-grad", `linear-gradient(135deg, ${start} 0%, ${end} 100%)`);
    document.documentElement.style.setProperty("--user-msg-grad", `linear-gradient(135deg, ${start} 0%, ${end} 100%)`);
    document.documentElement.style.setProperty("--accent-color", start);
    localStorage.setItem("a_ai_grad_start", start);
    localStorage.setItem("a_ai_grad_end", end);
  }

  function applySavedGradient() {
    safeEl("grad-start").value = customGradStart;
    safeEl("grad-end").value = customGradEnd;
    updateCustomGradients(customGradStart, customGradEnd);
  }

  // Bind Glass Opacity Slider
  safeListen("glass-opacity", "input", (e) => {
    const val = e.target.value;
    safeEl("opacity-val").textContent = `${val}%`;
    document.documentElement.style.setProperty("--glass-opacity", val / 100);
    localStorage.setItem("a_ai_glass_opacity", val);
  });

  function applySavedGlassOpacity() {
    safeEl("glass-opacity").value = customGlassOpacity;
    safeEl("opacity-val").textContent = `${customGlassOpacity}%`;
    document.documentElement.style.setProperty("--glass-opacity", customGlassOpacity / 100);
  }

  // Bind Typography Controllers
  safeListen("font-family-select", "change", (e) => {
    sounds.playClick();
    const cls = e.target.value;
    document.body.className = cls;
    localStorage.setItem("a_ai_font_class", cls);
  });

  safeListen("text-size-slider", "input", (e) => {
    const val = e.target.value;
    safeEl("text-size-val").textContent = `${val}px`;
    document.documentElement.style.setProperty("--text-size-base", `${val}px`);
    const box = safeEl("chat-box");
    if (box) box.style.fontSize = `${val}px`;
    localStorage.setItem("a_ai_text_size", val);
  });

  function applySavedTypography() {
    safeEl("font-family-select").value = customFontClass;
    document.body.className = customFontClass;

    safeEl("text-size-slider").value = customTextSize;
    safeEl("text-size-val").textContent = `${customTextSize}px`;
    const box = safeEl("chat-box");
    if (box) box.style.fontSize = `${customTextSize}px`;
  }

  // Bind Avatar customizer
  safeListen("save-avatar-btn", "click", () => {
    sounds.playClick();
    const val = safeEl("avatar-input").value.trim();
    if (val) {
      userCustomAvatar = val;
      localStorage.setItem("a_ai_user_avatar", val);
      alert("Avatar updated successfully!");
      safeEl("avatar-input").value = "";
    }
  });

  // Voice speech sliders
  safeListen("speech-rate", "input", (e) => {
    safeEl("speed-val").textContent = `${e.target.value}x`;
  });
  safeListen("speech-pitch", "input", (e) => {
    safeEl("pitch-val").textContent = e.target.value;
  });

  // Sound Toggle
  safeListen("sound-toggle-btn", "click", (e) => {
    isSoundEnabled = !isSoundEnabled;
    e.target.textContent = isSoundEnabled ? "SOUND" : "MUTED";
    sounds.playClick();
  });

  // Search Toggle
  safeListen("search-toggle-btn", "click", () => {
    sounds.playClick();
    const bar = safeEl("search-bar");
    bar.classList.toggle("hidden");
    if (!bar.classList.contains("hidden")) {
      safeEl("search-input").focus();
    }
  });

  safeListen("close-search-btn", "click", () => {
    sounds.playClick();
    safeEl("search-bar").classList.add("hidden");
  });

  safeListen("search-input", "input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    const messages = document.querySelectorAll(".message");
    messages.forEach((msg) => {
      if (q && msg.textContent.toLowerCase().includes(q)) {
        msg.style.borderColor = "var(--accent-color)";
        msg.style.boxShadow = "0 0 15px rgba(255,255,255,0.15)";
      } else {
        msg.style.borderColor = "";
        msg.style.boxShadow = "";
      }
    });
  });

  // Clear chat logs
  safeListen("clear-btn", "click", () => {
    sounds.playClick();
    if (confirm("Reset conversation and clear chat history?")) {
      const box = safeEl("chat-box");
      if (box) box.innerHTML = "";
      conversationHistory = [];
      localStorage.removeItem("a_ai_chat_history_v1_1");
    }
  });

  // Quick Prompts Chips
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      sounds.playClick();
      safeEl("user-input").value = chip.dataset.prompt;
      sendMessage();
    });
  });

  // Smart responsive emulator toggle button
  let viewportStates = ["auto", "phone", "ipad", "full"];
  let activeStateIdx = 0;
  
  safeListen("view-mode-btn", "click", () => {
    sounds.playClick();
    activeStateIdx = (activeStateIdx + 1) % viewportStates.length;
    const nextState = viewportStates[activeStateIdx];
    
    safeEl("view-mode-btn").textContent = `SCREEN: ${nextState.toUpperCase()}`;
    
    const shell = safeEl("emulator-shell");
    shell.className = "";
    shell.classList.add(`emulator-${nextState}`);
    
    if (window.triggerSparkles) {
      setTimeout(() => {
        const canv = safeEl("sparkles-canvas");
        if (canv) {
          canv.width = window.innerWidth;
          canv.height = window.innerHeight;
        }
      }, 410);
    }
  });

  // Bind Arcade modal trigger buttons
  safeListen("games-toggle-btn", "click", () => {
    sounds.playClick();
    safeEl("games-modal").classList.remove("hidden");
  });

  safeListen("close-games-btn", "click", () => {
    sounds.playClick();
    safeEl("games-modal").classList.add("hidden");
    safeEl("game-frame").src = "";
    safeEl("game-iframe-container").classList.add("hidden");
    document.querySelector(".game-hub-grid").classList.remove("hidden");
  });

  document.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("click", () => {
      sounds.playClick();
      const gameType = card.dataset.game;
      let url = "";
      if (gameType === "mrmine") url = "https://mrmine.com/";
      else if (gameType === "clicker") url = "https://www.clickerheroes.com/";
      
      if (url) {
        safeEl("game-frame").src = url;
        document.querySelector(".game-hub-grid").classList.add("hidden");
        safeEl("game-iframe-container").classList.remove("hidden");
      }
    });
  });

  safeListen("back-to-hub-btn", "click", () => {
    sounds.playClick();
    safeEl("game-frame").src = "";
    safeEl("game-iframe-container").classList.add("hidden");
    document.querySelector(".game-hub-grid").classList.remove("hidden");
  });

  // Bind Quiz Arena trigger buttons
  safeListen("quiz-toggle-btn", "click", () => {
    sounds.playClick();
    safeEl("quiz-modal").classList.remove("hidden");
    resetQuizView();
  });

  safeListen("close-quiz-btn", "click", () => {
    sounds.playClick();
    safeEl("quiz-modal").classList.add("hidden");
  });

  // Quiz levels data
  const quizData = {
    easy: [
      { q: "What is the capital governorate of Egypt?", options: ["Alexandria", "Cairo", "Giza", "Luxor"], answer: 1 },
      { q: "In which continent is Egypt located?", options: ["Asia", "Europe", "Africa", "South America"], answer: 2 },
      { q: "Which major river flows through Egypt from south to north?", options: ["Amazon", "Nile", "Mississippi", "Danube"], answer: 1 }
    ],
    medium: [
      { q: "What type of climate characterizes most of Egypt's territory?", options: ["Tropical Rainforest", "Desert Climate", "Mediterranean Climate", "Tundra"], answer: 1 },
      { q: "Which famous man-made waterway connects the Mediterranean Sea to the Red Sea?", options: ["Panama Canal", "Suez Canal", "Kiel Canal", "Corinth Canal"], answer: 1 },
      { q: "What is the official language of the Arab Republic of Egypt?", options: ["English", "French", "Arabic", "Spanish"], answer: 2 }
    ],
    hard: [
      { q: "During which ancient Egyptian historical era were the Great Pyramids of Giza built?", options: ["New Kingdom", "Old Kingdom", "Middle Kingdom", "Late Period"], answer: 1 },
      { q: "Which neighboring governorate borders Cairo directly to the west across the Nile River?", options: ["Giza", "Qalyubia", "Fayoum", "Suez"], answer: 0 },
      { q: "What major engineering dam is located in southern Egypt used for water storage?", options: ["Aswan High Dam", "Sadd el-Kafara", "Merowe Dam", "Roseires Dam"], answer: 0 }
    ]
  };

  let currentQuizLevel = [];
  let currentQuizIdx = 0;
  let quizScore = 0;

  document.querySelectorAll(".quiz-tier-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      sounds.playSuccess();
      const level = btn.dataset.level;
      currentQuizLevel = quizData[level] || [];
      currentQuizIdx = 0;
      quizScore = 0;
      safeEl("quiz-welcome").classList.add("hidden");
      safeEl("quiz-game-area").classList.remove("hidden");
      loadQuizQuestion();
    });
  });

  function loadQuizQuestion() {
    if (currentQuizIdx >= currentQuizLevel.length) {
      showQuizResults();
      return;
    }
    const item = currentQuizLevel[currentQuizIdx];
    safeEl("quiz-progress").textContent = `QUESTION ${currentQuizIdx + 1} OF ${currentQuizLevel.length}`;
    safeEl("quiz-question").textContent = item.q;
    
    const optionsContainer = safeEl("quiz-options");
    optionsContainer.innerHTML = "";
    
    item.options.forEach((opt, idx) => {
      const b = document.createElement("button");
      b.className = "quiz-opt-btn";
      b.textContent = opt;
      b.onclick = () => handleQuizAnswer(idx, item.answer, b);
      optionsContainer.appendChild(b);
    });
  }

  function handleQuizAnswer(selected, correct, btnNode) {
    const buttons = safeEl("quiz-options").querySelectorAll(".quiz-opt-btn");
    buttons.forEach((btn) => btn.disabled = true);
    
    if (selected === correct) {
      sounds.playSuccess();
      btnNode.classList.add("correct");
      quizScore++;
      
      const rect = btnNode.getBoundingClientRect();
      if (rect && window.triggerSparkles) {
        window.triggerSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, "#10b981");
      }
    } else {
      sounds.playFail();
      btnNode.classList.add("wrong");
      safeEl("quiz-options").children[correct].classList.add("correct");
      
      const rect = btnNode.getBoundingClientRect();
      if (rect && window.triggerSparkles) {
        window.triggerSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, "#ef4444");
      }
    }

    setTimeout(() => {
      currentQuizIdx++;
      loadQuizQuestion();
    }, 1200);
  }

  function showQuizResults() {
    safeEl("quiz-game-area").classList.add("hidden");
    safeEl("quiz-results").classList.remove("hidden");
    safeEl("quiz-score-text").textContent = `YOU SCORED ${quizScore} OUT OF ${currentQuizLevel.length}!`;
    
    if (quizScore === currentQuizLevel.length) {
      sounds.playSuccess();
      if (window.innerWidth && window.triggerSparkles) {
        window.triggerSparkles(window.innerWidth / 2, window.innerHeight / 2, "#d4af37");
      }
    }
  }

  safeListen("restart-quiz-btn", "click", resetQuizView);

  function resetQuizView() {
    safeEl("quiz-results").classList.add("hidden");
    safeEl("quiz-game-area").classList.add("hidden");
    safeEl("quiz-welcome").classList.remove("hidden");
  }

  // Voice Input (Web Speech API mic recognition)
  const micBtn = safeEl("mic-btn");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition && micBtn) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    micBtn.addEventListener("click", () => {
      sounds.playClick();
      const currentLang = safeEl("lang-select").value;
      recognition.lang = currentLang === "auto" ? "en-US" : `${currentLang}-${currentLang.toUpperCase()}`;
      
      try {
        recognition.start();
        micBtn.classList.add("listening");
        updateStatusBar("Listening...", true);
      } catch (err) {
        micBtn.classList.remove("listening");
        updateStatusBar("A-AI Ready", false);
      }
    });

    recognition.onresult = (e) => {
      const inputField = safeEl("user-input");
      if (inputField) {
        inputField.value = e.results[0][0].transcript;
        micBtn.classList.remove("listening");
        updateStatusBar("A-AI Ready", false);
        sendMessage();
      }
    };

    recognition.onerror = () => {
      micBtn.classList.remove("listening");
      updateStatusBar("A-AI Ready", false);
    };
    recognition.onend = () => {
      micBtn.classList.remove("listening");
      updateStatusBar("A-AI Ready", false);
    };
  } else if (micBtn) {
    micBtn.style.display = "none";
  }

  // Bind Export/Save Study Sheet Handler
  safeListen("export-btn", "click", () => {
    sounds.playClick();
    if (conversationHistory.length === 0) {
      alert("No active chat logs to export!");
      return;
    }

    const docStart = safeEl("grad-start").value;
    const docEnd = safeEl("grad-end").value;
    const activeFont = safeEl("font-family-select").value;

    let chatHtml = "";
    conversationHistory.forEach((msg) => {
      const isUser = msg.role === "user";
      chatHtml += `
        <div class="message-wrapper ${isUser ? 'user-wrapper' : 'bot-wrapper'}">
          <div class="avatar-tag">${isUser ? userCustomAvatar : '🤖'}</div>
          <div class="chat-plate ${isUser ? 'user-plate' : 'bot-plate'}">
            ${isUser ? escapeHTML(msg.content) : marked.parse(msg.content)}
          </div>
        </div>
      `;
    });

    const offlineDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>A-AI - Study Sheet Summary</title>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&family=Oswald:wght@400;700&family=Poppins:wght@300;400;500;600&family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <style>
    :root {
      --doc-grad: linear-gradient(135deg, ${docStart} 0%, ${docEnd} 100%);
      --accent-color: ${docStart};
    }
    body {
      background: #ffffff;
      color: #0f172a;
      padding: 40px 20px;
      margin: 0;
    }
    .font-lexend { font-family: 'Lexend', sans-serif; }
    .font-oswald { font-family: 'Oswald', sans-serif; }
    .font-poppins { font-family: 'Poppins', sans-serif; }
    .font-mono { font-family: 'Share Tech Mono', monospace; }

    .outer-container {
      max-width: 850px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.05);
    }
    h1 {
      font-weight: 700;
      background: var(--doc-grad);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-top: 0;
    }
    .print-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .print-btn {
      background: var(--doc-grad);
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
    }
    .message-wrapper {
      display: flex;
      gap: 12px;
      margin-bottom: 18px;
      align-items: flex-start;
    }
    .user-wrapper { justify-content: flex-end; }
    .bot-wrapper { justify-content: flex-start; }
    .avatar-tag {
      width: 32px;
      height: 32px;
      background: rgba(0,0,0,0.05);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(0,0,0,0.05);
    }
    .chat-plate {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 12px;
      line-height: 1.5;
    }
    .user-plate {
      background: var(--doc-grad);
      color: #fff;
    }
    .bot-plate {
      background: rgba(0,0,0,0.03);
      border: 1px solid rgba(0,0,0,0.05);
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      border: 1px solid #ddd;
    }
    th, td {
      padding: 8px 12px;
      border: 1px solid #ddd;
    }
    th {
      background: #f1f5f9;
    }
    @media print {
      body { background: #fff !important; color: #000 !important; }
      .print-controls { display: none !important; }
      .outer-container { border: none !important; box-shadow: none !important; }
    }
  </style>
</head>
<body class="${activeFont}">
  <div class="outer-container">
    <div class="print-controls">
      <div>
        <h1>A-AI Summary Note</h1>
        <p style="margin: 0; color: #777; font-size: 0.78rem;">Generated: ${new Date().toLocaleString()}</p>
      </div>
      <button class="print-btn" onclick="window.print()">PRINT / SAVE AS PDF</button>
    </div>
    <div class="notes-feed">
      ${chatHtml}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([offlineDoc], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `A_AI_Study_Sheet_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
  });

  // Bind Input and send triggers
  safeListen("send-btn", "click", () => {
    if (isGenerating) {
      if (abortController) abortController.abort();
      isGenerating = false;
      toggleSendBtn(false);
    } else {
      sendMessage();
    }
  });

  const inp = safeEl("user-input");
  if (inp) {
    inp.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !isGenerating) {
        sendMessage();
      }
    });
  }

  // Scroll locks
  safeListen("chat-box", "scroll", () => {
    const box = safeEl("chat-box");
    if (box) {
      const distance = box.scrollHeight - box.scrollTop - box.clientHeight;
      userIsScrolling = distance > 50;
    }
  });
});

// Helper utilities
function updateStatusBar(text, pulse) {
  const tNode = safeEl("interactive-status-bar");
  if (tNode) {
    tNode.querySelector(".status-text").textContent = text;
    const ind = tNode.querySelector(".status-indicator");
    if (pulse) {
      ind.style.background = "#ef4444";
      ind.style.boxShadow = "0 0 10px #ef4444";
    } else {
      ind.style.background = "#10b981";
      ind.style.boxShadow = "none";
    }
  }
}

function autoScroll() {
  const box = safeEl("chat-box");
  if (box && !userIsScrolling) {
    box.scrollTop = box.scrollHeight;
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function toggleSendBtn(generating) {
  isGenerating = generating;
  const btn = safeEl("send-btn");
  if (btn) {
    if (generating) {
      btn.textContent = "STOP";
      btn.classList.add("stop-mode");
    } else {
      btn.textContent = "SEND";
      btn.classList.remove("stop-mode");
    }
  }
}

function appendMessage(text, className, isHTML = false, isUser = false) {
  const box = safeEl("chat-box");
  if (!box) return null;

  const rowDiv = document.createElement("div");
  rowDiv.className = `message-row ${isUser ? 'user-message-row' : 'bot-message-row'}`;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  
  if (isUser) {
    if (userCustomAvatar.startsWith("http")) {
      const img = document.createElement("img");
      img.src = userCustomAvatar;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.borderRadius = "50%";
      avatar.appendChild(img);
    } else {
      avatar.textContent = userCustomAvatar;
    }
  } else {
    const img = document.createElement("img");
    img.src = "logo.png";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "contain";
    avatar.appendChild(img);
  }

  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${className}`;
  
  if (isHTML) {
    msgDiv.innerHTML = text;
  } else {
    msgDiv.textContent = text;
  }

  if (isUser) {
    rowDiv.appendChild(msgDiv);
    rowDiv.appendChild(avatar);
  } else {
    rowDiv.appendChild(avatar);
    rowDiv.appendChild(msgDiv);
  }

  box.appendChild(rowDiv);
  autoScroll();

  // Double tap handler to copy/trigger translation
  let lastTap = 0;
  rowDiv.addEventListener("click", (e) => {
    const now = new Date().getTime();
    if (now - lastTap < 300) {
      sounds.playSuccess();
      const rawText = msgDiv.innerText || msgDiv.textContent;
      if (window.triggerSparkles) {
        window.triggerSparkles(e.clientX, e.clientY);
      }
      autoTranslateText(rawText);
    }
    lastTap = now;
  });

  return msgDiv;
}

function autoTranslateText(text) {
  const rawTextClean = text.replace(/📋 COPY|🔊 LISTEN|🔗 SHARE|✅ COPIED!/g, "").trim();
  navigator.clipboard.writeText(rawTextClean);
  safeEl("settings-sidebar").classList.add("open");
  safeEl("sidebar-overlay").classList.add("active");
  safeEl("lang-select").value = "ar";
  alert("Text copied! Arabic Language requested in settings.");
}

// Complete fully populated Embedded Class 3rd Prep Dataset
const WEBSITE_DATA = `
Welcome To 2A Web Official Class Platform!
AW MC Java Server Address: mc.2aclassweb.com
Modpack link: https://www.curseforge.com/minecraft/modpacks/a-web-server-pack/download/8593370
Hosted on Aternos (Fabric 26.2 Java). Any member can request to start.

2A Esports Tournament PMCS 2026 matches:
- Quarter-final 1: ESB 80 - 63 Predators
- Quarter-Final 2: PXE 61 - 38 Dragons
- Quarter-final 3: Icons 80 - 60 Elgayar
- Quarter-Final 4: Champions won by forfeit - Ultraas lost by forfeit
- Semi-final 1: PXE 80 - 52 Icons
- Semi-final 2: Champions 80 - 43 ESB
- PMCS 2026 Grand Finals: PXE 80 - 66 Champions (PXE Winner, Champions Runner-Up)

2A Sports Court (2025-26) Football matches results:
- Cup Final: Team 2A¹ 4 - 1 1C¹ | scorers: Yassin Sherif 3x, Hamza (2A¹), Ahmed Ramzy OG (1C¹)
- League Friendly: Team 2A¹ 1 - 0 2B¹ | scorer: Yassin Sherif
- Matchday 1: 
  * 2A¹ 3 - 0 2C⁴ | scorers: Yehia Adel 2x, Karim Moataz
  * 2A² 0 - 0 2B¹
  * 2A³ 1 - 0 2C² | scorer: Omar Metwaly
- Matchday 2:
  * 2A¹ 2 - 1 2C¹ | scorers: Omar Shady, Yehia Adel, Yehia Khaled (2C¹)
  * 2A² 2 - 0 1C¹ | scorers: Asser Ezz, Ziad Mohamed
  * 2A³ 2 - 0 1C² | scorers: Malek Mohamed 2X
- Matchday 3:
  * 2A¹ 4 - 0 1C¹ | scorers: Yassin Sherif 2X, Yehia Adel, GK OG
  * 2A² 1 - 0 2B² | scorer: Ziad Mohamed
  * 2A³ 0 - 1 2B³ | scorer: Mustafa (GK)
- Matchday 4:
  * 2A¹ 1 - 0 1B¹ | scorer: Yassin Sherif
  * 2A² 2 - 0 1A¹ | scorers: Ziad Mohamed, Youssef Assem
  * 2A³ 2 - 1 2C² | scorers: Adham Al-Hossaini 2X, Abdo Al-Sais
- Knockouts & Finals:
  * Round-16: 2A¹ 5 - 0 1B² [Yassin Sherif 3x, Youssef Sameh, Yehia Adel] | 2A² 1 - 0 2A⁴ [Ziad Mohamed] | 2A³ 1 - 0 1A³ [Malek Mohamed]
  * Quarter-Finals: 2A² 2 - 1 2A³ [Ziad Mohamed 2x, Youssef Ahmed]
  * Semi-Finals: 2A¹ 5 - 2 1B² [Yehia Adel 4x, Yassin Sherif] | 2A² 0 - 3 1C¹ [Hamza 2x, Ahmed Ramzy]
  * League Grand Final: 2A¹ 3 - 2 1C¹ | scorers: Yehia Adel 2x, Yassin Sherif, Hamza 2x. -> 2A¹ are the Prep Cup Champions!

A Transfer News feed:
- 11/2/2026: Adam Hossam signed with 2A⁴.
- 11/2/2026: Adham Al-Hossaini signed with 2A².
- 22/12/2025: Sohip Amr signed with 2A⁴.
- 23/12/2025: Mohamed Youssef signed with 2A².
- 14/12/2025: Omar Elgendy signed with 2A².
- 19/11/2025: Omar Elsayed left 2A² to join 2A⁴.
- 7/11/2025: Sohip left 2A² team.
- 6/11/2025: Adam Maher returned to 2A² from 2A³.

Official ASports 2026/27 Shirt "Midnight Phantom" V3 Black Edition:
- Designed in full matte black with premium gold detailing.
- Sponsored by Adidas and Spotify.
- Price: ~200 EGP. Summer release.

A.S.C (A Sports Currency) Economy System:
- Official currency managed by Ziad Mohamed (A Central Bank).
- Used for player trades, loans, and wages.
- 10% transfer tax on player transactions goes to a collective shared redistribution pool.
- Denominations: 1, 5, 10, and 20 ASC.

Top Donors (Domain Payment Support):
- 1st Place: Omar Elsayed (105 EGP)
- 2nd Place: Youssef Tarek (30 EGP)
- 3rd Place: Adham Al-Hossaini (25 EGP) & Yehia Amer (25 EGP)
- Others: Yehia Mohamed (5 EGP), Omar Metwaly (5 EGP)

Dish Parties Schedule (2025/2026 Term):
- First Term: Sunday, 12 Oct 2025 | Sunday, 21 Dec 2025
- Second Term: Sunday, 15 Feb 2026 | Sunday, 19 Apr 2026
`;

// SSE Streaming Message Sender
async function sendMessage() {
  const inputField = safeEl("user-input");
  if (!inputField) return;

  const text = inputField.value.trim();
  if (!text || isGenerating) return;

  inputField.value = "";
  sounds.playClick();

  appendMessage(text, "user-message", false, true);

  const statusDiv = appendMessage(
    `<div class="typing-wave-loader">
       <span class="wave-dot"></span>
       <span class="wave-dot"></span>
       <span class="wave-dot"></span>
     </div>`, 
    "bot-message", 
    true, 
    false
  );

  const persona = safeEl("persona-select").value;
  const langMode = safeEl("lang-select").value;

  let toneInstruction = "Speak naturally and directly.";
  if (persona === "commentator") toneInstruction = "Speak like an energetic football commentator with hype!";
  if (persona === "clown") toneInstruction = "Speak like a funny class clown with humor!";
  if (persona === "teacher") toneInstruction = "Speak like a strict school teacher demanding discipline!";
  if (persona === "reporter") toneInstruction = "Speak like a serious news anchor reporting updates!";

  let languageInstruction = "RESPOND IN THE EXACT SAME LANGUAGE AS THE USER'S INPUT.";
  const langMap = {
    en: "YOU MUST RESPOND ENTIRELY IN ENGLISH.",
    ar: "YOU MUST RESPOND ENTIRELY IN ARABIC (اللغة العربية).",
    ja: "YOU MUST RESPOND ENTIRELY IN JAPANESE (日本語).",
    zh: "YOU MUST RESPOND ENTIRELY IN CHINESE (中文).",
    ko: "YOU MUST RESPOND ENTIRELY IN KOREAN (한국어).",
    es: "YOU MUST RESPOND ENTIRELY IN SPANISH (Español).",
    fr: "YOU MUST RESPOND ENTIRELY IN FRENCH (Français).",
    de: "YOU MUST RESPOND ENTIRELY IN GERMAN (Deutsch).",
    it: "YOU MUST RESPOND ENTIRELY IN ITALIAN (Italiano).",
    pt: "YOU MUST RESPOND ENTIRELY IN PORTUGUESE (Português).",
    ru: "YOU MUST RESPOND ENTIRELY IN RUSSIAN (Русский).",
    hi: "YOU MUST RESPOND ENTIRELY IN HINDI (हिन्दी).",
    bn: "YOU MUST RESPOND ENTIRELY IN BENGALI (বাংলা).",
    ur: "YOU MUST RESPOND ENTIRELY IN URDU (اردو).",
    tr: "YOU MUST RESPOND ENTIRELY IN TURKISH (Türkçe).",
    fa: "YOU MUST RESPOND ENTIRELY IN PERSIAN (فارسی).",
    nl: "YOU MUST RESPOND ENTIRELY IN DUTCH (Nederlands).",
    pl: "YOU MUST RESPOND ENTIRELY IN POLISH (Polski).",
    uk: "YOU MUST RESPOND ENTIRELY IN UKRAINIAN (Українська).",
    vi: "YOU MUST RESPOND ENTIRELY IN VIETNAMESE (Tiếng Việt).",
    id: "YOU MUST RESPOND ENTIRELY IN INDONESIAN (Bahasa Indonesia).",
    th: "YOU MUST RESPOND ENTIRELY IN THAI (ภาษาไทย).",
    el: "YOU MUST RESPOND ENTIRELY IN GREEK (Ελληνικά).",
    he: "YOU MUST RESPOND ENTIRELY IN HEBREW (עבריت).",
    sv: "YOU MUST RESPOND ENTIRELY IN SWEDISH (Svenska).",
    fi: "YOU MUST RESPOND ENTIRELY IN FINNISH (Suomi).",
    no: "YOU MUST RESPOND ENTIRELY IN NORWEGIAN (Norsk).",
    da: "YOU MUST RESPOND ENTIRELY IN DANISH (Dansk).",
    cs: "YOU MUST RESPOND ENTIRELY IN CZECH (Čeština).",
    hu: "YOU MUST RESPOND ENTIRELY IN HUNGARIAN (Magyar).",
    ro: "YOU MUST RESPOND ENTIRELY IN ROMANIAN (Română).",
    ms: "YOU MUST RESPOND ENTIRELY IN MALAY (Bahasa Melayu).",
    tl: "YOU MUST RESPOND ENTIRELY IN FILIPINO (Tagalog).",
    sw: "YOU MUST RESPOND ENTIRELY IN SWAHILI (Kiswahili).",
    franco: "YOU MUST RESPOND ENTIRELY IN FRANCO (Arabizi/Franko)."
  };

  if (langMap[langMode]) {
    languageInstruction = langMap[langMode];
  }

  const systemInstruction = `${languageInstruction} Persona/Tone: ${toneInstruction} You are A-AI, the official intelligence assistant for Class 3rd Prep at MHLS. Here is the highly detailed classroom dataset to answer query truthfully: ${WEBSITE_DATA}`;

  conversationHistory.push({ role: "user", content: text });
  if (conversationHistory.length > 8) {
    conversationHistory = conversationHistory.slice(-8);
  }
  
  saveHistory();
  toggleSendBtn(true);
  updateStatusBar("Typing...", true);
  abortController = new AbortController();

  const WORKER_URL = "https://a-ai-proxy.elga3los-mohamed.workers.dev";
  let streamText = "";

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: systemInstruction }, ...conversationHistory],
        stream: true,
        temperature: 0.3
      }),
      signal: abortController.signal
    });

    if (!res.ok) throw new Error("Worker endpoint error");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine || cleanLine === "data: [DONE]") continue;

        if (cleanLine.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(cleanLine.slice(6));
            const token = parsed.choices?.[0]?.delta?.content || "";
            if (token) {
              streamText += token;
              statusDiv.innerHTML = parseResponseText(streamText);
              autoScroll();
            }
          } catch (e) {}
        }
      }
    }

    if (buffer && buffer.startsWith("data: ")) {
      try {
        const parsed = JSON.parse(buffer.slice(6));
        const token = parsed.choices?.[0]?.delta?.content || "";
        if (token) {
          streamText += token;
        }
      } catch(e) {}
    }

    statusDiv.innerHTML = parseResponseText(streamText);
    addMessageActions(statusDiv, streamText);
    
    conversationHistory.push({ role: "assistant", content: streamText });
    saveHistory();
    
    sounds.playSuccess();
    if (window.innerWidth && window.triggerSparkles) {
      window.triggerSparkles(window.innerWidth - 80, window.innerHeight - 100);
    }

  } catch (err) {
    if (err.name === "AbortError") {
      statusDiv.innerHTML += `<p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;"><em>[Generation Aborted]</em></p>`;
    } else {
      statusDiv.innerHTML = `<p style="color:#ef4444; font-size:0.85rem;">[Connection to A-AI Proxy lost. Please check internet connection]</p>`;
    }
  } finally {
    toggleSendBtn(false);
    updateStatusBar("A-AI Ready", false);
  }
}

function saveHistory() {
  try {
    localStorage.setItem("a_ai_chat_history_v1_1", JSON.stringify(conversationHistory));
  } catch(e) {}
}

// Markdown parser implementation using marked.js
function parseResponseText(text) {
  if (window.marked && typeof window.marked.parse === "function") {
    return window.marked.parse(text);
  }
  
  // Minimal fallback if marked.js is somehow unavailable
  let output = text;
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  output = output.replace(codeBlockRegex, (match, lang, code) => {
    const escaped = escapeHTML(code.trim());
    return `<div class="code-container">
      <div class="code-header">
        <span>${lang || "code"}</span>
        <button class="code-copy-btn" onclick="copySnippet(this)">📋 Copy</button>
      </div>
      <pre><code>${escaped}</code></pre>
    </div>`;
  });
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.split("\n").join("<br>");
  return output;
}

window.copySnippet = function(btn) {
  const codeNode = btn.closest(".code-container").querySelector("code");
  if (codeNode) {
    navigator.clipboard.writeText(codeNode.innerText).then(() => {
      btn.textContent = "✅ Copied!";
      setTimeout(() => { btn.textContent = "📋 Copy"; }, 2000);
    });
  }
};

function addMessageActions(container, rawText) {
  if (container.querySelector(".msg-actions")) return;

  const actionsDiv = document.createElement("div");
  actionsDiv.className = "msg-actions";

  const copyBtn = document.createElement("button");
  copyBtn.className = "action-btn";
  copyBtn.innerHTML = "📋 COPY";
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(rawText).then(() => {
      copyBtn.innerHTML = "✅ COPIED!";
      setTimeout(() => { copyBtn.innerHTML = "📋 COPY"; }, 2000);
    });
  };
  actionsDiv.appendChild(copyBtn);

  if (navigator.share) {
    const shareBtn = document.createElement("button");
    shareBtn.className = "action-btn";
    shareBtn.innerHTML = "🔗 SHARE";
    shareBtn.onclick = async () => {
      try {
        await navigator.share({ title: "A-AI Response", text: rawText });
      } catch (err) {}
    };
    actionsDiv.appendChild(shareBtn);
  }

  if (isSoundEnabled && "speechSynthesis" in window) {
    const speakBtn = document.createElement("button");
    speakBtn.className = "action-btn";
    speakBtn.innerHTML = "🔊 LISTEN";
    speakBtn.onclick = () => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(rawText);
      utterance.rate = parseFloat(safeEl("speech-rate").value);
      utterance.pitch = parseFloat(safeEl("speech-pitch").value);
      window.speechSynthesis.speak(utterance);
    };
    actionsDiv.appendChild(speakBtn);
  }

  container.appendChild(actionsDiv);
}
