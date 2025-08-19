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

// Form handling with simple CAPTCHA
let demoCaptcha, contactCaptcha, formSecurity;

// Initialize security and CAPTCHA systems
function initializeFormSecurity() {
    // Initialize form security
    formSecurity = new FormSecurity();
    
    // Initialize simple CAPTCHA systems
    demoCaptcha = new SimpleCaptcha('demoCaptcha', 'demo');
    contactCaptcha = new SimpleCaptcha('contactCaptcha', 'contact');
}

// Enhanced form submission handlers
const demoForm = document.getElementById('demoForm');
const contactForm = document.getElementById('contactForm');
const modal = document.getElementById('successModal');

if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default submission
        
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

        // Show loading state
        const submitBtn = document.getElementById('demoSubmitBtn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking Demo...';
            submitBtn.disabled = true;
        }
        
        // Submit form data to FormSubmit
        const formData = new FormData(demoForm);
        
        // Submit normally to FormSubmit (it will handle the redirect)
        demoForm.submit();
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default submission
        
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

        // Show loading state
        const submitBtn = document.getElementById('contactSubmitBtn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Message...';
            submitBtn.disabled = true;
        }
        
        // Submit form data to FormSubmit
        const formData = new FormData(contactForm);
        
        // Submit normally to FormSubmit (it will handle the redirect)
        contactForm.submit();
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

        // Set safe area insets for newer mobile devices
        document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
        document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
        document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');
        
        // Add device pixel ratio for high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        document.documentElement.style.setProperty('--device-pixel-ratio', dpr);
    };

    setVH();

    // Debounced resize handler for better performance
    let resizeTimer;
    const debouncedResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setVH, 150);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });
    window.addEventListener('orientationchange', () => {
        // Longer delay for orientation change to ensure accurate measurements
        setTimeout(setVH, 600);
    }, { passive: true });

    // Handle mobile keyboard appearance
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', setVH, { passive: true });
    }
    
    // Handle page visibility changes for better mobile performance
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(setVH, 100);
        }
    });
}

// Enhanced touch-friendly interaction improvements
function enhanceTouchInteractions() {
    // Improve touch targets with better size requirements
    const interactiveElements = document.querySelectorAll('button, .btn, .nav-link, .trainer-card, .service-card, .plan-card, .contact-card');

    interactiveElements.forEach(element => {
        // Ensure minimum touch target size (48x48px for accessibility)
        element.style.minHeight = '48px';
        element.style.minWidth = '48px';
        
        // Add enhanced touch feedback with haptics
        let touchStartTime = 0;
        
        element.addEventListener('touchstart', function(e) {
            touchStartTime = Date.now();
            this.style.transform = 'scale(0.96)';
            this.style.transition = 'transform 0.1s ease-out';
            
            // Add haptic feedback if supported
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
            
            // Add visual feedback
            this.classList.add('touch-active');
        }, { passive: true });

        element.addEventListener('touchend', function(e) {
            const touchDuration = Date.now() - touchStartTime;
            
            // Smooth transition back
            this.style.transform = 'scale(1)';
            this.style.transition = 'transform 0.2s ease-out';
            
            // Remove visual feedback after a delay
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 200);
        }, { passive: true });
        
        element.addEventListener('touchcancel', function() {
            this.style.transform = 'scale(1)';
            this.classList.remove('touch-active');
        }, { passive: true });
    });
    
    // Add advanced gesture support for cards
    addAdvancedGestureSupport();
}

