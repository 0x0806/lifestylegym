// Check for success parameter in URL and show success message
function checkForSuccessMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');

    if (success === 'demo') {
        showSuccessMessage('Demo Booking Successful!', 'Your demo session has been booked successfully. We will contact you soon to confirm the details.');
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (success === 'contact') {
        showSuccessMessage('Message Sent!', 'Your message has been sent successfully. We will get back to you soon!');
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}// Check for success parameter in URL and show success message
function checkForSuccessMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');

    if (success === 'demo') {
        showSuccessMessage('Demo Booking Successful!', 'Your demo session has been booked successfully. We will contact you soon to confirm the details.');
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (success === 'contact') {
        showSuccessMessage('Message Sent!', 'Your message has been sent successfully. We will get back to you soon!');
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
    }
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





// Navigation functionality with proper initialization
function initializeNavigation() {
    const Navbar = document.getElementById('Navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (Navbar && window.scrollY > 100) {
            Navbar.classList.add('scrolled');
        } else if (Navbar) {
            Navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger clicked'); // Debug log
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Only prevent body scroll when menu is open - improved for mobile
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
            } else {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });

        // Close menu when clicking outside - improved touch handling
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });

        // Better touch handling for mobile
        document.addEventListener('touchstart', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });
    }

    // Close mobile menu when clicking on a link - improved
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        });
    });
}

// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add click listeners to nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToSection(targetId);
    });
});

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

