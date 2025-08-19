// Text Recognition CAPTCHA
class SimpleCaptcha {
    constructor(containerId, formId) {
        this.container = document.getElementById(containerId);
        this.formId = formId;
        this.challengeContainer = document.getElementById(containerId + 'Challenge');
        this.isVerified = false;
        this.attempts = 0;
        this.maxAttempts = 3;
        this.currentText = '';
        this.canvas = null;
        this.ctx = null;

        this.init();
    }

    init() {
        this.generateChallenge();
        this.setupEventListeners();
    }

    generateChallenge() {
        // Generate random text (mix of letters and numbers)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        this.currentText = '';
        for(let i = 0; i < 6; i++) {
            this.currentText += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const html = `
            <div class="text-challenge">
                <div class="captcha-instruction">
                    <i class="fas fa-keyboard"></i>
                    Type the text you see in the image below
                </div>
                <div class="captcha-canvas-container">
                    <canvas class="captcha-canvas" width="300" height="100" id="${this.container.id}Canvas"></canvas>
                </div>
                <div class="captcha-input-container">
                    <input type="text" class="captcha-input" placeholder="Enter the text above" maxlength="6" autocomplete="off" id="${this.container.id}Input">
                </div>
                <div class="captcha-controls">
                    <button type="button" class="captcha-verify">Verify Text</button>
                    <button type="button" class="captcha-refresh">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="captcha-attempts">Attempts remaining: ${this.maxAttempts - this.attempts}</div>
            </div>
        `;

        this.challengeContainer.innerHTML = html;
        this.setupTextChallengeEvents();
        this.drawCaptchaText();
        this.updateSubmitButton(false);
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
                this.generateChallenge();
            }
        });
    }

    setupTextChallengeEvents() {
        const input = this.challengeContainer.querySelector('.captcha-input');
        if(input) {
            // Allow Enter key to verify
            input.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') {
                    this.verifyChallenge();
                }
            });

            // Auto-verify when user types 6 characters
            input.addEventListener('input', (e) => {
                if(e.target.value.length === 6) {
                    setTimeout(() => this.verifyChallenge(), 500);
                }
            });
        }
    }

    drawCaptchaText() {
        this.canvas = this.challengeContainer.querySelector('.captcha-canvas');
        if(!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Set background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(0.5, '#e9ecef');
        gradient.addColorStop(1, '#dee2e6');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add noise lines
        this.ctx.strokeStyle = 'rgba(108, 117, 125, 0.3)';
        this.ctx.lineWidth = 1;
        for(let i = 0; i < 8; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            this.ctx.lineTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            this.ctx.stroke();
        }

        // Add noise dots
        this.ctx.fillStyle = 'rgba(108, 117, 125, 0.4)';
        for(let i = 0; i < 50; i++) {
            this.ctx.beginPath();
            this.ctx.arc(Math.random() * this.canvas.width, Math.random() * this.canvas.height, 1, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        // Draw text with distortion
        const colors = ['#ff6b35', '#28a745', '#007bff', '#6f42c1', '#fd7e14'];
        const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Verdana'];

        for(let i = 0; i < this.currentText.length; i++) {
            const char = this.currentText[i];
            const x = 20 + (i * 45) + (Math.random() - 0.5) * 10;
            const y = 60 + (Math.random() - 0.5) * 15;
            const rotation = (Math.random() - 0.5) * 0.5;
            const fontSize = 28 + Math.random() * 8;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const font = fonts[Math.floor(Math.random() * fonts.length)];

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rotation);
            this.ctx.font = `bold ${fontSize}px ${font}`;
            this.ctx.fillStyle = color;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(char, 0, 0);

            // Add shadow effect
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillText(char, 2, 2);

            this.ctx.restore();
        }

        // Add wave distortion effect
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = 'rgba(255, 107, 53, 0.1)';
        this.ctx.lineWidth = 2;
        for(let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            for(let x = 0; x < this.canvas.width; x += 2) {
                const y = this.canvas.height / 2 + Math.sin(x * 0.02 + i) * 15;
                if(x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        }
    }

    verifyChallenge() {
        const input = this.challengeContainer.querySelector('.captcha-input');
        if(!input) return;

        const userInput = input.value.trim();
        const isCorrect = userInput.toLowerCase() === this.currentText.toLowerCase();

        if(isCorrect) {
            this.handleSuccess();
        } else {
            this.handleFailure();
        }
    }

    handleSuccess() {
        this.isVerified = true;
        this.container.classList.add('captcha-success');
        this.challengeContainer.innerHTML = `
            <div class="captcha-success-message">
                <i class="fas fa-check-circle"></i>
                Verification successful! You may now submit the form.
            </div>
        `;
        this.updateSubmitButton(true);
    }

    handleFailure() {
        this.attempts++;
        this.container.classList.add('captcha-error');

        setTimeout(() => {
            this.container.classList.remove('captcha-error');
        }, 500);

        if(this.attempts >= this.maxAttempts) {
            this.challengeContainer.innerHTML = `
                <div class="captcha-error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    Too many failed attempts. Please refresh the page and try again.
                </div>
            `;
            this.updateSubmitButton(false);
        } else {
            // Show error message briefly then regenerate
            const errorMessage = `
                <div class="captcha-error-message">
                    <i class="fas fa-times-circle"></i>
                    Incorrect selection. ${this.maxAttempts - this.attempts} attempts remaining.
                </div>
            `;
            this.challengeContainer.insertAdjacentHTML('afterbegin', errorMessage);

            setTimeout(() => {
                this.generateChallenge();
            }, 2000);
        }
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
        this.selectedImages = [];
        this.container.classList.remove('captcha-success', 'captcha-error');
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

    // Mobile menu toggle with better mobile handling
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');

            // Enhanced body scroll prevention
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
                document.body.style.top = `-${window.scrollY}px`;
            } else {
                const scrollY = document.body.style.top;
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                const scrollY = document.body.style.top;
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }
            }
        });

        // Enhanced touch handling for mobile
        document.addEventListener('touchstart', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                const scrollY = document.body.style.top;
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }
            }
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
            const scrollY = document.body.style.top;
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.top = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        });
    });
}

// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.querySelector('.Navbar').offsetHeight;
        const targetPosition = section.offsetTop - navHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
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

// Form handling with enhanced FormSubmit integration
let demoCaptcha, contactCaptcha, formSecurity;

// Initialize security and CAPTCHA systems
function initializeFormSecurity() {
    // Initialize form security
    formSecurity = new FormSecurity();

    // Initialize simple CAPTCHA systems
    demoCaptcha = new SimpleCaptcha('demoCaptcha', 'demo');
    contactCaptcha = new SimpleCaptcha('contactCaptcha', 'contact');
}

// Enhanced FormSubmit handler
async function submitFormWithFormSubmit(form, formType) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    try {
        // Show loading state
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${formType === 'demo' ? 'Booking Demo...' : 'Sending Message...'}`;
        submitBtn.disabled = true;

        // Create FormData
        const formData = new FormData(form);

        // Submit to FormSubmit
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
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

        } else {
            throw new Error('Form submission failed');
        }

    } catch (error) {
        console.error('Form submission error:', error);
        showErrorFeedback(formType, 'There was an error submitting your form. Please try again or contact us directly.');
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
