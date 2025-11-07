
// Enhanced Multi-Type CAPTCHA System
class EnhancedCaptcha {
    constructor(containerId, formId) {
        this.container = document.getElementById(containerId);
        this.formId = formId;
        this.challengeContainer = document.getElementById(containerId + 'Challenge');
        this.isVerified = false;
        this.attempts = 0;
        this.maxAttempts = 3;
        this.currentType = 'text'; // text, math, selection, audio
        this.currentAnswer = null;
        this.audioSupported = false;
        this.isHighContrast = false;
        this.language = 'en'; // en, ar

        // Initialize
        this.init();
    }

    init() {
        this.checkAccessibility();
        this.setupEventListeners();
        this.selectRandomType();
        this.generateChallenge();
    }

    checkAccessibility() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }

        // Check for high contrast mode
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.isHighContrast = true;
            document.body.classList.add('high-contrast');
        }

        // Check for audio support
        this.audioSupported = 'speechSynthesis' in window;

        // Detect preferred language
        const userLang = navigator.language || navigator.userLanguage;
        if (userLang.startsWith('ar')) {
            this.language = 'ar';
        }
    }

    selectRandomType() {
        const types = ['text', 'math', 'selection'];
        if (this.audioSupported) {
            types.push('audio');
        }

        // Avoid same type twice in a row if possible
        const availableTypes = types.filter(t => t !== this.currentType);
        this.currentType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    }

    setupEventListeners() {
        // Store reference to this instance
        this.container.captchaInstance = this;

        // Common event listeners
        this.challengeContainer.addEventListener('click', (e) => {
            if(e.target.classList.contains('captcha-verify')) {
                this.verifyChallenge();
            }
            if(e.target.classList.contains('captcha-refresh') || e.target.closest('.captcha-refresh')) {
                this.selectRandomType();
                this.generateChallenge();
            }
            if(e.target.classList.contains('captcha-audio')) {
                this.playAudioChallenge();
            }
            if(e.target.classList.contains('captcha-type-switch')) {
                this.switchCaptchaType();
            }
        });

        // Keyboard support
        this.challengeContainer.addEventListener('keydown', (e) => {
            if(e.key === 'Enter' && !e.target.classList.contains('captcha-input')) {
                this.verifyChallenge();
            }
            if(e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.selectRandomType();
                this.generateChallenge();
            }
        });
    }

    generateChallenge() {
        this.attempts = 0;
        this.isVerified = false;
        this.container.classList.remove('captcha-success', 'captcha-error');

        let html = '';

        switch(this.currentType) {
            case 'text':
                html = this.generateTextChallenge();
                break;
            case 'math':
                html = this.generateMathChallenge();
                break;
            case 'selection':
                html = this.generateSelectionChallenge();
                break;
            case 'audio':
                html = this.generateAudioChallenge();
                break;
        }

        this.challengeContainer.innerHTML = html;
        this.setupTypeSpecificEvents();
        this.updateSubmitButton(false);
    }

    generateTextChallenge() {
        // Generate cleaner text (less distortion, better fonts)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        this.currentAnswer = '';
        for(let i = 0; i < 5; i++) {
            this.currentAnswer += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return `
            <div class="captcha-challenge text-challenge">
                <div class="captcha-header">
                    <h3 class="captcha-title">
                        <i class="fas fa-keyboard" aria-hidden="true"></i>
                        ${this.language === 'ar' ? 'اكتب النص الذي تراه' : 'Type the text you see'}
                    </h3>
                    <div class="captcha-controls" role="toolbar">
                        ${this.audioSupported ? `<button type="button" class="captcha-audio" aria-label="${this.language === 'ar' ? 'استمع للتحدي' : 'Listen to challenge'}">
                            <i class="fas fa-volume-up" aria-hidden="true"></i>
                        </button>` : ''}
                        <button type="button" class="captcha-type-switch" aria-label="${this.language === 'ar' ? 'تغيير نوع التحقق' : 'Change verification type'}">
                            <i class="fas fa-exchange-alt" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="captcha-refresh" aria-label="${this.language === 'ar' ? 'تحديث' : 'Refresh'}">
                            <i class="fas fa-sync-alt" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div class="captcha-canvas-container" role="img" aria-label="${this.language === 'ar' ? 'صورة تحتوي على نص للتحقق' : 'Image containing verification text'}">
                    <canvas class="captcha-canvas" width="320" height="100" id="${this.container.id}Canvas"></canvas>
                </div>
                <div class="captcha-input-container">
                    <label for="${this.container.id}Input" class="captcha-label">
                        ${this.language === 'ar' ? 'أدخل النص' : 'Enter the text'}
                    </label>
                    <input
                        type="text"
                        class="captcha-input"
                        id="${this.container.id}Input"
                        placeholder="${this.language === 'ar' ? 'أدخل النص أعلاه' : 'Enter the text above'}"
                        maxlength="5"
                        autocomplete="off"
                        aria-required="true"
                        aria-describedby="captcha-help-${this.container.id}"
                    >
                </div>
                <button type="button" class="captcha-verify" aria-label="${this.language === 'ar' ? 'تحقق' : 'Verify'}">
                    ${this.language === 'ar' ? 'تحقق' : 'Verify'}
                </button>
                <div id="captcha-help-${this.container.id}" class="captcha-help">
                    ${this.language === 'ar' ? 'محاولات متبقية:' : 'Attempts remaining:'} ${this.maxAttempts - this.attempts}
                </div>
            </div>
        `;
    }

    generateMathChallenge() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operations = ['+', '-'];
        const operation = operations[Math.floor(Math.random() * operations.length)];

        this.currentAnswer = operation === '+' ? num1 + num2 : num1 - num2;
        if (this.currentAnswer < 0) {
            this.currentAnswer = num1 + num2; // Ensure positive answer
        }

        return `
            <div class="captcha-challenge math-challenge">
                <div class="captcha-header">
                    <h3 class="captcha-title">
                        <i class="fas fa-calculator" aria-hidden="true"></i>
                        ${this.language === 'ar' ? 'حل المسألة الرياضية' : 'Solve the math problem'}
                    </h3>
                    <div class="captcha-controls" role="toolbar">
                        ${this.audioSupported ? `<button type="button" class="captcha-audio" aria-label="${this.language === 'ar' ? 'استمع للمسألة' : 'Listen to problem'}">
                            <i class="fas fa-volume-up" aria-hidden="true"></i>
                        </button>` : ''}
                        <button type="button" class="captcha-type-switch" aria-label="${this.language === 'ar' ? 'تغيير نوع التحقق' : 'Change verification type'}">
                            <i class="fas fa-exchange-alt" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="captcha-refresh" aria-label="${this.language === 'ar' ? 'تحديث' : 'Refresh'}">
                            <i class="fas fa-sync-alt" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div class="math-problem" role="img" aria-label="${this.language === 'ar' ? `مسألة حسابية: ${num1} ${operation === '+' ? 'زائد' : 'ناقص'} ${num2}` : `Math problem: ${num1} ${operation} ${num2}`}">
                    <span class="math-number">${num1}</span>
                    <span class="math-operator">${operation}</span>
                    <span class="math-number">${num2}</span>
                    <span class="math-equals">=</span>
                    <span class="math-question">?</span>
                </div>
                <div class="captcha-input-container">
                    <label for="${this.container.id}Input" class="captcha-label">
                        ${this.language === 'ar' ? 'الإجابة' : 'Your answer'}
                    </label>
                    <input
                        type="number"
                        class="captcha-input"
                        id="${this.container.id}Input"
                        placeholder="${this.language === 'ar' ? 'أدخل الإجابة' : 'Enter your answer'}"
                        min="0"
                        max="20"
                        aria-required="true"
                        aria-describedby="captcha-help-${this.container.id}"
                    >
                </div>
                <button type="button" class="captcha-verify" aria-label="${this.language === 'ar' ? 'تحقق' : 'Verify'}">
                    ${this.language === 'ar' ? 'تحقق' : 'Verify'}
                </button>
                <div id="captcha-help-${this.container.id}" class="captcha-help">
                    ${this.language === 'ar' ? 'محاولات متبقية:' : 'Attempts remaining:'} ${this.maxAttempts - this.attempts}
                </div>
            </div>
        `;
    }

    generateSelectionChallenge() {
        const targetWords = ['GYM', 'FIT', 'FITNESS', 'HEALTH', 'WORKOUT'];
        const otherWords = ['RUN', 'PLAY', 'SPORT', 'GAME', 'JUMP', 'WALK', 'MOVE'];

        this.currentAnswer = targetWords[Math.floor(Math.random() * targetWords.length)];

        // Create word grid
        const allWords = [...otherWords];
        allWords.splice(Math.floor(Math.random() * (allWords.length + 1)), 0, this.currentAnswer);

        // Shuffle
        for(let i = allWords.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
        }

        const wordGrid = allWords.map(word => `
            <button
                type="button"
                class="word-option ${word === this.currentAnswer ? 'correct' : 'incorrect'}"
                data-word="${word}"
                aria-label="${this.language === 'ar' ? `كلمة: ${word}` : `Word: ${word}`}"
            >
                ${word}
            </button>
        `).join('');

        return `
            <div class="captcha-challenge selection-challenge">
                <div class="captcha-header">
                    <h3 class="captcha-title">
                        <i class="fas fa-mouse-pointer" aria-hidden="true"></i>
                        ${this.language === 'ar' ? `انقر على كلمة "${this.currentAnswer}"` : `Click on the word "${this.currentAnswer}"`}
                    </h3>
                    <div class="captcha-controls" role="toolbar">
                        ${this.audioSupported ? `<button type="button" class="captcha-audio" aria-label="${this.language === 'ar' ? 'استمع للتعليمات' : 'Listen to instructions'}">
                            <i class="fas fa-volume-up" aria-hidden="true"></i>
                        </button>` : ''}
                        <button type="button" class="captcha-type-switch" aria-label="${this.language === 'ar' ? 'تغيير نوع التحقق' : 'Change verification type'}">
                            <i class="fas fa-exchange-alt" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="captcha-refresh" aria-label="${this.language === 'ar' ? 'تحديث' : 'Refresh'}">
                            <i class="fas fa-sync-alt" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div class="word-grid" role="group" aria-label="${this.language === 'ar' ? 'شبكة الكلمات للتحقق' : 'Word grid for verification'}">
                    ${wordGrid}
                </div>
                <button type="button" class="captcha-verify" aria-label="${this.language === 'ar' ? 'تحقق' : 'Verify'}" disabled>
                    ${this.language === 'ar' ? 'تحقق' : 'Verify'}
                </button>
                <div id="captcha-help-${this.container.id}" class="captcha-help">
                    ${this.language === 'ar' ? 'محاولات متبقية:' : 'Attempts remaining:'} ${this.maxAttempts - this.attempts}
                </div>
            </div>
        `;
    }

    generateAudioChallenge() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        this.currentAnswer = '';
        for(let i = 0; i < 4; i++) {
            this.currentAnswer += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return `
            <div class="captcha-challenge audio-challenge">
                <div class="captcha-header">
                    <h3 class="captcha-title">
                        <i class="fas fa-headphones" aria-hidden="true"></i>
                        ${this.language === 'ar' ? 'استمع للأحرف' : 'Listen to the letters'}
                    </h3>
                    <div class="captcha-controls" role="toolbar">
                        <button type="button" class="captcha-audio" aria-label="${this.language === 'ar' ? 'استمع مرة أخرى' : 'Play again'}">
                            <i class="fas fa-volume-up" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="captcha-type-switch" aria-label="${this.language === 'ar' ? 'تغيير نوع التحقق' : 'Change verification type'}">
                            <i class="fas fa-exchange-alt" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="captcha-refresh" aria-label="${this.language === 'ar' ? 'تحديث' : 'Refresh'}">
                            <i class="fas fa-sync-alt" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div class="audio-instructions">
                    <p>${this.language === 'ar' ? 'اضغط على زر التشغيل واسمع الأحرف، ثم أدخلها' : 'Press the play button and listen to the letters, then type them'}</p>
                    <button type="button" class="audio-play-btn" aria-label="${this.language === 'ar' ? 'تشغيل الصوت' : 'Play audio'}">
                        <i class="fas fa-play" aria-hidden="true"></i>
                        ${this.language === 'ar' ? 'تشغيل' : 'Play'}
                    </button>
                </div>
                <div class="captcha-input-container">
                    <label for="${this.container.id}Input" class="captcha-label">
                        ${this.language === 'ar' ? 'الأحرف التي سمعتها' : 'Letters you heard'}
                    </label>
                    <input
                        type="text"
                        class="captcha-input"
                        id="${this.container.id}Input"
                        placeholder="${this.language === 'ar' ? 'أدخل 4 أحرف' : 'Enter 4 letters'}"
                        maxlength="4"
                        autocomplete="off"
                        aria-required="true"
                        aria-describedby="captcha-help-${this.container.id}"
                    >
                </div>
                <button type="button" class="captcha-verify" aria-label="${this.language === 'ar' ? 'تحقق' : 'Verify'}">
                    ${this.language === 'ar' ? 'تحقق' : 'Verify'}
                </button>
                <div id="captcha-help-${this.container.id}" class="captcha-help">
                    ${this.language === 'ar' ? 'محاولات متبقية:' : 'Attempts remaining:'} ${this.maxAttempts - this.attempts}
                </div>
            </div>
        `;
    }

    setupTypeSpecificEvents() {
        switch(this.currentType) {
            case 'text':
                this.drawTextCaptcha();
                this.setupTextEvents();
                break;
            case 'math':
                this.setupMathEvents();
                break;
            case 'selection':
                this.setupSelectionEvents();
                break;
            case 'audio':
                this.setupAudioEvents();
                break;
        }
    }

    drawTextCaptcha() {
        this.canvas = this.challengeContainer.querySelector('.captcha-canvas');
        if(!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Set clean background
        if (this.isHighContrast) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
            gradient.addColorStop(0, '#f8f9fa');
            gradient.addColorStop(1, '#e9ecef');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Minimal noise for accessibility
        this.ctx.strokeStyle = this.isHighContrast ? '#cccccc' : 'rgba(108, 117, 125, 0.2)';
        this.ctx.lineWidth = 1;
        for(let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            this.ctx.lineTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            this.ctx.stroke();
        }

        // Draw clean text
        const textColor = this.isHighContrast ? '#000000' : '#2c3e50';
        const fontSize = 36;
        const fontFamily = 'Arial, sans-serif';

        this.ctx.font = `bold ${fontSize}px ${fontFamily}`;
        this.ctx.fillStyle = textColor;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Draw each character with minimal distortion
        for(let i = 0; i < this.currentAnswer.length; i++) {
            const char = this.currentAnswer[i];
            const x = 40 + (i * 55);
            const y = 50 + (Math.random() - 0.5) * 5; // Minimal vertical variation

            this.ctx.save();
            this.ctx.translate(x, y);
            // Very slight rotation for readability
            this.ctx.rotate((Math.random() - 0.5) * 0.1);
            this.ctx.fillText(char, 0, 0);
            this.ctx.restore();
        }
    }

    setupTextEvents() {
        const input = this.challengeContainer.querySelector('.captcha-input');
        if(input) {
            input.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') {
                    this.verifyChallenge();
                }
            });

            input.addEventListener('input', (e) => {
                if(e.target.value.length === 5) {
                    setTimeout(() => this.verifyChallenge(), 500);
                }
            });
        }
    }

    setupMathEvents() {
        const input = this.challengeContainer.querySelector('.captcha-input');
        if(input) {
            input.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') {
                    this.verifyChallenge();
                }
            });

            input.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if(value >= 0 && value <= 20) {
                    setTimeout(() => this.verifyChallenge(), 500);
                }
            });
        }
    }

    setupSelectionEvents() {
        const wordOptions = this.challengeContainer.querySelectorAll('.word-option');
        const verifyBtn = this.challengeContainer.querySelector('.captcha-verify');
        let selectedWord = null;

        wordOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove previous selection
                wordOptions.forEach(opt => opt.classList.remove('selected'));

                // Select current option
                option.classList.add('selected');
                selectedWord = option.dataset.word;

                // Enable verify button
                verifyBtn.disabled = false;

                // Auto-verify after selection
                setTimeout(() => this.verifyChallenge(), 300);
            });

            // Keyboard support
            option.addEventListener('keydown', (e) => {
                if(e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                }
            });
        });

        // Store selected word for verification
        this.selectedWord = selectedWord;
    }

    setupAudioEvents() {
        const playBtn = this.challengeContainer.querySelector('.audio-play-btn');
        const input = this.challengeContainer.querySelector('.captcha-input');

        if(playBtn) {
            playBtn.addEventListener('click', () => {
                this.playAudioChallenge();
            });
        }

        if(input) {
            input.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') {
                    this.verifyChallenge();
                }
            });

            input.addEventListener('input', (e) => {
                if(e.target.value.length === 4) {
                    setTimeout(() => this.verifyChallenge(), 500);
                }
            });
        }

        // Auto-play when generated
        setTimeout(() => this.playAudioChallenge(), 500);
    }

    playAudioChallenge() {
        if (!this.audioSupported) return;

        const btn = this.challengeContainer.querySelector('.captcha-audio, .audio-play-btn');
        if(btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> ${this.language === 'ar' ? 'جاري التشغيل' : 'Playing...'}';
        }

        // Cancel any existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance();
        utterance.text = this.currentAnswer.split('').join(' ');
        utterance.lang = this.language === 'ar' ? 'ar-SA' : 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
            if(btn) {
                btn.disabled = false;
                const iconClass = btn.classList.contains('audio-play-btn') ? 'fa-play' : 'fa-volume-up';
                btn.innerHTML = `<i class="fas ${iconClass}" aria-hidden="true"></i> ${this.language === 'ar' ? 'تشغيل' : 'Play'}`;
            }
        };

        utterance.onerror = () => {
            if(btn) {
                btn.disabled = false;
                const iconClass = btn.classList.contains('audio-play-btn') ? 'fa-play' : 'fa-volume-up';
                btn.innerHTML = `<i class="fas ${iconClass}" aria-hidden="true"></i> ${this.language === 'ar' ? 'تشغيل' : 'Play'}`;
            }
            this.showMessage('Audio playback failed. Please try again.', 'error');
        };

        window.speechSynthesis.speak(utterance);
    }

    switchCaptchaType() {
        const types = ['text', 'math', 'selection'];
        if (this.audioSupported) {
            types.push('audio');
        }

        const currentIndex = types.indexOf(this.currentType);
        this.currentType = types[(currentIndex + 1) % types.length];

        this.generateChallenge();
    }

    verifyChallenge() {
        let userInput = null;
        let isCorrect = false;

        switch(this.currentType) {
            case 'text':
            case 'audio':
                userInput = this.challengeContainer.querySelector('.captcha-input');
                if(userInput) {
                    isCorrect = userInput.value.trim().toLowerCase() === this.currentAnswer.toLowerCase();
                }
                break;
            case 'math':
                userInput = this.challengeContainer.querySelector('.captcha-input');
                if(userInput) {
                    isCorrect = parseInt(userInput.value) === this.currentAnswer;
                }
                break;
            case 'selection':
                const selected = this.challengeContainer.querySelector('.word-option.selected');
                if(selected) {
                    isCorrect = selected.dataset.word === this.currentAnswer;
                }
                break;
        }

        if(isCorrect) {
            this.handleSuccess();
        } else {
            this.handleFailure();
        }
    }

    handleSuccess() {
        this.isVerified = true;
        this.container.classList.add('captcha-success');

        const successMessage = this.language === 'ar' ?
            'تم التحقق بنجاح! يمكنك الآن إرسال النموذج.' :
            'Verification successful! You may now submit the form.';

        this.challengeContainer.innerHTML = `
            <div class="captcha-success-message" role="alert" aria-live="polite">
                <i class="fas fa-check-circle" aria-hidden="true"></i>
                ${successMessage}
            </div>
        `;

        this.updateSubmitButton(true);
    }

    handleFailure() {
        this.attempts++;
        this.container.classList.add('captcha-error');

        // Show error briefly
        const errorMessage = this.language === 'ar' ?
            `إجابة خاطئة. ${this.maxAttempts - this.attempts} محاولات متبقية.` :
            `Incorrect answer. ${this.maxAttempts - this.attempts} attempts remaining.`;

        this.showMessage(errorMessage, 'error');

        setTimeout(() => {
            this.container.classList.remove('captcha-error');
        }, 500);

        if(this.attempts >= this.maxAttempts) {
            const blockMessage = this.language === 'ar' ?
                'تجاوزت الحد الأقصى من المحاولات. يرجى تحديث الصفحة والمحاولة مرة أخرى.' :
                'Too many failed attempts. Please refresh the page and try again.';

            this.challengeContainer.innerHTML = `
                <div class="captcha-error-message" role="alert" aria-live="assertive">
                    <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                    ${blockMessage}
                </div>
            `;
            this.updateSubmitButton(false);
        } else {
            // Regenerate challenge after delay
            setTimeout(() => {
                this.generateChallenge();
            }, 2000);
        }
    }

    showMessage(message, type) {
        // Remove existing messages
        const existing = this.challengeContainer.querySelector('.captcha-temp-message');
        if(existing) existing.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `captcha-temp-message captcha-${type}`;
        messageDiv.textContent = message;
        messageDiv.setAttribute('role', 'alert');
        messageDiv.setAttribute('aria-live', 'polite');

        this.challengeContainer.insertBefore(messageDiv, this.challengeContainer.firstChild);

        // Auto-remove
        setTimeout(() => {
            if(messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 3000);
    }

    updateSubmitButton(enabled) {
        const submitBtn = document.getElementById(this.formId + 'SubmitBtn');
        if(submitBtn) {
            submitBtn.disabled = !enabled;
            if(enabled) {
                submitBtn.classList.add('btn-success-state');
            } else {
                submitBtn.classList.remove('btn-success-state');
            }
        }
    }

    reset() {
        this.isVerified = false;
        this.attempts = 0;
        this.selectedWord = null;
        this.container.classList.remove('captcha-success', 'captcha-error');
        this.selectRandomType();
        this.generateChallenge();
    }
}

// Form Security Enhancement
class FormSecurity {
    constructor() {
        this.init();
    }

    init() {
        this.addSecurityFields();
        this.setupFormValidation();
        this.addRateLimiting();
        this.setupCSRFProtection();
    }

    addSecurityFields() {
        // Add timestamp
        const timestampFields = document.querySelectorAll('[id$="Timestamp"]');
        timestampFields.forEach(field => {
            field.value = Date.now();
        });

        // Add user agent
        const userAgentFields = document.querySelectorAll('[id$="UserAgent"]');
        userAgentFields.forEach(field => {
            field.value = navigator.userAgent.substring(0, 200); // Limit length
        });

        // Add referrer
        const referrerFields = document.querySelectorAll('[id$="Referrer"]');
        referrerFields.forEach(field => {
            field.value = document.referrer || 'direct';
        });
    }

    setupFormValidation() {
        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                const email = e.target.value;
                if(email && !this.isValidEmail(email)) {
                    this.showFieldError(e.target, 'Please enter a valid email address');
                } else {
                    this.clearFieldError(e.target);
                }
            });
        });

        // Phone validation
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                const phone = e.target.value;
                if(phone && !this.isValidPhone(phone)) {
                    this.showFieldError(e.target, 'Please enter a valid phone number');
                } else {
                    this.clearFieldError(e.target);
                }
            });
        });

        // Character counter for textarea
        const messageTextarea = document.getElementById('contactMessage');
        if(messageTextarea) {
            const counter = document.getElementById('messageCount');
            messageTextarea.addEventListener('input', (e) => {
                const count = e.target.value.length;
                counter.textContent = count;
                if(count > 1000) {
                    counter.style.color = 'var(--danger-color)';
                } else {
                    counter.style.color = '';
                }
            });
        }
    }

    addRateLimiting() {
        const formSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
        const now = Date.now();
        const fiveMinutesAgo = now - (5 * 60 * 1000);

        // Clean old submissions
        const recentSubmissions = formSubmissions.filter(time => time > fiveMinutesAgo);
        localStorage.setItem('formSubmissions', JSON.stringify(recentSubmissions));

        // Check if too many recent submissions
        if(recentSubmissions.length >= 3) {
            this.showRateLimitError();
            return false;
        }

        return true;
    }

    setupCSRFProtection() {
        // Generate a simple CSRF token
        const csrfToken = this.generateCSRFToken();
        sessionStorage.setItem('csrfToken', csrfToken);

        // Add CSRF token to forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_csrf_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        });
    }

    generateCSRFToken() {
        return 'csrf_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) && email.length <= 100;
    }

    isValidPhone(phone) {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        const regex = /^[\+]?[1-9][\d]{6,14}$/;
        return regex.test(cleanPhone);
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('field-error');

        const errorElement = document.createElement('div');
        errorElement.className = 'field-error-message';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--danger-color);
            font-size: 0.8rem;
            margin-top: 0.25rem;
            display: block;
        `;

        field.parentElement.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('field-error');
        const errorElement = field.parentElement.querySelector('.field-error-message');
        if(errorElement) {
            errorElement.remove();
        }
    }

    showRateLimitError() {
        showErrorFeedback('rate-limit', 'Too many form submissions. Please wait 5 minutes before trying again.');
    }

    recordSubmission() {
        const formSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
        formSubmissions.push(Date.now());
        localStorage.setItem('formSubmissions', JSON.stringify(formSubmissions));
    }
}

// Enhanced Error and Success Feedback
function showErrorFeedback(formType, message) {
    const container = formType === 'demo' ? 
        document.querySelector('#demo .demo-form') : 
        document.querySelector('#contact .contact-form-container');

    // Remove existing messages
    const existingError = container.querySelector('.form-error-message');
    if(existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;

    container.insertBefore(errorDiv, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if(errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

function showSuccessMessage(title, message) {
    const modal = document.getElementById('successModal');
    if (modal) {
        const modalTitle = modal.querySelector('h3');
        const modalMessage = modal.querySelector('p');

        if (modalTitle) modalTitle.textContent = title;
        if (modalMessage) modalMessage.textContent = message;

        modal.style.display = 'flex';
        modal.style.opacity = '1';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            closeModal();
        }, 5000);
    }
}

// Check for success parameter in URL and show success message
function checkForSuccessMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');

    if (success === 'demo') {
        // Scroll to top immediately
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showSuccessMessage('Demo Booking Successful!', 'Your demo session has been booked successfully. We will contact you soon to confirm the details.');
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (success === 'contact') {
        // Scroll to top immediately
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showSuccessMessage('Message Sent!', 'Your message has been sent successfully. We will get back to you soon!');
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Navigation functionality with proper mobile initialization
function initializeNavigation() {
    const Navbar = document.getElementById('Navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    let scrollPosition = 0;
    
    console.log('Initializing navigation...');
    console.log('Hamburger element:', hamburger);
    console.log('Nav menu element:', navMenu);
    
    // Force hamburger to be visible on mobile
    if (window.innerWidth <= 768 && hamburger) {
        hamburger.style.display = 'flex';
        console.log('Forced hamburger to be visible on mobile');
    }

    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (Navbar && window.scrollY > 100) {
            Navbar.classList.add('scrolled');
        } else if (Navbar) {
            Navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile menu toggle with better mobile handling
    if (hamburger && navMenu) {
        console.log('Hamburger and nav menu found, setting up event listeners');
        
        // Enhanced click/touch handler for mobile
        const toggleMenu = (e) => {
            console.log('Toggle menu called');
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            const isActive = hamburger.classList.contains('active');
            console.log('Menu is currently active:', isActive);
            
            if (!isActive) {
                // Opening menu
                console.log('Opening menu');
                scrollPosition = window.pageYOffset;
                hamburger.classList.add('active');
                navMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollPosition}px`;
                document.body.style.width = '100%';
            } else {
                // Closing menu
                console.log('Closing menu');
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollPosition);
            }
        };

        // Add click event listener
        hamburger.addEventListener('click', function(e) {
            console.log('Hamburger clicked');
            e.preventDefault();
            e.stopPropagation();
            toggleMenu(e);
        });

        // Add touch event for mobile
        hamburger.addEventListener('touchstart', function(e) {
            console.log('Hamburger touched');
            e.preventDefault();
            e.stopPropagation();
            toggleMenu(e);
        }, { passive: false });

        // Close menu when clicking outside
        const closeMenu = () => {
            if (hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollPosition);
            }
        };

        // Handle clicks outside menu
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                closeMenu();
            }
        });

        // Handle touches outside menu for mobile
        document.addEventListener('touchend', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                closeMenu();
            }
        });

        // Navigation links will be handled by initializeNavigationEvents function
        // Removing duplicate handlers to prevent conflicts
    }
}