// Advanced CAPTCHA functionality
class AdvancedCaptcha {
    constructor(containerId, type = 'mixed') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`CAPTCHA container with ID '${containerId}' not found`);
        }
        
        this.containerId = containerId;
        this.type = type; // 'math', 'image', 'drag', 'text', 'mixed'
        this.currentChallenge = null;
        this.attempts = 0;
        this.maxAttempts = 3;
        this.isVerified = false;
        this.sessionToken = this.generateSessionToken();
        
        // Add container identifier for debugging
        this.container.dataset.captchaId = this.sessionToken;
        
        console.log(`Initializing CAPTCHA for container: ${containerId}, type: ${type}`);
        this.init();
    }

    generateSessionToken() {
        return 'captcha_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    init() {
        this.generateChallenge();
    }

    generateChallenge() {
        const challengeTypes = this.type === 'mixed' 
            ? ['math', 'image', 'drag', 'text'] 
            : [this.type];
        
        const selectedType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
        
        switch(selectedType) {
            case 'math':
                this.generateMathChallenge();
                break;
            case 'image':
                this.generateImageChallenge();
                break;
            case 'drag':
                this.generateDragChallenge();
                break;
            case 'text':
                this.generateTextChallenge();
                break;
        }
    }

    generateMathChallenge() {
        const operations = [
            { type: 'add', symbol: '+' },
            { type: 'subtract', symbol: '−' },
            { type: 'multiply', symbol: '×' },
            { type: 'sequence', symbol: 'next' }
        ];
        
        const operation = operations[Math.floor(Math.random() * operations.length)];
        let question, answer;

        switch(operation.type) {
            case 'add':
                const num1 = Math.floor(Math.random() * 20) + 1;
                const num2 = Math.floor(Math.random() * 20) + 1;
                question = `What is ${num1} ${operation.symbol} ${num2}?`;
                answer = num1 + num2;
                break;
            case 'subtract':
                const large = Math.floor(Math.random() * 30) + 10;
                const small = Math.floor(Math.random() * 10) + 1;
                question = `What is ${large} ${operation.symbol} ${small}?`;
                answer = large - small;
                break;
            case 'multiply':
                const n1 = Math.floor(Math.random() * 8) + 2;
                const n2 = Math.floor(Math.random() * 8) + 2;
                question = `What is ${n1} ${operation.symbol} ${n2}?`;
                answer = n1 * n2;
                break;
            case 'sequence':
                const start = Math.floor(Math.random() * 10) + 1;
                const step = Math.floor(Math.random() * 3) + 1;
                const sequence = [start, start + step, start + 2*step];
                question = `What number comes next: ${sequence.join(', ')}, ?`;
                answer = start + 3*step;
                break;
        }

        this.currentChallenge = {
            type: 'math',
            answer: answer.toString(),
            question: question
        };

        this.renderMathChallenge();
    }

    generateImageChallenge() {
        // Generate grid-based image CAPTCHA
        const images = ['dumbbell', 'treadmill', 'yoga', 'weights', 'bike', 'kettlebell'];
        const targetImage = images[Math.floor(Math.random() * images.length)];
        const gridSize = 9;
        const correctPositions = [];
        
        // Generate random positions for target images (2-4 correct images)
        const numCorrect = Math.floor(Math.random() * 3) + 2;
        for(let i = 0; i < numCorrect; i++) {
            let pos;
            do {
                pos = Math.floor(Math.random() * gridSize);
            } while(correctPositions.includes(pos));
            correctPositions.push(pos);
        }

        this.currentChallenge = {
            type: 'image',
            target: targetImage,
            correctPositions: correctPositions,
            selectedPositions: [],
            gridSize: gridSize
        };

        this.renderImageChallenge();
    }

    generateDragChallenge() {
        const puzzlePieces = ['piece1', 'piece2', 'piece3', 'piece4'];
        const correctOrder = [...puzzlePieces];
        const scrambledOrder = [...puzzlePieces].sort(() => Math.random() - 0.5);

        this.currentChallenge = {
            type: 'drag',
            correctOrder: correctOrder,
            currentOrder: scrambledOrder,
            instruction: 'Drag the puzzle pieces to spell "GYM"'
        };

        this.renderDragChallenge();
    }

    generateTextChallenge() {
        // Generate distorted text CAPTCHA
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const length = 5;
        let code = '';
        
        for(let i = 0; i < length; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        this.currentChallenge = {
            type: 'text',
            code: code,
            answer: code
        };

        this.renderTextChallenge();
    }

    renderMathChallenge() {
        this.container.innerHTML = `
            <div class="captcha-challenge math-challenge">
                <label class="captcha-label">Security Verification (Required)</label>
                <div class="captcha-question-container">
                    <div class="math-question">
                        <i class="fas fa-calculator"></i>
                        <span class="question-text">${this.currentChallenge.question}</span>
                    </div>
                    <button type="button" class="captcha-refresh" onclick="this.parentElement.parentElement.parentElement.__captcha.refresh()">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <input type="text" class="captcha-input" placeholder="Enter your answer" required>
                <div class="captcha-attempts">${this.maxAttempts - this.attempts} attempts remaining</div>
            </div>
        `;
        this.container.__captcha = this;
    }

    renderImageChallenge() {
        const imageNames = {
            'dumbbell': 'dumbbells',
            'treadmill': 'treadmills', 
            'yoga': 'yoga poses',
            'weights': 'weight plates',
            'bike': 'exercise bikes',
            'kettlebell': 'kettlebells'
        };

        let gridHTML = '';
        for(let i = 0; i < this.currentChallenge.gridSize; i++) {
            const isCorrect = this.currentChallenge.correctPositions.includes(i);
            const imageType = isCorrect ? this.currentChallenge.target : 
                ['dumbbell', 'treadmill', 'yoga', 'weights', 'bike', 'kettlebell']
                .filter(img => img !== this.currentChallenge.target)
                [Math.floor(Math.random() * 5)];
            
            gridHTML += `
                <div class="image-grid-item" data-position="${i}" onclick="this.parentElement.parentElement.parentElement.__captcha.selectImage(${i})">
                    <div class="gym-icon ${imageType}">
                        <i class="fas fa-${this.getIconClass(imageType)}"></i>
                    </div>
                </div>
            `;
        }

        this.container.innerHTML = `
            <div class="captcha-challenge image-challenge">
                <label class="captcha-label">Security Verification (Required)</label>
                <div class="captcha-instruction">
                    <i class="fas fa-images"></i>
                    Select all images with <strong>${imageNames[this.currentChallenge.target]}</strong>
                </div>
                <div class="image-grid">
                    ${gridHTML}
                </div>
                <div class="captcha-controls">
                    <button type="button" class="captcha-refresh" onclick="this.parentElement.parentElement.parentElement.__captcha.refresh()">
                        <i class="fas fa-sync-alt"></i> New Images
                    </button>
                    <button type="button" class="captcha-verify" onclick="this.parentElement.parentElement.parentElement.__captcha.verifyImageSelection()">
                        <i class="fas fa-check"></i> Verify
                    </button>
                </div>
                <div class="captcha-attempts">${this.maxAttempts - this.attempts} attempts remaining</div>
            </div>
        `;
        this.container.__captcha = this;
    }

    renderDragChallenge() {
        const letters = ['G', 'Y', 'M'];
        const shuffledLetters = [...letters].sort(() => Math.random() - 0.5);

        this.container.innerHTML = `
            <div class="captcha-challenge drag-challenge">
                <label class="captcha-label">Security Verification (Required)</label>
                <div class="captcha-instruction">
                    <i class="fas fa-hand-rock"></i>
                    ${this.currentChallenge.instruction}
                </div>
                <div class="drag-container">
                    <div class="drag-source">
                        ${shuffledLetters.map((letter, index) => `
                            <div class="draggable-letter" draggable="true" data-letter="${letter}" data-index="${index}">
                                ${letter}
                            </div>
                        `).join('')}
                    </div>
                    <div class="drag-target">
                        <div class="drop-zone" data-position="0">Drop here</div>
                        <div class="drop-zone" data-position="1">Drop here</div>
                        <div class="drop-zone" data-position="2">Drop here</div>
                    </div>
                </div>
                <div class="captcha-controls">
                    <button type="button" class="captcha-refresh" onclick="this.parentElement.parentElement.parentElement.__captcha.refresh()">
                        <i class="fas fa-sync-alt"></i> Reset
                    </button>
                </div>
                <div class="captcha-attempts">${this.maxAttempts - this.attempts} attempts remaining</div>
            </div>
        `;
        this.container.__captcha = this;
        this.setupDragAndDrop();
    }

    renderTextChallenge() {
        // Create canvas for distorted text
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');

        // Background with noise
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add noise
        for(let i = 0; i < 100; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
        }

        // Draw distorted text
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#333';
        
        for(let i = 0; i < this.currentChallenge.code.length; i++) {
            const letter = this.currentChallenge.code[i];
            const x = 30 + i * 25 + (Math.random() - 0.5) * 10;
            const y = 45 + (Math.random() - 0.5) * 10;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((Math.random() - 0.5) * 0.5);
            ctx.fillText(letter, 0, 0);
            ctx.restore();
        }

        // Add lines
        for(let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
            ctx.lineWidth = 2;
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }

        this.container.innerHTML = `
            <div class="captcha-challenge text-challenge">
                <label class="captcha-label">Security Verification (Required)</label>
                <div class="captcha-instruction">
                    <i class="fas fa-eye"></i>
                    Enter the code shown in the image
                </div>
                <div class="captcha-canvas-container">
                    <canvas class="captcha-canvas" width="200" height="80"></canvas>
                </div>
                <input type="text" class="captcha-input" placeholder="Enter the code" maxlength="5" required>
                <div class="captcha-controls">
                    <button type="button" class="captcha-refresh" onclick="this.parentElement.parentElement.parentElement.__captcha.refresh()">
                        <i class="fas fa-sync-alt"></i> New Code
                    </button>
                </div>
                <div class="captcha-attempts">${this.maxAttempts - this.attempts} attempts remaining</div>
            </div>
        `;

        // Replace canvas with generated one
        const canvasContainer = this.container.querySelector('.captcha-canvas');
        canvasContainer.parentNode.replaceChild(canvas, canvasContainer);
        canvas.className = 'captcha-canvas';
        
        this.container.__captcha = this;
    }

    getIconClass(imageType) {
        const iconMap = {
            'dumbbell': 'dumbbell',
            'treadmill': 'running',
            'yoga': 'peace',
            'weights': 'weight-hanging',
            'bike': 'biking',
            'kettlebell': 'weight'
        };
        return iconMap[imageType] || 'question';
    }

    selectImage(position) {
        const item = this.container.querySelector(`[data-position="${position}"]`);
        if(item.classList.contains('selected')) {
            item.classList.remove('selected');
            this.currentChallenge.selectedPositions = this.currentChallenge.selectedPositions.filter(p => p !== position);
        } else {
            item.classList.add('selected');
            this.currentChallenge.selectedPositions.push(position);
        }
    }

    verifyImageSelection() {
        const correct = this.currentChallenge.correctPositions.sort().join(',');
        const selected = this.currentChallenge.selectedPositions.sort().join(',');
        
        if(correct === selected) {
            this.showSuccess();
            return true;
        } else {
            this.showError('Please select all correct images');
            return false;
        }
    }

    setupDragAndDrop() {
        const draggables = this.container.querySelectorAll('.draggable-letter');
        const dropZones = this.container.querySelectorAll('.drop-zone');

        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', draggable.dataset.letter);
                e.dataTransfer.effectAllowed = 'move';
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const letter = e.dataTransfer.getData('text/plain');
                zone.textContent = letter;
                zone.classList.remove('drag-over');
                zone.classList.add('filled');
                
                // Hide the dragged element
                const draggedElement = this.container.querySelector(`[data-letter="${letter}"]`);
                if(draggedElement) {
                    draggedElement.style.display = 'none';
                }

                this.checkDragCompletion();
            });
        });
    }

    checkDragCompletion() {
        const dropZones = this.container.querySelectorAll('.drop-zone');
        const result = Array.from(dropZones).map(zone => zone.textContent === 'Drop here' ? '' : zone.textContent).join('');
        
        if(result.length === 3) {
            if(result === 'GYM') {
                this.showSuccess();
                return true;
            } else {
                this.showError('Incorrect order. Try again!');
                setTimeout(() => this.refresh(), 1500);
                return false;
            }
        }
        return false;
    }

    validate() {
        if(this.attempts >= this.maxAttempts) {
            this.showError('Maximum attempts exceeded. Please refresh the page.');
            return false;
        }

        // Check if challenge exists
        if (!this.currentChallenge) {
            this.showError('CAPTCHA not properly loaded. Please refresh.');
            return false;
        }

        // If already verified, return true
        if (this.isVerified) {
            return true;
        }

        switch(this.currentChallenge.type) {
            case 'math':
                const mathInput = this.container.querySelector('.captcha-input');
                if (!mathInput) {
                    this.showError('CAPTCHA input not found. Please refresh.');
                    return false;
                }
                const userAnswer = mathInput.value.trim();
                if (!userAnswer) {
                    this.showError('Please enter your answer.');
                    mathInput.focus();
                    return false;
                }
                if(userAnswer === this.currentChallenge.answer) {
                    this.showSuccess();
                    return true;
                } else {
                    this.attempts++;
                    this.showError('Incorrect answer. Try again!');
                    mathInput.value = '';
                    mathInput.focus();
                    this.updateAttemptsDisplay();
                    return false;
                }
            case 'image':
                if (this.currentChallenge.selectedPositions.length === 0) {
                    this.showError('Please select at least one image.');
                    return false;
                }
                return this.verifyImageSelection();
            case 'drag':
                const dropZones = this.container.querySelectorAll('.drop-zone');
                const filledCount = Array.from(dropZones).filter(zone => 
                    zone.textContent !== 'Drop here').length;
                if (filledCount < 3) {
                    this.showError('Please drag all letters to complete the word.');
                    return false;
                }
                return this.checkDragCompletion();
            case 'text':
                const textInput = this.container.querySelector('.captcha-input');
                if (!textInput) {
                    this.showError('CAPTCHA input not found. Please refresh.');
                    return false;
                }
                const userCode = textInput.value.trim().toUpperCase();
                if (!userCode) {
                    this.showError('Please enter the code from the image.');
                    textInput.focus();
                    return false;
                }
                if(userCode === this.currentChallenge.code) {
                    this.showSuccess();
                    return true;
                } else {
                    this.attempts++;
                    this.showError('Incorrect code. Try again!');
                    textInput.value = '';
                    textInput.focus();
                    this.updateAttemptsDisplay();
                    return false;
                }
        }
        return false;
    }

    updateAttemptsDisplay() {
        const attemptsEl = this.container.querySelector('.captcha-attempts');
        if(attemptsEl) {
            const remaining = this.maxAttempts - this.attempts;
            attemptsEl.textContent = `${remaining} attempts remaining`;
            if (remaining <= 1) {
                attemptsEl.style.color = '#dc3545';
                attemptsEl.style.fontWeight = 'bold';
            }
        }
    }

    showSuccess() {
        this.container.classList.remove('captcha-error');
        this.container.classList.add('captcha-success');
        
        // Remove any existing error messages
        const existingError = this.container.querySelector('.captcha-error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Update or create success message
        let successMsg = this.container.querySelector('.captcha-success-message');
        if (!successMsg) {
            successMsg = document.createElement('div');
            successMsg.className = 'captcha-success-message';
            this.container.appendChild(successMsg);
        }
        successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Verification successful!';
        
        // Disable all interactive elements
        const inputs = this.container.querySelectorAll('input, button:not(.captcha-refresh)');
        inputs.forEach(input => {
            input.disabled = true;
            input.style.opacity = '0.6';
        });
        
        // Make verification permanent
        this.isVerified = true;
    }

    showError(message) {
        this.container.classList.add('captcha-error');
        setTimeout(() => this.container.classList.remove('captcha-error'), 2000);
        
        // Remove existing error messages
        const existingErrors = this.container.querySelectorAll('.captcha-error-message');
        existingErrors.forEach(error => error.remove());
        
        // Create new error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'captcha-error-message';
        errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        this.container.appendChild(errorMsg);
        
        // Auto-remove error message
        setTimeout(() => {
            if(errorMsg.parentNode) {
                errorMsg.remove();
            }
        }, 4000);

        // Update attempts display
        this.updateAttemptsDisplay();
        
        // Refresh CAPTCHA if max attempts exceeded
        if (this.attempts >= this.maxAttempts) {
            setTimeout(() => {
                this.refresh();
                this.attempts = 0;
                this.updateAttemptsDisplay();
            }, 2000);
        }
    }

    refresh() {
        // Reset all states
        this.container.classList.remove('captcha-success', 'captcha-error');
        this.isVerified = false;
        
        // Remove all message elements
        const messages = this.container.querySelectorAll('.captcha-error-message, .captcha-success-message');
        messages.forEach(msg => msg.remove());
        
        // Re-enable all inputs
        const inputs = this.container.querySelectorAll('input, button');
        inputs.forEach(input => {
            input.disabled = false;
            input.style.opacity = '1';
        });
        
        // Generate new challenge
        this.generateChallenge();
        console.log('CAPTCHA refreshed with new challenge:', this.currentChallenge?.type);
    }

    isComplete() {
        return this.isVerified === true && this.container.classList.contains('captcha-success');
    }

    getSessionData() {
        return {
            token: this.sessionToken,
            type: this.currentChallenge?.type || 'unknown',
            completed: this.isComplete(),
            attempts: this.attempts,
            timestamp: Date.now()
        };
    }

    // Public method to check if CAPTCHA is properly validated
    isValid() {
        return this.isComplete() && this.currentChallenge !== null;
    }
}