// Advanced gesture support for mobile
function addAdvancedGestureSupport() {
    const cards = document.querySelectorAll('.service-card, .trainer-card, .plan-card, .video-card');
    
    cards.forEach(card => {
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let isScrolling = false;
        
        card.addEventListener('touchstart', function(e) {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startTime = Date.now();
                isScrolling = false;
            }
        }, { passive: true });
        
        card.addEventListener('touchmove', function(e) {
            if (e.touches.length === 1 && !isScrolling) {
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const deltaX = currentX - startX;
                const deltaY = currentY - startY;
                
                // Determine if user is scrolling vertically
                if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
                    isScrolling = true;
                    return;
                }
                
                // Add subtle parallax effect for horizontal movement
                if (Math.abs(deltaX) > 5 && !isScrolling) {
                    const translateX = deltaX * 0.1;
                    this.style.transform = `translateX(${translateX}px) scale(1.02)`;
                    this.style.transition = 'none';
                }
            }
        }, { passive: true });
        
        card.addEventListener('touchend', function(e) {
            const endTime = Date.now();
            const touchDuration = endTime - startTime;
            
            // Reset transform
            this.style.transform = '';
            this.style.transition = 'transform 0.3s ease-out';
            
            // Handle quick tap (less than 300ms)
            if (touchDuration < 300 && !isScrolling) {
                // Add quick tap animation
                this.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
            
            startX = 0;
            startY = 0;
            startTime = 0;
            isScrolling = false;
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
    // Play hero background video
    const heroVideo = document.querySelector('.hero-background-video');
    if (heroVideo) {
        // Remove any existing controls
        heroVideo.removeAttribute('controls');
        heroVideo.controls = false;
        
        // Set all required attributes for background video
        heroVideo.muted = true;
        heroVideo.playsInline = true;
        heroVideo.autoplay = true;
        heroVideo.loop = true;
        heroVideo.preload = 'auto';
        
        // Additional mobile-specific attributes
        heroVideo.setAttribute('playsinline', '');
        heroVideo.setAttribute('webkit-playsinline', '');
        heroVideo.setAttribute('disableremoteplayback', '');
        heroVideo.setAttribute('disablepictureinpicture', '');
        
        // Ensure no controls are shown
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
        
        // Prevent context menu on video
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
        // Always scroll to top first to ensure page loads at hero section
        window.scrollTo(0, 0);

        // Check for success messages first
        checkForSuccessMessage();

        // Initialize mobile scroll fixes first
        initializeMobileScrollFix();

        // Initialize safe event listeners first
        initializeSafeEventListeners();

        // Initialize form security and CAPTCHA systems
        initializeFormSecurity();

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

        // Add mobile-specific enhancements
        if (window.innerWidth <= 768) {
            enhanceMobileFormExperience();
            optimizeMobileScrolling();
            improveMobileTouchInteractions();
            optimizeMobilePerformance();
        }

        // Add touch gesture support for all screen sizes
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            improveMobileTouchInteractions();
        }

    } catch (error) {
        console.warn('Non-critical initialization error:', error);
    }
});

// Mobile form experience enhancements
function enhanceMobileFormExperience() {
    // Add touch-friendly improvements for mobile
    const formInputs = document.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
        // Increase touch target size on mobile
        input.style.minHeight = '48px';
        input.style.fontSize = '16px'; // Prevents zoom on iOS
        
        // Add better focus handling with top scroll
        input.addEventListener('focus', () => {
            // Prevent auto-scroll to form field, keep at top
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 200);
            }
        });
        
        // Enhanced validation feedback for mobile
        input.addEventListener('blur', () => {
            if (input.validity && !input.validity.valid) {
                input.style.borderColor = '#dc3545';
                input.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.2)';
            }
        });
    });
    
    // Improve CAPTCHA touch experience
    const captchaContainers = document.querySelectorAll('.advanced-captcha-container');
    captchaContainers.forEach(container => {
        container.style.padding = '1.5rem';
        container.style.marginBottom = '2rem';
        container.style.borderRadius = '12px';
        container.style.touchAction = 'manipulation';
    });
    
    // Add honeypot fields for enhanced security
    addHoneypotSecurity();
}

// Enhanced security with honeypot fields
function addHoneypotSecurity() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Add honeypot field
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.cssText = 'position: absolute; left: -9999px; opacity: 0; pointer-events: none;';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        form.appendChild(honeypot);
        
        // Add another honeypot
        const honeypot2 = document.createElement('input');
        honeypot2.type = 'email';
        honeypot2.name = 'confirm_email';
        honeypot2.style.cssText = 'position: absolute; left: -9999px; opacity: 0; pointer-events: none;';
        honeypot2.tabIndex = -1;
        honeypot2.autocomplete = 'off';
        form.appendChild(honeypot2);
    });
}