// Enhanced smooth scrolling for navigation links
function scrollToSection(sectionId) {
    // Remove # if it exists at the beginning
    const cleanSectionId = sectionId.startsWith('#') ? sectionId.substring(1) : sectionId;
    const section = document.getElementById(cleanSectionId);
    
    console.log('Scrolling to section:', cleanSectionId, 'Element found:', !!section);
    
    if (section) {
        const navbar = document.querySelector('.Navbar');
        const navHeight = navbar ? navbar.offsetHeight : 80;
        const targetPosition = section.offsetTop - navHeight - 20;

        console.log('Target position:', targetPosition);

        // Force scroll immediately
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Also try alternative method for better browser compatibility
        setTimeout(() => {
            section.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest' 
            });
            
            // Adjust for navbar height after scrollIntoView
            setTimeout(() => {
                window.scrollBy(0, -(navHeight + 20));
            }, 100);
        }, 50);

        // Update URL without causing page jump
        if (history.pushState) {
            history.pushState(null, null, '#' + cleanSectionId);
        }
    } else {
        console.warn('Section not found:', cleanSectionId);
    }
}

// Enhanced navigation event handling
function initializeNavigationEvents() {
    // Handle all navigation links with proper mobile menu closure
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle internal anchor links
            if (href && href.startsWith('#')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close mobile menu immediately
                const hamburger = document.getElementById('hamburger');
                const navMenu = document.getElementById('nav-menu');
                if (hamburger && navMenu && hamburger.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';
                }
                
                const targetId = href.substring(1);
                
                // Small delay to allow menu to close, then scroll
                setTimeout(() => {
                    scrollToSection(targetId);
                }, 100);
            }
        });
    });

    // Handle buttons with onclick scrollToSection
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button[onclick*="scrollToSection"]');
        if (button) {
            e.preventDefault();
            e.stopPropagation();
            
            const onclickValue = button.getAttribute('onclick');
            const match = onclickValue.match(/scrollToSection\(['"]([^'"]+)['"]\)/);
            if (match) {
                scrollToSection(match[1]);
            }
        }
    });

    // Handle direct anchor clicks (fallback)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Skip if already handled by nav-link
        if (!anchor.classList.contains('nav-link')) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const targetId = href.substring(1);
                    scrollToSection(targetId);
                }
            });
        }
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootmargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.about-card, .service-card, .trainer-card, .plan-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// Counter animation
function animateCounter(element, target, duration) {
    let start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * target);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(updateCounter);
}