// Initialize CAPTCHA instances
let demoCaptcha, contactCaptcha;

function refreshDemoCaptcha() {
    if(demoCaptcha) {
        demoCaptcha.refresh();
    } else {
        console.log('Demo CAPTCHA not initialized');
        // Try to reinitialize if container exists
        const container = document.getElementById('demoCaptchaContainer');
        if (container) {
            demoCaptcha = new AdvancedCaptcha('demoCaptchaContainer', 'mixed');
        }
    }
}

function refreshContactCaptcha() {
    if(contactCaptcha) {
        contactCaptcha.refresh();
    } else {
        console.log('Contact CAPTCHA not initialized');
        // Try to reinitialize if container exists
        const container = document.getElementById('contactCaptchaContainer');
        if (container) {
            contactCaptcha = new AdvancedCaptcha('contactCaptchaContainer', 'mixed');
        }
    }
}

function validateCaptcha(containerId) {
    if(containerId.includes('demo')) {
        if (!demoCaptcha) {
            console.error('Demo CAPTCHA not initialized');
            return false;
        }
        return demoCaptcha.validate();
    } else {
        if (!contactCaptcha) {
            console.error('Contact CAPTCHA not initialized');
            return false;
        }
        return contactCaptcha.validate();
    }
}

// Global CAPTCHA status check
function isCaptchaReady(type) {
    if (type === 'demo') {
        return demoCaptcha && demoCaptcha.currentChallenge !== null;
    } else if (type === 'contact') {
        return contactCaptcha && contactCaptcha.currentChallenge !== null;
    }
    return false;
}

// Global CAPTCHA validation check
function isCaptchaValid(type) {
    if (type === 'demo') {
        return demoCaptcha && demoCaptcha.isValid();
    } else if (type === 'contact') {
        return contactCaptcha && contactCaptcha.isValid();
    }
    return false;
}

// Form handling with immediate feedback and success handling
const demoForm = document.getElementById('demoForm');
const contactForm = document.getElementById('contactForm');
const modal = document.getElementById('successModal');