// Optimize mobile scrolling performance
function optimizeMobileScrolling() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.Navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Optimize scroll events for mobile
    let ticking = false;
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                // Handle scroll-based animations here
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Improve mobile touch interactions
function improveMobileTouchInteractions() {
    // Add haptic feedback for buttons (if supported)
    const buttons = document.querySelectorAll('button, .btn, .nav-link');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.1s ease';
            
            // Haptic feedback if supported
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        }, { passive: true });

        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });

        button.addEventListener('touchcancel', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });

    // Improve swipe gestures for cards
    const cards = document.querySelectorAll('.service-card, .trainer-card, .plan-card');
    cards.forEach(card => {
        let startX = 0;
        let startY = 0;

        card.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        card.addEventListener('touchmove', function(e) {
            if (!startX || !startY) return;

            const xDiff = startX - e.touches[0].clientX;
            const yDiff = startY - e.touches[0].clientY;

            // Add slight parallax effect
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                const translateX = -xDiff * 0.1;
                this.style.transform = `translateX(${translateX}px)`;
            }
        }, { passive: true });

        card.addEventListener('touchend', function() {
            this.style.transform = '';
            startX = 0;
            startY = 0;
        }, { passive: true });
    });
}

// Comprehensive mobile performance optimization
function optimizeMobilePerformance() {
    // Enhanced lazy loading with intersection observer
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                }
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px',
        threshold: 0.1
    });

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
        img.classList.add('lazy-load');
        imageObserver.observe(img);
    });

    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition', 'none');
        document.querySelectorAll('*').forEach(el => {
            el.style.animationDuration = '0.01ms';
            el.style.animationIterationCount = '1';
            el.style.transitionDuration = '0.01ms';
        });
    }

    // Enhanced mobile video optimization
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        if (window.innerWidth <= 768) {
            video.preload = 'metadata';
            video.setAttribute('playsinline', '');
            video.muted = true; // Ensure autoplay works on mobile
            
            // Add mobile video optimization attributes
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('controls', false);
            
            // Optimize video for mobile performance
            video.style.willChange = 'transform';
            video.style.backfaceVisibility = 'hidden';
        }
    });
    
    // Mobile-specific optimizations
    optimizeMobileScrolling();
    optimizeMobileRendering();
    optimizeMobileMemory();
}

// Optimize mobile scrolling performance
function optimizeMobileScrolling() {
    // Throttle scroll events for better performance
    let scrollTimer = null;
    let isScrolling = false;
    
    const handleScroll = () => {
        if (!isScrolling) {
            requestAnimationFrame(() => {
                // Perform scroll-based operations here
                updateScrollIndicators();
                isScrolling = false;
            });
            isScrolling = true;
        }
    };
    
    window.addEventListener('scroll', handleScroll, { 
        passive: true,
        capture: false 
    });
    
    // Optimize touch scrolling
    if ('ontouchstart' in window) {
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.overscrollBehavior = 'contain';
    }
}

// Optimize mobile rendering
function optimizeMobileRendering() {
    // Use will-change property for animated elements
    const animatedElements = document.querySelectorAll(
        '.hero-title, .service-card, .trainer-card, .plan-card, .btn'
    );
    
    animatedElements.forEach(el => {
        el.style.willChange = 'transform, opacity';
    });
    
    // Optimize images for mobile
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.imageRendering = 'auto';
        img.loading = 'lazy';
        
        // Add intersection observer for performance
        if ('IntersectionObserver' in window) {
            const imgObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.willChange = 'auto';
                    }
                });
            });
            imgObserver.observe(img);
        }
    });
}

// Optimize mobile memory usage
function optimizeMobileMemory() {
    // Clean up unused event listeners on mobile
    if (window.innerWidth <= 768) {
        // Disable non-essential animations on mobile
        const heavyAnimations = document.querySelectorAll('.floating-card');
        heavyAnimations.forEach(el => {
            el.style.animation = 'none';
            el.style.transform = 'none';
        });
        
        // Optimize intersection observers for mobile
        const observerOptions = {
            rootMargin: '20px',
            threshold: 0.1
        };
        
        // Use single observer for all animated elements
        const mobileAnimationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('mobile-visible');
                } else {
                    entry.target.classList.remove('mobile-visible');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.about-card, .service-card, .trainer-card').forEach(el => {
            mobileAnimationObserver.observe(el);
        });
    }
}

// Update scroll indicators for mobile
function updateScrollIndicators() {
    const scrollProgress = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
    
    // Update any scroll progress indicators
    const progressElements = document.querySelectorAll('.scroll-progress');
    progressElements.forEach(el => {
        el.style.width = `${scrollProgress * 100}%`;
    });
}