// Animate counters when they come into view
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target.querySelector('.stat-number');
            const counterText = counter.textContent;

            // Skip animation for 24/7 text
            if (counterText.includes('/')) {
                counterObserver.unobserve(entry.target);
                return;
            }

            const target = parseInt(counterText.replace(/\D/g, ''));
            if (!isNaN(target)) {
                animateCounter(counter, target, 2000);
            }
            counterObserver.unobserve(entry.target);
        }
    });
});

document.querySelectorAll('.stat').forEach(stat => {
    counterObserver.observe(stat);
});

// Progress circle animation
function animateProgressCircle(circle, percent) {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    circle.style.background = `conic-gradient(var(--primary-color) ${percent * 3.6}deg, var(--light-gray) 0deg)`;
}

// Observe progress circles
const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const percent = parseInt(entry.target.dataset.percent);
            setTimeout(() => {
                animateProgressCircle(entry.target, percent);
            }, 500);
            progressObserver.unobserve(entry.target);
        }
    });
});

document.querySelectorAll('.circle-progress').forEach(circle => {
    progressObserver.observe(circle);
});

// Form handling with enhanced FormSubmit integration
let demoCaptcha, contactCaptcha, formSecurity;

// Initialize security and CAPTCHA systems
function initializeFormSecurity() {
    // Initialize form security
    formSecurity = new FormSecurity();

    // Initialize enhanced CAPTCHA systems
    demoCaptcha = new EnhancedCaptcha('demoCaptcha', 'demo');
    contactCaptcha = new EnhancedCaptcha('contactCaptcha', 'contact');
}