// Simple form feedback functions for FormSubmit
function showImmediateSuccess(formType) {
    const title = formType === 'demo' ? 'Demo Booking Successful!' : 'Message Sent Successfully!';
    const message = formType === 'demo' 
        ? 'Your demo session has been booked successfully. We will contact you soon to confirm the details.'
        : 'Your message has been sent successfully. We will get back to you soon!';
    
    showSuccessMessage(title, message);
}

function showImmediateSuccess(formType) {
    const title = formType === 'demo' ? 'Demo Booking Successful!' : 'Message Sent Successfully!';
    const message = formType === 'demo' 
        ? 'Your demo session has been booked successfully. We will contact you soon to confirm the details.'
        : 'Your message has been sent successfully. We will get back to you soon!';
    
    showSuccessMessage(title, message);
    
    // Show in-form success message
    const form = formType === 'demo' ? demoForm : contactForm;
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <span>${title}</span>
        </div>
    `;
    
    // Insert success message at top of form
    form.insertBefore(successDiv, form.firstChild);
    
    // Remove success message after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
    
    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showErrorFeedback(formType, errorMessage) {
    const form = formType === 'demo' ? demoForm : contactForm;
    if (!form) return;
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${errorMessage}</span>
        </div>
    `;
    
    // Insert error message at top of form
    form.insertBefore(errorDiv, form.firstChild);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
    
    // Scroll to error message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showErrorFeedback(formType, errorMessage) {
    const form = formType === 'demo' ? demoForm : contactForm;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${errorMessage}</span>
        </div>
    `;
    
    // Insert error message at top of form
    form.insertBefore(errorDiv, form.firstChild);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
    
    // Scroll to error message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Add loading states to forms
if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Always prevent default first
        
        // Check required fields first
        const requiredFields = demoForm.querySelectorAll('[required]');
        let allValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allValid = false;
                field.style.borderColor = '#e74c3c';
                field.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.2)';
                if (allValid) field.focus(); // Focus first invalid field
            } else {
                field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                field.style.boxShadow = '';
            }
        });

        if (!allValid) {
            showErrorFeedback('demo', 'Please fill in all required fields correctly.');
            return false;
        }

        // Show loading state
        const submitBtn = demoForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Add form type for tracking
        let hiddenInput = demoForm.querySelector('input[name="form_type"]');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'form_type';
            hiddenInput.value = 'Demo Booking Request';
            demoForm.appendChild(hiddenInput);
        }

        // Submit the form naturally
        setTimeout(() => {
            demoForm.submit();
        }, 500);
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Always prevent default first
        
        // Check required fields first
        const requiredFields = contactForm.querySelectorAll('[required]');
        let allValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allValid = false;
                field.style.borderColor = '#e74c3c';
                field.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.2)';
                if (allValid) field.focus(); // Focus first invalid field
            } else {
                field.style.borderColor = '#f8f9fa';
                field.style.boxShadow = '';
            }
        });

        if (!allValid) {
            showErrorFeedback('contact', 'Please fill in all required fields correctly.');
            return false;
        }

        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Add form type for tracking
        let hiddenInput = contactForm.querySelector('input[name="form_type"]');
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'form_type';
            hiddenInput.value = 'Contact Message';
            contactForm.appendChild(hiddenInput);
        }

        // Submit the form naturally
        setTimeout(() => {
            contactForm.submit();
        }, 500);
    });
}

function showModal() {
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeModal() {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Close modal when clicking outside - with null check
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

// Back to top button with null check
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

// Optimized parallax effect for hero section - better mobile performance
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

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Lazy loading for images (if any images are added later)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

lazyLoadImages();

// Testimonial slider (if testimonials are added)
class TestimonialSlider {
    constructor(container) {
        this.container = container;
        this.slides = container.querySelectorAll('.testimonial-slide');
        this.currentSlide = 0;
        this.init();
    }

    init() {
        this.showSlide(0);
        this.autoPlay();
    }

    showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        this.currentSlide = index;
    }

    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(next);
    }

    prevSlide() {
        const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prev);
    }

    autoPlay() {
        setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
}

// Initialize testimonial slider if exists
const testimonialContainer = document.querySelector('.testimonials-slider');
if (testimonialContainer) {
    new TestimonialSlider(testimonialContainer);
}

// Fix potential null reference errors
function initializeSafeEventListeners() {
    // Initialize navigation properly
    initializeNavigation();

    // Safely initialize back to top button
    const backToTopBtn = document.getElementById('backtotop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Safely initialize modal
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Workout class schedule (interactive calendar)
class WorkoutSchedule {
    constructor(container) {
        this.container = container;
        this.currentWeek = new Date();
        this.init();
    }

    init() {
        this.renderSchedule();
        this.attachEventListeners();
    }

    renderSchedule() {
        // Implementation for rendering workout schedule
        // This would create an interactive weekly schedule
    }

    attachEventListeners() {
        // Event listeners for schedule interactions
    }
}

// BMI Calculator
class BMICalculator {
    constructor(container) {
        this.container = container;
        this.init();
    }

    init() {
        const form = this.container.querySelector('.bmi-form');
        if (form) {
            form.addEventListener('submit', this.calculateBMI.bind(this));
        }
    }

    calculateBMI(e) {
        e.preventDefault();
        const weight = parseFloat(e.target.weight.value);
        const height = parseFloat(e.target.height.value) / 100; // Convert cm to m

        if (weight && height) {
            const bmi = weight / (height * height);
            this.displayResult(bmi);
        }
    }

    displayResult(bmi) {
        const resultContainer = this.container.querySelector('.bmi-result');
        let category = '';
        let color = '';

        if (bmi < 18.5) {
            category = 'Underweight';
            color = '#3498db';
        } else if (bmi < 25) {
            category = 'Normal weight';
            color = '#2ecc71';
        } else if (bmi < 30) {
            category = 'Overweight';
            color = '#f39c12';
        } else {
            category = 'Obese';
            color = '#e74c3c';
        }

        resultContainer.innerHTML = `
            <div class="bmi-score" style="color: ${color}">
                <span class="bmi-value">${bmi.toFixed(1)}</span>
                <span class="bmi-category">${category}</span>
            </div>
        `;

        resultContainer.style.display = 'block';
    }
}

// Initialize BMI calculator if exists
const bmiContainer = document.querySelector('.bmi-calculator');
if (bmiContainer) {
    new BMICalculator(bmiContainer);
}

// Membership card hover effects
document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-15px) rotateX(5deg)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateX(0)';
    });
});

// Trainer card 3D hover effect
document.querySelectorAll('.trainer-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 5;
        const rotateY = (centerX - x) / 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Service card animations
document.querySelectorAll('.service-card').forEach(card => {
    const icon = card.querySelector('.service-icon');

    card.addEventListener('mouseenter', () => {
        icon.style.transform = 'rotateY(180deg) scale(1.1)';
    });

    card.addEventListener('mouseleave', () => {
        icon.style.transform = 'rotateY(0) scale(1)';
    });
});

// Floating animation for hero cards
function animateFloatingCards() {
    const cards = document.querySelectorAll('.floating-card');

    cards.forEach((card, index) => {
        const delay = index * 1000;
        const duration = 3000 + (index * 500);

        setInterval(() => {
            card.style.transform = `translateY(-20px) rotate(${Math.sin(Date.now() / 1000) * 5}deg)`;
            setTimeout(() => {
                card.style.transform = `translateY(0) rotate(0deg)`;
            }, duration / 2);
        }, duration);
    });
}

// Initialize floating card animations
setTimeout(animateFloatingCards, 2000);

// Equipment showcase (if equipment section is added)
class EquipmentShowcase {
    constructor(container) {
        this.container = container;
        this.currentIndex = 0;
        this.equipment = [];
        this.init();
    }

    init() {
        this.loadEquipment();
        this.renderEquipment();
        this.attachEventListeners();
    }

    loadEquipment() {
        this.equipment = [
            { name: 'Treadmills', count: 12, type: 'cardio' },
            { name: 'Free Weights', count: 50, type: 'strength' },
            { name: 'Cable Machines', count: 8, type: 'functional' },
            { name: 'Rowing Machines', count: 6, type: 'cardio' }
        ];
    }

    renderEquipment() {
        // Render equipment showcase
    }

    attachEventListeners() {
        // Equipment showcase interactions
    }
}

// Virtual tour functionality (if virtual tour is added)
class VirtualTour {
    constructor(container) {
        this.container = container;
        this.currentRoom = 'main-gym';
        this.rooms = {};
        this.init();
    }

    init() {
        this.loadRooms();
        this.renderTour();
    }

    loadRooms() {
        this.rooms = {
            'main-gym': {
                name: 'Main Gym Floor',
                description: 'State-of-the-art equipment and spacious workout area'
            },
            'ladies-section': {
                name: 'Ladies Section',
                description: 'Private workout area exclusively for women'
            },
            'group-class-room': {
                name: 'Group Class Studio',
                description: 'Dedicated space for group fitness classes'
            },
            'recovery-room': {
                name: 'Recovery Center',
                description: 'Relaxation and recovery therapy area'
            }
        };
    }

    renderTour() {
        // Render virtual tour interface
    }

    switchRoom(roomId) {
        this.currentRoom = roomId;
        this.renderTour();
    }
}

// Performance optimization - improved for mobile
function optimizePerformance() {
    // Debounce scroll events with better mobile handling
    let scrollTimer;
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(() => {
                // Handle scroll events here
                isScrolling = false;
            });
        }
    }, { passive: true });

    // Preload critical images
    const criticalImages = [
        // Add image URLs that need to be preloaded
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Improve touch scrolling on mobile
    if ('ontouchstart' in window) {
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.overflowScrolling = 'touch';
    }
}

// Call the function
optimizePerformance();

// Add mobile-specific scroll handling
function initializeMobileScrollFix() {
    // Prevent iOS bounce scroll interference
    document.addEventListener('touchmove', function(e) {
        // Only prevent default if we're not in a scrollable container
        const target = e.target;
        const scrollableParent = target.closest('.nav-menu, .modal, textarea, input');
        
        if (!scrollableParent && document.body.style.overflow === 'hidden') {
            e.preventDefault();
        }
    }, { passive: false });

    // Fix for mobile viewport height
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
}

// Responsive Breakpoint Manager
class ResponsiveManager {
    constructor() {
        this.breakpoints = {
            mobile: '(max-width: 768px)',
            tablet: '(min-width: 769px) and (max-width: 1024px)',
            desktop: '(min-width: 1025px)',
            small: '(max-width: 480px)',
            large: '(min-width: 1200px)'
        };
        this.mediaQueries = {};
        this.init();
    }

    init() {
        // Create media query objects
        Object.keys(this.breakpoints).forEach(key => {
            this.mediaQueries[key] = window.matchMedia(this.breakpoints[key]);
            this.mediaQueries[key].addEventListener('change', () => this.handleBreakpointChange(key));
        });

        // Initial setup
        this.setupResponsiveComponents();
        this.handleInitialBreakpoint();
    }

    handleBreakpointChange(breakpoint) {
        if (this.mediaQueries[breakpoint].matches) {
            this.applyBreakpointStyles(breakpoint);
        }
    }

    handleInitialBreakpoint() {
        Object.keys(this.mediaQueries).forEach(key => {
            if (this.mediaQueries[key].matches) {
                this.applyBreakpointStyles(key);
            }
        });
    }

    applyBreakpointStyles(breakpoint) {
        document.body.classList.remove('mobile', 'tablet', 'desktop', 'small', 'large');
        document.body.classList.add(breakpoint);

        // Apply specific responsive behaviors
        switch(breakpoint) {
            case 'mobile':
                this.optimizeForMobile();
                break;
            case 'tablet':
                this.optimizeForTablet();
                break;
            case 'desktop':
                this.optimizeForDesktop();
                break;
        }
    }

    optimizeForMobile() {
        // Mobile-specific optimizations
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            heroStats.style.flexDirection = 'row';
            heroStats.style.justifyContent = 'space-around';
        }

        // Adjust video containers for mobile
        const videoContainers = document.querySelectorAll('.workout-gif-container');
        videoContainers.forEach(container => {
            container.style.width = 'min(300px, 90vw)';
            container.style.height = 'auto';
        });
    }

    optimizeForTablet() {
        // Tablet-specific optimizations
        const servicesGrid = document.querySelector('.services-grid');
        if (servicesGrid) {
            servicesGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
    }

    optimizeForDesktop() {
        // Desktop-specific optimizations
        const workoutGrid = document.querySelector('.workout-gifs-grid');
        if (workoutGrid) {
            workoutGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
    }

    setupResponsiveComponents() {
        // Setup responsive navigation
        this.setupResponsiveNavigation();
        
        // Setup responsive forms
        this.setupResponsiveForms();
        
        // Setup responsive videos
        this.setupResponsiveVideos();
    }

    setupResponsiveNavigation() {
        const nav = document.querySelector('.nav-container');
        if (nav) {
            // Add responsive navigation behaviors
            nav.style.padding = 'clamp(0.75rem, 2vw, 2rem)';
        }
    }

    setupResponsiveForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.width = '100%';
            form.style.maxWidth = 'min(500px, 95vw)';
        });
    }

    setupResponsiveVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.style.width = '100%';
            video.style.height = 'auto';
        });
    }

    // Utility method to check current breakpoint
    getCurrentBreakpoint() {
        for (const [key, query] of Object.entries(this.mediaQueries)) {
            if (query.matches) {
                return key;
            }
        }
        return 'desktop';
    }

    // Method to apply responsive spacing
    applyResponsiveSpacing(element, property = 'padding') {
        if (element) {
            element.style[property] = 'clamp(1rem, 3vw, 3rem)';
        }
    }
}

// Enhanced viewport height handling for mobile browsers
function setResponsiveViewport() {
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Also set viewport width for responsive calculations
        const vw = window.innerWidth * 0.01;
        document.documentElement.style.setProperty('--vw', `${vw}px`);
    };

    setVH();
    
    // Debounced resize handler for better performance
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setVH, 100);
    });
    
    window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 500); // Delay for orientation change
    });
}

// Touch-friendly interaction improvements
function enhanceTouchInteractions() {
    // Improve touch targets
    const interactiveElements = document.querySelectorAll('button, .btn, .nav-link, .trainer-card, .service-card');
    
    interactiveElements.forEach(element => {
        element.style.minHeight = '44px';
        element.style.minWidth = '44px';
        
        // Add touch feedback
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });
}

// Initialize responsive features
const responsiveManager = new ResponsiveManager();
setResponsiveViewport();
enhanceTouchInteractions();

// Initialize performance optimizations
optimizePerformance();

// Accessibility improvements
function enhanceAccessibility() {
    // Keyboard navigation for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Focus management
    const focusableElements = document.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );

    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;

    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Initialize accessibility enhancements
enhanceAccessibility();

// Analytics and tracking (placeholder)
function initializeAnalytics() {
    // Track page views
    console.log('Page view tracked');

    // Track form submissions
    document.addEventListener('submit', (e) => {
        console.log('Form submission tracked:', e.target.id);
    });

    // Track button clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn')) {
            console.log('Button click tracked:', e.target.textContent);
        }
    });
}

// Initialize analytics
initializeAnalytics();

// Service Worker registration (for PWA if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

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

// Enhanced form validation
function enhanceFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });

        form.addEventListener('submit', (e) => {
            let isValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                e.preventDefault();
                const firstError = form.querySelector('.field-error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    clearFieldError(field);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
        isValid = false;
    }

    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            errorMessage = 'Please enter a valid phone number';
            isValid = false;
        }
    }

    // Date validation (not in the past)
    if (field.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            errorMessage = 'Please select a future date';
            isValid = false;
        }
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('field-error');

    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: var(--danger-color);
        font-size: 0.8rem;
        display: block;
        margin-top: 0.25rem;
        margin-left: 1rem;
    `;

    field.parentElement.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('field-error');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Improved accessibility for keyboard navigation
function enhanceKeyboardNavigation() {
    // Tab trap for modals
    const modal = document.getElementById('successModal');
    if (modal) {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable?.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable?.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // Focus management for mobile menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            setTimeout(() => {
                if (navMenu.classList.contains('active')) {
                    const firstNavLink = navMenu.querySelector('.nav-link');
                    if (firstNavLink) {
                        firstNavLink.focus();
                    }
                }
            }, 100);
        });
    }
}

// Auto-play videos function - optimized
function initializeAutoplayVideos() {
    // Play hero videos - seamless synchronization
    const heroVideos = document.querySelectorAll('.hero-video');
    heroVideos.forEach((video, index) => {
        if (!video) return;

        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.loop = true;
        video.preload = 'auto';

        const playVideo = () => {
            video.currentTime = 0;
            video.play().catch(e => {
                console.log(`Hero video ${index + 1} autoplay prevented by browser policy`);
            });
        };

        if (video.readyState >= 2) {
            playVideo();
        } else {
            video.addEventListener('loadeddata', playVideo, { once: true });
        }
    });

    // Media section videos - disable autoplay, show controls
    const mediaVideos = document.querySelectorAll('#media .gym-video');
    mediaVideos.forEach((video, index) => {
        if (!video) return;

        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.autoplay = false; // Disable autoplay
        video.preload = 'metadata';
        video.removeAttribute('autoplay'); // Remove autoplay attribute

        // Ensure overlay and play button are visible
        const overlay = video.closest('.video-container')?.querySelector('.video-overlay');
        if (overlay) {
            overlay.style.display = 'flex'; // Show play button overlay
            overlay.classList.remove('playing'); // Ensure overlay is visible
        }
    });
}

// Initialize all components when DOM is loaded - optimized
document.addEventListener('DOMContentLoaded', () => {
    console.log('New Lifestyle Gym website loaded successfully!');

    try {
        // Check for success messages first
        checkForSuccessMessage();

        // Initialize mobile scroll fixes first
        initializeMobileScrollFix();

        // Initialize safe event listeners first
        initializeSafeEventListeners();

        // Set minimum date for demo booking to today
        const dateInput = document.getElementById('preferredDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }

        // CAPTCHA initialization removed for better form submission

        // Initialize autoplay videos immediately for seamless playback
        initializeAutoplayVideos();

        // Initialize video players with delay for better performance
        requestAnimationFrame(() => {
            initializeVideoPlayers();
        });

        // Enhance form validation
        enhanceFormValidation();

        // Enhance keyboard navigation
        enhanceKeyboardNavigation();

    } catch (error) {
        console.warn('Non-critical initialization error:', error);
    }
});


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





// Navigation functionality with proper initialization
function initializeNavigation() {
    const Navbar = document.getElementById('Navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (Navbar && window.scrollY > 100) {
            Navbar.classList.add('scrolled');
        } else if (Navbar) {
            Navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger clicked'); // Debug log
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Only prevent body scroll when menu is open - improved for mobile
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
            } else {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });

        // Close menu when clicking outside - improved touch handling
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });

        // Better touch handling for mobile
        document.addEventListener('touchstart', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });
    }

    // Close mobile menu when clicking on a link - improved
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        });
    });
}

// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add click listeners to nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToSection(targetId);
    });
});

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

// Form handling with FormSubmit - safe initialization
const demoForm = document.getElementById('demoForm');
const contactForm = document.getElementById('contactForm');
const modal = document.getElementById('successModal');

// Add loading states to forms
if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
        // Check required fields first
        const requiredFields = demoForm.querySelectorAll('[required]');
        let allValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allValid = false;
                field.style.borderColor = '#e74c3c';
                field.focus();
            } else {
                field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        });

        if (!allValid) {
            e.preventDefault();
            return false;
        }

        // Show loading state but don't prevent submission
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
        }

        // Allow natural form submission for mobile compatibility
        return true;
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        // Check required fields first
        const requiredFields = contactForm.querySelectorAll('[required]');
        let allValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allValid = false;
                field.style.borderColor = '#e74c3c';
                if (allValid) field.focus(); // Focus first invalid field
            } else {
                field.style.borderColor = '#f8f9fa';
            }
        });

        if (!allValid) {
            e.preventDefault();
            return false;
        }

        // Show loading state but don't prevent form submission
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
        }

        // Allow natural form submission for mobile compatibility
        return true;
    });
}

function showModal() {
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeModal() {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Close modal when clicking outside - with null check
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

// Back to top button with null check
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

// Optimized parallax effect for hero section - better mobile performance
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

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Lazy loading for images (if any images are added later)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

lazyLoadImages();

// Testimonial slider (if testimonials are added)
class TestimonialSlider {
    constructor(container) {
        this.container = container;
        this.slides = container.querySelectorAll('.testimonial-slide');
        this.currentSlide = 0;
        this.init();
    }

    init() {
        this.showSlide(0);
        this.autoPlay();
    }

    showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        this.currentSlide = index;
    }

    nextSlide() {
        const next = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(next);
    }

    prevSlide() {
        const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prev);
    }

    autoPlay() {
        setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
}

// Initialize testimonial slider if exists
const testimonialContainer = document.querySelector('.testimonials-slider');
if (testimonialContainer) {
    new TestimonialSlider(testimonialContainer);
}

// Fix potential null reference errors
function initializeSafeEventListeners() {
    // Initialize navigation properly
    initializeNavigation();

    // Safely initialize back to top button
    const backToTopBtn = document.getElementById('backtotop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Safely initialize modal
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

// Workout class schedule (interactive calendar)
class WorkoutSchedule {
    constructor(container) {
        this.container = container;
        this.currentWeek = new Date();
        this.init();
    }

    init() {
        this.renderSchedule();
        this.attachEventListeners();
    }

    renderSchedule() {
        // Implementation for rendering workout schedule
        // This would create an interactive weekly schedule
    }

    attachEventListeners() {
        // Event listeners for schedule interactions
    }
}

// BMI Calculator
class BMICalculator {
    constructor(container) {
        this.container = container;
        this.init();
    }

    init() {
        const form = this.container.querySelector('.bmi-form');
        if (form) {
            form.addEventListener('submit', this.calculateBMI.bind(this));
        }
    }

    calculateBMI(e) {
        e.preventDefault();
        const weight = parseFloat(e.target.weight.value);
        const height = parseFloat(e.target.height.value) / 100; // Convert cm to m

        if (weight && height) {
            const bmi = weight / (height * height);
            this.displayResult(bmi);
        }
    }

    displayResult(bmi) {
        const resultContainer = this.container.querySelector('.bmi-result');
        let category = '';
        let color = '';

        if (bmi < 18.5) {
            category = 'Underweight';
            color = '#3498db';
        } else if (bmi < 25) {
            category = 'Normal weight';
            color = '#2ecc71';
        } else if (bmi < 30) {
            category = 'Overweight';
            color = '#f39c12';
        } else {
            category = 'Obese';
            color = '#e74c3c';
        }

        resultContainer.innerHTML = `
            <div class="bmi-score" style="color: ${color}">
                <span class="bmi-value">${bmi.toFixed(1)}</span>
                <span class="bmi-category">${category}</span>
            </div>
        `;

        resultContainer.style.display = 'block';
    }
}

// Initialize BMI calculator if exists
const bmiContainer = document.querySelector('.bmi-calculator');
if (bmiContainer) {
    new BMICalculator(bmiContainer);
}

// Membership card hover effects
document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-15px) rotateX(5deg)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateX(0)';
    });
});