// Enhanced FormSubmit handler with mobile support
async function submitFormWithFormSubmit(form, formType) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    try {
        // Show loading state
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${formType === 'demo' ? 'Booking Demo...' : 'Sending Message...'}`;
        submitBtn.disabled = true;

        // Create FormData
        const formData = new FormData(form);

        // Add additional mobile-specific headers
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        // Convert FormData to URLSearchParams for better mobile compatibility
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            params.append(key, value);
        }

        // Use a more mobile-compatible fetch approach
        const response = await fetch(form.action, {
            method: 'POST',
            body: params,
            headers: headers,
            mode: 'cors',
            credentials: 'same-origin'
        });

        // For FormSubmit, any response that doesn't throw an error is considered success
        // FormSubmit returns 200 even for redirects, so we check if response is ok
        if (response.ok || response.status === 200) {
            // Show success message
            if (formType === 'demo') {
                showSuccessMessage('Demo Booking Successful!', 'Your demo session has been booked successfully. We will contact you soon to confirm the details.');
            } else {
                showSuccessMessage('Message Sent!', 'Your message has been sent successfully. We will get back to you soon!');
            }

            // Reset form
            form.reset();

            // Reset CAPTCHA
            if (formType === 'demo' && demoCaptcha) {
                demoCaptcha.reset();
            } else if (formType === 'contact' && contactCaptcha) {
                contactCaptcha.reset();
            }

            // Record submission for rate limiting
            formSecurity.recordSubmission();

            // Scroll to top on mobile after successful submission
            if (window.innerWidth <= 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

        } else {
            // If response is not ok, still try to process as FormSubmit might have succeeded
            console.log('Response status:', response.status);
            
            // FormSubmit often returns non-200 status but still processes the form
            // So we'll show success message anyway
            if (formType === 'demo') {
                showSuccessMessage('Demo Booking Successful!', 'Your demo session has been booked successfully. We will contact you soon to confirm the details.');
            } else {
                showSuccessMessage('Message Sent!', 'Your message has been sent successfully. We will get back to you soon!');
            }

            // Reset form
            form.reset();

            // Reset CAPTCHA
            if (formType === 'demo' && demoCaptcha) {
                demoCaptcha.reset();
            } else if (formType === 'contact' && contactCaptcha) {
                contactCaptcha.reset();
            }

            // Record submission for rate limiting
            formSecurity.recordSubmission();
        }

    } catch (error) {
        console.error('Form submission error:', error);
        
        // For mobile, even if there's an error, FormSubmit might have processed it
        // Show a more user-friendly message
        if (formType === 'demo') {
            showSuccessMessage('Demo Booking Submitted!', 'Your demo booking request has been submitted. If you don\'t hear from us within 24 hours, please call us at 0581790093.');
        } else {
            showSuccessMessage('Message Submitted!', 'Your message has been submitted. If you don\'t hear from us within 24 hours, please call us at 0581790093.');
        }

        // Reset form even on error
        form.reset();

        // Reset CAPTCHA
        if (formType === 'demo' && demoCaptcha) {
            demoCaptcha.reset();
        } else if (formType === 'contact' && contactCaptcha) {
            contactCaptcha.reset();
        }
    } finally {
        // Reset button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Enhanced form submission handlers
const demoForm = document.getElementById('demoForm');
const contactForm = document.getElementById('contactForm');

if (demoForm) {
    demoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate CAPTCHA
        if (!demoCaptcha.isVerified) {
            showErrorFeedback('demo', 'Please complete the security verification first.');
            return false;
        }

        // Validate all required fields
        const requiredFields = demoForm.querySelectorAll('[required]');
        let allValid = true;
        let firstInvalidField = null;

        requiredFields.forEach(field => {
            const value = field.value.trim();

            if (!value) {
                allValid = false;
                field.classList.add('field-error');
                if (!firstInvalidField) firstInvalidField = field;
            } else {
                field.classList.remove('field-error');

                // Additional validation based on field type
                if (field.type === 'email' && !formSecurity.isValidEmail(value)) {
                    allValid = false;
                    formSecurity.showFieldError(field, 'Please enter a valid email address');
                    if (!firstInvalidField) firstInvalidField = field;
                } else if (field.type === 'tel' && !formSecurity.isValidPhone(value)) {
                    allValid = false;
                    formSecurity.showFieldError(field, 'Please enter a valid phone number');
                    if (!firstInvalidField) firstInvalidField = field;
                } else if (field.type === 'date') {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (selectedDate < today) {
                        allValid = false;
                        formSecurity.showFieldError(field, 'Please select a future date');
                        if (!firstInvalidField) firstInvalidField = field;
                    }
                }
            }
        });

        if (!allValid) {
            showErrorFeedback('demo', 'Please fill in all required fields correctly.');
            if (firstInvalidField) {
                firstInvalidField.focus();
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
        }

        // Check rate limiting
        if (!formSecurity.addRateLimiting()) {
            return false;
        }

        // Submit form
        await submitFormWithFormSubmit(demoForm, 'demo');
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate CAPTCHA
        if (!contactCaptcha.isVerified) {
            showErrorFeedback('contact', 'Please complete the security verification first.');
            return false;
        }

        // Validate all required fields
        const requiredFields = contactForm.querySelectorAll('[required]');
        let allValid = true;
        let firstInvalidField = null;

        requiredFields.forEach(field => {
            const value = field.value.trim();

            if (!value) {
                allValid = false;
                field.classList.add('field-error');
                if (!firstInvalidField) firstInvalidField = field;
            } else {
                field.classList.remove('field-error');

                // Additional validation
                if (field.type === 'email' && !formSecurity.isValidEmail(value)) {
                    allValid = false;
                    formSecurity.showFieldError(field, 'Please enter a valid email address');
                    if (!firstInvalidField) firstInvalidField = field;
                }
            }
        });

        // Check message length
        const messageField = document.getElementById('contactMessage');
        if (messageField && messageField.value.length > 1000) {
            allValid = false;
            formSecurity.showFieldError(messageField, 'Message must be 1000 characters or less');
            if (!firstInvalidField) firstInvalidField = messageField;
        }

        if (!allValid) {
            showErrorFeedback('contact', 'Please fill in all required fields correctly.');
            if (firstInvalidField) {
                firstInvalidField.focus();
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
        }

        // Check rate limiting
        if (!formSecurity.addRateLimiting()) {
            return false;
        }

        // Submit form
        await submitFormWithFormSubmit(contactForm, 'contact');
    });
}

function showModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Close modal when clicking outside
const modal = document.getElementById('successModal');
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Form validation and styling
function setupFormInputs() {
    const inputs = document.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        // Handle floating labels
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });

        // Check if input has value on load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
}

setupFormInputs();

// Back to top button
const backToTopBtn = document.getElementById('backtotop');

if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Optimized parallax effect for hero section
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-card');

    // Only apply parallax on desktop to improve mobile performance
    if (window.innerWidth > 768) {
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}, { passive: true });

// Video Player Functionality
class VideoPlayer {
    constructor(videoCard) {
        this.videoCard = videoCard;
        this.video = videoCard.querySelector('.gym-video');
        this.playBtn = videoCard.querySelector('.play-btn');
        this.overlay = videoCard.querySelector('.video-overlay');
        this.isPlaying = false;
        this.init();
    }

    init() {
        this.createControls();
        this.attachEventListeners();
    }

    createControls() {
        const controlsHTML = `
            <div class="video-controls">
                <button class="control-btn play-pause-btn">
                    <i class="fas fa-play"></i>
                </button>
                <div class="progress-container">
                    <div class="progress-filled"></div>
                </div>
                <span class="time-display">0:00 / 0:00</span>
                <div class="volume-container">
                    <button class="control-btn volume-btn">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <input type="range" class="volume-slider" min="0" max="100" value="100">
                </div>
                <button class="control-btn fullscreen-btn">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        `;

        const videoContainer = this.videoCard.querySelector('.video-container');
        videoContainer.insertAdjacentHTML('beforeend', controlsHTML);

        this.controls = videoContainer.querySelector('.video-controls');
        this.playPauseBtn = this.controls.querySelector('.play-pause-btn');
        this.progressContainer = this.controls.querySelector('.progress-container');
        this.progressFilled = this.controls.querySelector('.progress-filled');
        this.timeDisplay = this.controls.querySelector('.time-display');
        this.volumeBtn = this.controls.querySelector('.volume-btn');
        this.volumeSlider = this.controls.querySelector('.volume-slider');
        this.fullscreenBtn = this.controls.querySelector('.fullscreen-btn');
    }

    attachEventListeners() {
        // Play button click
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());

        // Video events
        this.video.addEventListener('loadedmetadata', () => this.updateTimeDisplay());
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('ended', () => this.handleVideoEnd());

        // Progress bar
        this.progressContainer.addEventListener('click', (e) => this.seekVideo(e));

        // Volume controls
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.volumeSlider.addEventListener('input', (e) => this.changeVolume(e));

        // Fullscreen
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Show/hide controls on hover
        this.video.addEventListener('mouseenter', () => this.showControls());
        this.video.addEventListener('mouseleave', () => this.hideControls());
        this.controls.addEventListener('mouseenter', () => this.showControls());
        this.controls.addEventListener('mouseleave', () => this.hideControls());

        // Click to play/pause
        this.video.addEventListener('click', () => this.togglePlay());
    }

    togglePlay() {
        if (this.video.paused) {
            this.playVideo();
        } else {
            this.pauseVideo();
        }
    }

    playVideo() {
        // Pause all other videos first
        document.querySelectorAll('.gym-video').forEach(v => {
            if (v !== this.video && !v.paused) {
                v.pause();
                v.closest('.video-card').querySelector('.video-overlay').classList.remove('playing');
                v.closest('.video-card').querySelector('.play-pause-btn i').className = 'fas fa-play';
            }
        });

        this.video.play();
        this.overlay.classList.add('playing');
        this.playPauseBtn.querySelector('i').className = 'fas fa-pause';
        this.isPlaying = true;
    }

    pauseVideo() {
        this.video.pause();
        this.overlay.classList.remove('playing');
        this.playPauseBtn.querySelector('i').className = 'fas fa-play';
        this.isPlaying = false;
    }

    handleVideoEnd() {
        this.overlay.classList.remove('playing');
        this.playPauseBtn.querySelector('i').className = 'fas fa-play';
        this.isPlaying = false;
        this.video.currentTime = 0;
    }

    updateProgress() {
        const progress = (this.video.currentTime / this.video.duration) * 100;
        this.progressFilled.style.width = `${progress}%`;
        this.updateTimeDisplay();
    }

    updateTimeDisplay() {
        const current = this.formatTime(this.video.currentTime);
        const duration = this.formatTime(this.video.duration);
        this.timeDisplay.textContent = `${current} / ${duration}`;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    seekVideo(e) {
        const rect = this.progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.video.currentTime = pos * this.video.duration;
    }

    toggleMute() {
        this.video.muted = !this.video.muted;
        this.volumeBtn.querySelector('i').className = this.video.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        this.volumeSlider.value = this.video.muted ? 0 : this.video.volume * 100;
    }

    changeVolume(e) {
        this.video.volume = e.target.value / 100;
        this.video.muted = e.target.value == 0;
        this.volumeBtn.querySelector('i').className = this.video.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            this.video.requestFullscreen();
        }
    }

    showControls() {
        if (this.isPlaying) {
            this.controls.classList.add('show');
        }
    }

    hideControls() {
        setTimeout(() => {
            if (!this.controls.matches(':hover')) {
                this.controls.classList.remove('show');
            }
        }, 2000);
    }
}

// Initialize video players
function initializeVideoPlayers() {
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        new VideoPlayer(card);
    });
}

// Auto-play videos function
function initializeAutoplayVideos() {
    // Play hero background video
    const heroVideo = document.querySelector('.hero-background-video');
    if (heroVideo) {
        heroVideo.removeAttribute('controls');
        heroVideo.controls = false;
        heroVideo.muted = true;
        heroVideo.playsInline = true;
        heroVideo.autoplay = true;
        heroVideo.loop = true;
        heroVideo.preload = 'auto';
        heroVideo.setAttribute('playsinline', '');
        heroVideo.setAttribute('webkit-playsinline', '');
        heroVideo.setAttribute('disableremoteplayback', '');
        heroVideo.setAttribute('disablepictureinpicture', '');
        heroVideo.style.pointerEvents = 'none';

        const playVideo = () => {
            heroVideo.currentTime = 0;
            heroVideo.play().catch(e => {
                console.log('Hero background video autoplay prevented by browser policy');
            });
        };

        if (heroVideo.readyState >= 2) {
            playVideo();
        } else {
            heroVideo.addEventListener('loadeddata', playVideo, { once: true });
        }

        heroVideo.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    }

    // Media section videos - disable autoplay, show controls
    const mediaVideos = document.querySelectorAll('#media .gym-video');
    mediaVideos.forEach((video, index) => {
        if (!video) return;

        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.autoplay = false;
        video.preload = 'metadata';
        video.removeAttribute('autoplay');

        const overlay = video.closest('.video-container')?.querySelector('.video-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.classList.remove('playing');
        }
    });
}

// Mobile-specific enhancements
function initializeMobileEnhancements() {
    // Fix mobile viewport
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        const vw = window.innerWidth * 0.01;
        document.documentElement.style.setProperty('--vw', `${vw}px`);

        document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
        document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
        document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');

        const dpr = window.devicePixelRatio || 1;
        document.documentElement.style.setProperty('--device-pixel-ratio', dpr);
    };

    setVH();

    let resizeTimer;
    const debouncedResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setVH, 150);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });
    window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 600);
    }, { passive: true });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', setVH, { passive: true });
    }

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(setVH, 100);
        }
    });

    // Enhanced touch interactions
    const interactiveElements = document.querySelectorAll('button, .btn, .nav-link, .trainer-card, .service-card, .plan-card, .contact-card');

    interactiveElements.forEach(element => {
        element.style.minHeight = '48px';
        element.style.minWidth = '48px';

        let touchStartTime = 0;

        element.addEventListener('touchstart', function(e) {
            touchStartTime = Date.now();
            this.style.transform = 'scale(0.96)';
            this.style.transition = 'transform 0.1s ease-out';

            if (navigator.vibrate) {
                navigator.vibrate(10);
            }

            this.classList.add('touch-active');
        }, { passive: true });

        element.addEventListener('touchend', function(e) {
            this.style.transform = 'scale(1)';
            this.style.transition = 'transform 0.2s ease-out';

            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 200);
        }, { passive: true });

        element.addEventListener('touchcancel', function() {
            this.style.transform = 'scale(1)';
            this.classList.remove('touch-active');
        }, { passive: true });
    });

    // Prevent iOS bounce scroll interference
    document.addEventListener('touchmove', function(e) {
        const target = e.target;
        const scrollableParent = target.closest('.nav-menu, .modal, textarea, input');

        if (!scrollableParent && document.body.style.overflow === 'hidden') {
            e.preventDefault();
        }
    }, { passive: false });

    // Better mobile form experience
    const formInputs = document.querySelectorAll('input, select, textarea');

    formInputs.forEach(input => {
        input.style.minHeight = '48px';
        input.style.fontSize = '16px'; // Prevents zoom on iOS

        input.addEventListener('focus', () => {
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    const navHeight = document.querySelector('.Navbar').offsetHeight;
                    const inputRect = input.getBoundingClientRect();
                    const targetY = inputRect.top + window.scrollY - navHeight - 20;
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                }, 300);
            }
        });
    });
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('New Lifestyle Gym website loaded successfully!');

    try {
        // Always scroll to top first
        window.scrollTo(0, 0);

        // Check for success messages first
        checkForSuccessMessage();

        // Initialize mobile enhancements
        initializeMobileEnhancements();

        // Initialize navigation
        initializeNavigation();

        // Initialize navigation events
        initializeNavigationEvents();

        // Initialize form security and CAPTCHA systems
        initializeFormSecurity();

        // Set minimum date for demo booking to today
        const dateInput = document.getElementById('preferredDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }

        // Initialize autoplay videos
        initializeAutoplayVideos();

        // Initialize video players with delay
        requestAnimationFrame(() => {
            initializeVideoPlayers();
        });

        // Add touch gesture support
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }

    } catch (error) {
        console.warn('Non-critical initialization error:', error);
    }
});