// Trainer card 3D hover effect
document.querySelectorAll('.trainer-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 5;
        const rotateY = (centerX - x) / 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Service card animations
document.querySelectorAll('.service-card').forEach(card => {
    const icon = card.querySelector('.service-icon');

    card.addEventListener('mouseenter', () => {
        icon.style.transform = 'rotateY(180deg) scale(1.1)';
    });

    card.addEventListener('mouseleave', () => {
        icon.style.transform = 'rotateY(0) scale(1)';
    });
});

// Floating animation for hero cards
function animateFloatingCards() {
    const cards = document.querySelectorAll('.floating-card');

    cards.forEach((card, index) => {
        const delay = index * 1000;
        const duration = 3000 + (index * 500);

        setInterval(() => {
            card.style.transform = `translateY(-20px) rotate(${Math.sin(Date.now() / 1000) * 5}deg)`;
            setTimeout(() => {
                card.style.transform = `translateY(0) rotate(0deg)`;
            }, duration / 2);
        }, duration);
    });
}

// Initialize floating card animations
setTimeout(animateFloatingCards, 2000);

// Equipment showcase (if equipment section is added)
class EquipmentShowcase {
    constructor(container) {
        this.container = container;
        this.currentIndex = 0;
        this.equipment = [];
        this.init();
    }

    init() {
        this.loadEquipment();
        this.renderEquipment();
        this.attachEventListeners();
    }

    loadEquipment() {
        this.equipment = [
            { name: 'Treadmills', count: 12, type: 'cardio' },
            { name: 'Free Weights', count: 50, type: 'strength' },
            { name: 'Cable Machines', count: 8, type: 'functional' },
            { name: 'Rowing Machines', count: 6, type: 'cardio' }
        ];
    }

    renderEquipment() {
        // Render equipment showcase
    }

    attachEventListeners() {
        // Equipment showcase interactions
    }
}

// Virtual tour functionality (if virtual tour is added)
class VirtualTour {
    constructor(container) {
        this.container = container;
        this.currentRoom = 'main-gym';
        this.rooms = {};
        this.init();
    }

    init() {
        this.loadRooms();
        this.renderTour();
    }

    loadRooms() {
        this.rooms = {
            'main-gym': {
                name: 'Main Gym Floor',
                description: 'State-of-the-art equipment and spacious workout area'
            },
            'ladies-section': {
                name: 'Ladies Section',
                description: 'Private workout area exclusively for women'
            },
            'group-class-room': {
                name: 'Group Class Studio',
                description: 'Dedicated space for group fitness classes'
            },
            'recovery-room': {
                name: 'Recovery Center',
                description: 'Relaxation and recovery therapy area'
            }
        };
    }

    renderTour() {
        // Render virtual tour interface
    }

    switchRoom(roomId) {
        this.currentRoom = roomId;
        this.renderTour();
    }
}

// Performance optimization - improved for mobile
function optimizePerformance() {
    // Debounce scroll events with better mobile handling
    let scrollTimer;
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(() => {
                // Handle scroll events here
                isScrolling = false;
            });
        }
    }, { passive: true });

    // Preload critical images
    const criticalImages = [
        // Add image URLs that need to be preloaded
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Improve touch scrolling on mobile
    if ('ontouchstart' in window) {
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.overflowScrolling = 'touch';
    }
}

// Call the function
optimizePerformance();

// Add mobile-specific scroll handling
function initializeMobileScrollFix() {
    // Prevent iOS bounce scroll interference
    document.addEventListener('touchmove', function(e) {
        // Only prevent default if we're not in a scrollable container
        const target = e.target;
        const scrollableParent = target.closest('.nav-menu, .modal, textarea, input');
        
        if (!scrollableParent && document.body.style.overflow === 'hidden') {
            e.preventDefault();
        }
    }, { passive: false });

    // Fix for mobile viewport height
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
}

// Responsive Breakpoint Manager
class ResponsiveManager {
    constructor() {
        this.breakpoints = {
            mobile: '(max-width: 768px)',
            tablet: '(min-width: 769px) and (max-width: 1024px)',
            desktop: '(min-width: 1025px)',
            small: '(max-width: 480px)',
            large: '(min-width: 1200px)'
        };
        this.mediaQueries = {};
        this.init();
    }

    init() {
        // Create media query objects
        Object.keys(this.breakpoints).forEach(key => {
            this.mediaQueries[key] = window.matchMedia(this.breakpoints[key]);
            this.mediaQueries[key].addEventListener('change', () => this.handleBreakpointChange(key));
        });

        // Initial setup
        this.setupResponsiveComponents();
        this.handleInitialBreakpoint();
    }

    handleBreakpointChange(breakpoint) {
        if (this.mediaQueries[breakpoint].matches) {
            this.applyBreakpointStyles(breakpoint);
        }
    }

    handleInitialBreakpoint() {
        Object.keys(this.mediaQueries).forEach(key => {
            if (this.mediaQueries[key].matches) {
                this.applyBreakpointStyles(key);
            }
        });
    }

    applyBreakpointStyles(breakpoint) {
        document.body.classList.remove('mobile', 'tablet', 'desktop', 'small', 'large');
        document.body.classList.add(breakpoint);

        // Apply specific responsive behaviors
        switch(breakpoint) {
            case 'mobile':
                this.optimizeForMobile();
                break;
            case 'tablet':
                this.optimizeForTablet();
                break;
            case 'desktop':
                this.optimizeForDesktop();
                break;
        }
    }

    optimizeForMobile() {
        // Mobile-specific optimizations
        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            heroStats.style.flexDirection = 'row';
            heroStats.style.justifyContent = 'space-around';
        }

        // Adjust video containers for mobile
        const videoContainers = document.querySelectorAll('.workout-gif-container');
        videoContainers.forEach(container => {
            container.style.width = 'min(300px, 90vw)';
            container.style.height = 'auto';
        });
    }

    optimizeForTablet() {
        // Tablet-specific optimizations
        const servicesGrid = document.querySelector('.services-grid');
        if (servicesGrid) {
            servicesGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        }
    }

    optimizeForDesktop() {
        // Desktop-specific optimizations
        const workoutGrid = document.querySelector('.workout-gifs-grid');
        if (workoutGrid) {
            workoutGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
    }

    setupResponsiveComponents() {
        // Setup responsive navigation
        this.setupResponsiveNavigation();
        
        // Setup responsive forms
        this.setupResponsiveForms();
        
        // Setup responsive videos
        this.setupResponsiveVideos();
    }

    setupResponsiveNavigation() {
        const nav = document.querySelector('.nav-container');
        if (nav) {
            // Add responsive navigation behaviors
            nav.style.padding = 'clamp(0.75rem, 2vw, 2rem)';
        }
    }

    setupResponsiveForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.width = '100%';
            form.style.maxWidth = 'min(500px, 95vw)';
        });
    }

    setupResponsiveVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.style.width = '100%';
            video.style.height = 'auto';
        });
    }

    // Utility method to check current breakpoint
    getCurrentBreakpoint() {
        for (const [key, query] of Object.entries(this.mediaQueries)) {
            if (query.matches) {
                return key;
            }
        }
        return 'desktop';
    }

    // Method to apply responsive spacing
    applyResponsiveSpacing(element, property = 'padding') {
        if (element) {
            element.style[property] = 'clamp(1rem, 3vw, 3rem)';
        }
    }
}

// Enhanced viewport height handling for mobile browsers
function setResponsiveViewport() {
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Also set viewport width for responsive calculations
        const vw = window.innerWidth * 0.01;
        document.documentElement.style.setProperty('--vw', `${vw}px`);
    };

    setVH();
    
    // Debounced resize handler for better performance
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setVH, 100);
    });
    
    window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 500); // Delay for orientation change
    });
}

// Touch-friendly interaction improvements
function enhanceTouchInteractions() {
    // Improve touch targets
    const interactiveElements = document.querySelectorAll('button, .btn, .nav-link, .trainer-card, .service-card');
    
    interactiveElements.forEach(element => {
        element.style.minHeight = '44px';
        element.style.minWidth = '44px';
        
        // Add touch feedback
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });
}

// Initialize responsive features
const responsiveManager = new ResponsiveManager();
setResponsiveViewport();
enhanceTouchInteractions();

// Initialize performance optimizations
optimizePerformance();

// Accessibility improvements
function enhanceAccessibility() {
    // Keyboard navigation for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Focus management
    const focusableElements = document.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );

    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;

    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Initialize accessibility enhancements
enhanceAccessibility();

// Analytics and tracking (placeholder)
function initializeAnalytics() {
    // Track page views
    console.log('Page view tracked');

    // Track form submissions
    document.addEventListener('submit', (e) => {
        console.log('Form submission tracked:', e.target.id);
    });

    // Track button clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn')) {
            console.log('Button click tracked:', e.target.textContent);
        }
    });
}

// Initialize analytics
initializeAnalytics();

// Service Worker registration (for PWA if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

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

// Enhanced form validation
function enhanceFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });

        form.addEventListener('submit', (e) => {
            let isValid = true;
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                e.preventDefault();
                const firstError = form.querySelector('.field-error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    clearFieldError(field);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
        isValid = false;
    }

    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            errorMessage = 'Please enter a valid phone number';
            isValid = false;
        }
    }

    // Date validation (not in the past)
    if (field.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            errorMessage = 'Please select a future date';
            isValid = false;
        }
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('field-error');

    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: var(--danger-color);
        font-size: 0.8rem;
        display: block;
        margin-top: 0.25rem;
        margin-left: 1rem;
    `;

    field.parentElement.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('field-error');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Improved accessibility for keyboard navigation
function enhanceKeyboardNavigation() {
    // Tab trap for modals
    const modal = document.getElementById('successModal');
    if (modal) {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable?.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable?.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // Focus management for mobile menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            setTimeout(() => {
                if (navMenu.classList.contains('active')) {
                    const firstNavLink = navMenu.querySelector('.nav-link');
                    if (firstNavLink) {
                        firstNavLink.focus();
                    }
                }
            }, 100);
        });
    }
}

// Auto-play videos function - optimized
function initializeAutoplayVideos() {
    // Play hero videos - seamless synchronization
    const heroVideos = document.querySelectorAll('.hero-video');
    heroVideos.forEach((video, index) => {
        if (!video) return;

        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.loop = true;
        video.preload = 'auto';

        const playVideo = () => {
            video.currentTime = 0;
            video.play().catch(e => {
                console.log(`Hero video ${index + 1} autoplay prevented by browser policy`);
            });
        };

        if (video.readyState >= 2) {
            playVideo();
        } else {
            video.addEventListener('loadeddata', playVideo, { once: true });
        }
    });

    // Media section videos - disable autoplay, show controls
    const mediaVideos = document.querySelectorAll('#media .gym-video');
    mediaVideos.forEach((video, index) => {
        if (!video) return;

        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.autoplay = false; // Disable autoplay
        video.preload = 'metadata';
        video.removeAttribute('autoplay'); // Remove autoplay attribute

        // Ensure overlay and play button are visible
        const overlay = video.closest('.video-container')?.querySelector('.video-overlay');
        if (overlay) {
            overlay.style.display = 'flex'; // Show play button overlay
            overlay.classList.remove('playing'); // Ensure overlay is visible
        }
    });
}

// Initialize all components when DOM is loaded - optimized
document.addEventListener('DOMContentLoaded', () => {
    console.log('New Lifestyle Gym website loaded successfully!');

    try {
        // Check for success messages first
        checkForSuccessMessage();

        // Initialize mobile scroll fixes first
        initializeMobileScrollFix();

        // Initialize safe event listeners first
        initializeSafeEventListeners();

        // Set minimum date for demo booking to today
        const dateInput = document.getElementById('preferredDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }

        // Initialize autoplay videos immediately for seamless playback
        initializeAutoplayVideos();

        // Initialize video players with delay for better performance
        requestAnimationFrame(() => {
            initializeVideoPlayers();
        });

        // Enhance form validation
        enhanceFormValidation();

        // Enhance keyboard navigation
        enhanceKeyboardNavigation();

    } catch (error) {
        console.warn('Non-critical initialization error:', error);
    }
});
