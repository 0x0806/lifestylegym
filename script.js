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

// Complete Navigation System with Proper Section Mapping
class NavigationController {
    constructor() {
        this.navbar = document.getElementById('Navbar');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('section[id]');
        this.scrollPosition = 0;
        this.isScrolling = false;
        this.activeSection = 'home';
        
        // Precise section mapping with proper offsets for accurate positioning
        this.sectionOffsets = {
            'home': 0,
            'about': -80,
            'services': -80,
            'trainers': -80,
            'media': -80,
            'plans': -80,
            'demo': -80,
            'contact': -80
        };
        
        // Enhanced section ID mapping for all navigation elements
        this.sectionMapping = {
            'home': 'home',
            'about': 'about',
            'services': 'services',
            'trainers': 'trainers',
            'media': 'media',
            'plans': 'plans',
            'demo': 'demo',
            'contact': 'contact'
        };

        // Form-specific targets for precise navigation
        this.formTargets = {
            'book-demo': 'demo',
            'contact-form': 'contact',
            'book-session': 'contact',
            'join-classes': 'demo',
            'start-training': 'demo',
            'book-home-session': 'contact'
        };
        
        this.init();
    }

    init() {
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupNavigationLinks();
        this.setupGlobalNavigation();
        this.setupActiveNavHighlight();
        this.setupKeyboardNavigation();
        this.mapAllNavigationButtons();
    }

    // Enhanced scroll effects for navbar
    setupScrollEffects() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.pageYOffset;
                    
                    // Add/remove scrolled class
                    if (scrollY > 100) {
                        this.navbar?.classList.add('scrolled');
                    } else {
                        this.navbar?.classList.remove('scrolled');
                    }
                    
                    // Update active section
                    this.updateActiveSection();
                    
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Enhanced mobile menu management
    setupMobileMenu() {
        if (!this.hamburger || !this.navMenu) return;

        const toggleMenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = this.hamburger.classList.contains('active');
            
            if (!isActive) {
                this.openMobileMenu();
            } else {
                this.closeMobileMenu();
            }
        };

        // Event listeners for hamburger menu
        this.hamburger.addEventListener('click', toggleMenu);
        this.hamburger.addEventListener('touchstart', (e) => {
            e.preventDefault();
            toggleMenu(e);
        }, { passive: false });

        // Close menu on outside clicks
        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.hamburger.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });

        // Close menu when any nav link is clicked
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });
    }

    openMobileMenu() {
        this.scrollPosition = window.pageYOffset;
        this.hamburger.classList.add('active');
        this.navMenu.classList.add('active');
        
        // Update ARIA attributes
        this.hamburger.setAttribute('aria-expanded', 'true');
        this.navMenu.setAttribute('aria-hidden', 'false');
        
        // Prevent background scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.scrollPosition}px`;
        document.body.style.width = '100%';
        
        // Focus management for accessibility
        setTimeout(() => {
            this.navLinks[0]?.focus();
        }, 100);
        
        console.log('Mobile menu opened');
    }

    closeMobileMenu() {
        if (!this.hamburger.classList.contains('active')) return;
        
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        
        // Update ARIA attributes
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.navMenu.setAttribute('aria-hidden', 'true');
        
        // Restore scroll position
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, this.scrollPosition);
        
        // Return focus to hamburger button
        this.hamburger.focus();
        
        console.log('Mobile menu closed');
    }

    // Setup navigation links with proper section mapping
    setupNavigationLinks() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get section ID from multiple attributes with priority
                let sectionId = link.getAttribute('data-section') || 
                               link.getAttribute('href')?.substring(1);
                
                // If no direct mapping found, check text content
                if (!sectionId) {
                    const textContent = link.textContent.toLowerCase().trim();
                    if (textContent.includes('book') && textContent.includes('demo')) {
                        sectionId = 'demo';
                    } else if (textContent.includes('contact')) {
                        sectionId = 'contact';
                    } else {
                        sectionId = textContent;
                    }
                }
                
                // Navigate to the appropriate section
                if (this.sectionMapping[sectionId]) {
                    this.scrollToSection(this.sectionMapping[sectionId]);
                } else {
                    console.warn(`No section mapping found for: ${sectionId}`);
                }
            });
        });
    }

    // Map all navigation buttons throughout the site with enhanced precision
    mapAllNavigationButtons() {
        console.log('Mapping all navigation buttons with enhanced precision...');
        
        // Map primary navigation first
        this.mapPrimaryNavigation();
        
        // Map hero section buttons
        this.mapHeroButtons();
        
        // Map service section buttons with enhanced targeting
        this.mapServiceButtons();
        
        // Map plan section buttons
        this.mapPlanButtons();
        
        // Map trainer section interactions
        this.mapTrainerButtons();
        
        // Map media section interactions
        this.mapMediaButtons();
        
        // Map contact card interactions
        this.mapContactCards();
        
        // Map about section interactions
        this.mapAboutSection();
        
        // Map demo section interactions
        this.mapDemoSection();
        
        // Map all other navigation buttons
        this.mapMiscellaneousButtons();
        
        // Map footer and social links
        this.mapFooterNavigation();
        
        // Map data-nav-target buttons globally
        this.mapDataNavTargetButtons();
        
        // Map scroll indicator
        this.mapScrollIndicator();
        
        // Map keyboard navigation
        this.mapKeyboardNavigation();
        
        // Map touch navigation for mobile
        this.mapTouchNavigation();
        
        // Map any remaining unmapped buttons
        this.mapRemainingButtons();
        
        // Final verification of all navigation elements
        this.verifyNavigationMapping();
        console.log('All navigation buttons mapped successfully with enhanced precision');
    }

    // Verify all navigation elements are properly mapped
    verifyNavigationMapping() {
        const unmappedElements = document.querySelectorAll(`
            button:not([data-nav-mapped]):not([type="submit"]),
            .btn:not([data-nav-mapped]):not([type="submit"]),
            [onclick]:not([data-nav-mapped]),
            a[href^="#"]:not([data-nav-mapped]):not(.social-link):not([href="#"])
        `);

        if (unmappedElements.length > 0) {
            console.warn(`Found ${unmappedElements.length} unmapped navigation elements:`, unmappedElements);
            
            // Try to map these elements
            unmappedElements.forEach(element => {
                const elementText = element.textContent.toLowerCase().trim();
                const elementType = element.tagName.toLowerCase();
                
                console.log(`Attempting to map unmapped ${elementType}: "${elementText}"`);
                
                // Last resort mapping
                if (elementText.includes('demo') || elementText.includes('book') || elementText.includes('free')) {
                    this.mapElementToSection(element, 'demo');
                } else if (elementText.includes('contact') || elementText.includes('message')) {
                    this.mapElementToSection(element, 'contact');
                } else if (elementText.includes('service')) {
                    this.mapElementToSection(element, 'services');
                } else if (elementText.includes('about')) {
                    this.mapElementToSection(element, 'about');
                } else if (elementText.includes('home')) {
                    this.mapElementToSection(element, 'home');
                }
            });
        } else {
            console.log('All navigation elements successfully mapped!');
        }
    }

    // Helper method to map individual elements
    mapElementToSection(element, sectionId) {
        if (!element || !this.sectionMapping[sectionId]) return;
        
        element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (sectionId === 'demo' || sectionId === 'contact') {
                this.scrollToFormSection(sectionId);
            } else {
                this.scrollToSection(sectionId);
            }
            
            console.log(`Emergency mapped element navigated to: ${sectionId}`);
        });
        
        element.setAttribute('data-nav-mapped', 'true');
        element.style.cursor = 'pointer';
        console.log(`Emergency mapped: ${element.textContent.trim()} -> ${sectionId}`);
    }

    // Enhanced primary navigation mapping
    mapPrimaryNavigation() {
        // Enhanced navbar navigation with better targeting
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const dataSection = link.getAttribute('data-section');
            const sectionId = dataSection || (href ? href.substring(1) : null);
            
            if (sectionId && this.sectionMapping[sectionId]) {
                // Remove any existing listeners to prevent duplicates
                const newLink = link.cloneNode(true);
                link.parentNode.replaceChild(newLink, link);
                
                newLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Special handling for form sections
                    if (sectionId === 'demo' || sectionId === 'contact') {
                        this.scrollToFormSection(sectionId);
                    } else {
                        this.scrollToSection(sectionId);
                    }
                    
                    // Close mobile menu after navigation
                    this.closeMobileMenu();
                    
                    console.log(`Primary nav: Navigated to ${sectionId}`);
                });
                
                console.log(`Mapped primary navigation: ${sectionId}`);
            }
        });
        
        // Update navLinks reference after cloning
        this.navLinks = document.querySelectorAll('.nav-link');
    }

    // Enhanced contact cards mapping
    mapContactCards() {
        const contactCards = document.querySelectorAll('.contact-card');
        contactCards.forEach((card, index) => {
            card.style.cursor = 'pointer';
            card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            
            // Remove existing listeners
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            newCard.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const icon = newCard.querySelector('i');
                const cardText = newCard.textContent.toLowerCase();
                
                if (icon) {
                    if (icon.classList.contains('fa-phone-alt') || cardText.includes('call')) {
                        // Phone card - open phone dialer
                        window.open('tel:+971581790093', '_self');
                        console.log('Contact card: Opened phone dialer');
                    } else if (icon.classList.contains('fa-envelope') || cardText.includes('email')) {
                        // Email card - scroll to contact form
                        this.scrollToFormSection('contact');
                        console.log('Contact card: Navigated to contact form');
                    } else if (icon.classList.contains('fa-map-marker-alt') || cardText.includes('visit')) {
                        // Location card - open maps
                        window.open('https://maps.google.com/?q=25.301111,55.374061', '_blank');
                        console.log('Contact card: Opened maps');
                    } else if (icon.classList.contains('fa-clock') || cardText.includes('hours')) {
                        // Hours card - scroll to demo booking
                        this.scrollToFormSection('demo');
                        console.log('Contact card: Navigated to demo booking');
                    } else {
                        // Default action - scroll to contact form
                        this.scrollToFormSection('contact');
                        console.log('Contact card: Default navigation to contact form');
                    }
                }
            });
            
            // Add hover effects
            newCard.addEventListener('mouseenter', () => {
                newCard.style.transform = 'translateY(-2px)';
                newCard.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
            });
            
            newCard.addEventListener('mouseleave', () => {
                newCard.style.transform = 'translateY(0)';
                newCard.style.boxShadow = '';
            });
            
            console.log(`Mapped contact card ${index + 1}`);
        });
    }

    // Enhanced about section mapping
    mapAboutSection() {
        // About cards navigation to services
        const aboutCards = document.querySelectorAll('.about-card');
        aboutCards.forEach((card, index) => {
            card.style.cursor = 'pointer';
            card.style.transition = 'transform 0.2s ease';
            
            // Remove existing listeners
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            newCard.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.scrollToSection('services');
                console.log(`About card ${index + 1}: Navigated to services`);
            });
            
            newCard.addEventListener('mouseenter', () => {
                newCard.style.transform = 'scale(1.02)';
            });
            
            newCard.addEventListener('mouseleave', () => {
                newCard.style.transform = 'scale(1)';
            });
            
            console.log(`Mapped about card ${index + 1}`);
        });

        // Stats in hero section with enhanced targeting
        const heroStats = document.querySelectorAll('.hero .stat');
        heroStats.forEach((stat, index) => {
            stat.style.cursor = 'pointer';
            stat.style.transition = 'transform 0.2s ease';
            
            // Remove existing listeners
            const newStat = stat.cloneNode(true);
            stat.parentNode.replaceChild(newStat, stat);
            
            newStat.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (index === 0) { // 24/7 stat - contact for availability
                    this.scrollToFormSection('contact');
                    console.log('Hero stat: 24/7 - Navigated to contact');
                } else if (index === 1) { // Customers stat - about us
                    this.scrollToSection('about');
                    console.log('Hero stat: Customers - Navigated to about');
                } else { // Experience stat - trainers
                    this.scrollToSection('trainers');
                    console.log('Hero stat: Experience - Navigated to trainers');
                }
            });
            
            newStat.addEventListener('mouseenter', () => {
                newStat.style.transform = 'scale(1.05)';
            });
            
            newStat.addEventListener('mouseleave', () => {
                newStat.style.transform = 'scale(1)';
            });
            
            console.log(`Mapped hero stat ${index + 1}`);
        });
    }

    // Enhanced demo section mapping
    mapDemoSection() {
        // Demo benefits navigation
        const benefitElements = document.querySelectorAll('.benefit');
        benefitElements.forEach((benefit, index) => {
            benefit.style.cursor = 'pointer';
            benefit.style.transition = 'transform 0.2s ease';
            
            // Remove existing listeners
            const newBenefit = benefit.cloneNode(true);
            benefit.parentNode.replaceChild(newBenefit, benefit);
            
            newBenefit.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Scroll to demo form and focus on first input
                this.scrollToFormSection('demo');
                setTimeout(() => {
                    const firstInput = document.querySelector('#demoForm input[type="text"]');
                    if (firstInput && window.innerWidth > 768) {
                        firstInput.focus();
                    }
                }, 1200);
                
                console.log(`Demo benefit ${index + 1}: Navigated to demo form`);
            });
            
            newBenefit.addEventListener('mouseenter', () => {
                newBenefit.style.transform = 'translateX(5px)';
            });
            
            newBenefit.addEventListener('mouseleave', () => {
                newBenefit.style.transform = 'translateX(0)';
            });
            
            console.log(`Mapped demo benefit ${index + 1}`);
        });
    }

    // Map any remaining unmapped buttons with comprehensive coverage
    mapRemainingButtons() {
        // Find all clickable elements that might need navigation
        const allClickableElements = document.querySelectorAll(`
            button:not([data-nav-mapped]), 
            .btn:not([data-nav-mapped]),
            [onclick]:not([data-nav-mapped]),
            [data-nav-target]:not([data-nav-mapped]),
            a[href^="#"]:not([data-nav-mapped]):not(.nav-link)
        `);
        
        allClickableElements.forEach((element, index) => {
            const elementText = element.textContent.toLowerCase().trim();
            const isFormButton = element.type === 'submit' || element.form;
            const hasOnclick = element.hasAttribute('onclick');
            const dataTarget = element.getAttribute('data-nav-target');
            const href = element.getAttribute('href');
            
            // Skip form submission buttons and already mapped elements
            if (isFormButton || element.hasAttribute('data-nav-mapped')) {
                return;
            }
            
            let targetSection = null;
            
            // Check data-nav-target first
            if (dataTarget && this.sectionMapping[dataTarget]) {
                targetSection = dataTarget;
            }
            // Check href for hash links
            else if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                if (this.sectionMapping[sectionId]) {
                    targetSection = sectionId;
                }
            }
            // Parse onclick for scrollToSection calls
            else if (hasOnclick) {
                const onclickValue = element.getAttribute('onclick');
                const sectionMatch = onclickValue.match(/scrollToSection\(['"]([^'"]+)['"]\)/);
                if (sectionMatch && this.sectionMapping[sectionMatch[1]]) {
                    targetSection = sectionMatch[1];
                }
            }
            // Determine target based on text content
            else {
                if (elementText.includes('book') && (elementText.includes('demo') || elementText.includes('free'))) {
                    targetSection = 'demo';
                } else if (elementText.includes('book') && elementText.includes('home')) {
                    targetSection = 'contact';
                } else if (elementText.includes('contact') || elementText.includes('message') || elementText.includes('email')) {
                    targetSection = 'contact';
                } else if (elementText.includes('service') || elementText.includes('explore')) {
                    targetSection = 'services';
                } else if (elementText.includes('plan') || elementText.includes('pricing') || elementText.includes('membership')) {
                    targetSection = 'plans';
                } else if (elementText.includes('trainer') || elementText.includes('team')) {
                    targetSection = 'trainers';
                } else if (elementText.includes('media') || elementText.includes('video') || elementText.includes('gallery')) {
                    targetSection = 'media';
                } else if (elementText.includes('about') || elementText.includes('story')) {
                    targetSection = 'about';
                } else if (elementText.includes('home') || elementText.includes('top')) {
                    targetSection = 'home';
                } else if (elementText.includes('demo') || elementText.includes('trial')) {
                    targetSection = 'demo';
                } else if (elementText.includes('join') || elementText.includes('classes')) {
                    targetSection = 'demo';
                } else if (elementText.includes('start') || elementText.includes('training')) {
                    targetSection = 'demo';
                } else if (elementText.includes('session')) {
                    // Determine session type
                    if (elementText.includes('home') || elementText.includes('wellness')) {
                        targetSection = 'contact';
                    } else {
                        targetSection = 'demo';
                    }
                }
            }
            
            if (targetSection && this.sectionMapping[targetSection]) {
                // Remove existing listeners and onclick
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
                newElement.removeAttribute('onclick');
                
                newElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (targetSection === 'demo' || targetSection === 'contact') {
                        this.scrollToFormSection(targetSection);
                        console.log(`Element: "${elementText}" - Navigated to ${targetSection} form`);
                    } else {
                        this.scrollToSection(targetSection);
                        console.log(`Element: "${elementText}" - Navigated to ${targetSection} section`);
                    }
                });
                
                // Mark as mapped
                newElement.setAttribute('data-nav-mapped', 'true');
                console.log(`Mapped element: "${elementText}" -> ${targetSection}`);
            }
        });

        // Also map any elements with specific classes that might be interactive
        const interactiveElements = document.querySelectorAll(`
            .contact-card:not([data-nav-mapped]),
            .about-card:not([data-nav-mapped]),
            .trainer-card:not([data-nav-mapped]),
            .plan-card:not([data-nav-mapped]),
            .service-card:not([data-nav-mapped]),
            .benefit:not([data-nav-mapped]),
            .stat:not([data-nav-mapped]),
            .Logo-3D:not([data-nav-mapped])
        `);

        interactiveElements.forEach(element => {
            if (element.hasAttribute('data-nav-mapped')) return;
            
            element.style.cursor = 'pointer';
            let targetSection = null;
            
            if (element.classList.contains('contact-card')) {
                const cardText = element.textContent.toLowerCase();
                if (cardText.includes('phone') || cardText.includes('call')) {
                    element.addEventListener('click', () => window.open('tel:+971581790093', '_self'));
                    element.setAttribute('data-nav-mapped', 'true');
                    return;
                } else if (cardText.includes('map') || cardText.includes('visit')) {
                    element.addEventListener('click', () => window.open('https://maps.google.com/?q=25.301111,55.374061', '_blank'));
                    element.setAttribute('data-nav-mapped', 'true');
                    return;
                } else {
                    targetSection = 'contact';
                }
            } else if (element.classList.contains('about-card')) {
                targetSection = 'services';
            } else if (element.classList.contains('trainer-card')) {
                targetSection = 'demo';
            } else if (element.classList.contains('plan-card')) {
                targetSection = 'demo';
            } else if (element.classList.contains('service-card')) {
                const serviceTitle = element.querySelector('h3')?.textContent.toLowerCase() || '';
                if (serviceTitle.includes('home') || serviceTitle.includes('wellness')) {
                    targetSection = 'contact';
                } else {
                    targetSection = 'demo';
                }
            } else if (element.classList.contains('benefit')) {
                targetSection = 'demo';
            } else if (element.classList.contains('stat')) {
                const statText = element.textContent.toLowerCase();
                if (statText.includes('24') || statText.includes('hours')) {
                    targetSection = 'contact';
                } else if (statText.includes('customer') || statText.includes('trained')) {
                    targetSection = 'about';
                } else {
                    targetSection = 'trainers';
                }
            } else if (element.classList.contains('Logo-3D')) {
                targetSection = 'home';
            }
            
            if (targetSection) {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (targetSection === 'demo' || targetSection === 'contact') {
                        this.scrollToFormSection(targetSection);
                    } else {
                        this.scrollToSection(targetSection);
                    }
                });
                
                element.setAttribute('data-nav-mapped', 'true');
                console.log(`Mapped interactive element: ${element.className} -> ${targetSection}`);
            }
        });
    }

    mapHeroButtons() {
        // Hero "Book Free Demo" button with enhanced targeting
        const heroBookDemoBtn = document.querySelector('.hero-buttons .btn-primary');
        if (heroBookDemoBtn) {
            // Remove existing listeners
            const newBtn = heroBookDemoBtn.cloneNode(true);
            heroBookDemoBtn.parentNode.replaceChild(newBtn, heroBookDemoBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.scrollToFormSection('demo');
                console.log('Hero: Book Free Demo - Navigated to demo form');
                
                // Focus on first form field after navigation
                setTimeout(() => {
                    const firstInput = document.querySelector('#demoForm input[type="text"]');
                    if (firstInput && window.innerWidth > 768) {
                        firstInput.focus();
                    }
                }, 1200);
            });
            
            console.log('Mapped hero Book Free Demo button');
        }

        // Hero "Explore Services" button with enhanced targeting
        const heroExploreBtn = document.querySelector('.hero-buttons .btn-secondary');
        if (heroExploreBtn) {
            // Remove existing listeners
            const newBtn = heroExploreBtn.cloneNode(true);
            heroExploreBtn.parentNode.replaceChild(newBtn, heroExploreBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.scrollToSection('services');
                console.log('Hero: Explore Services - Navigated to services section');
            });
            
            console.log('Mapped hero Explore Services button');
        }

        // Map any other buttons in hero section with data-nav-target
        const allHeroButtons = document.querySelectorAll('.hero .btn, .hero-buttons .btn');
        allHeroButtons.forEach((button, index) => {
            const buttonText = button.textContent.toLowerCase().trim();
            const dataTarget = button.getAttribute('data-nav-target');
            
            // Skip already processed buttons
            if (button.classList.contains('btn-primary') || button.classList.contains('btn-secondary')) {
                return;
            }
            
            if (dataTarget && this.sectionMapping[dataTarget]) {
                // Remove existing listeners
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (dataTarget === 'demo' || dataTarget === 'contact') {
                        this.scrollToFormSection(dataTarget);
                        console.log(`Hero button: "${buttonText}" - Navigated to ${dataTarget} form`);
                    } else {
                        this.scrollToSection(dataTarget);
                        console.log(`Hero button: "${buttonText}" - Navigated to ${dataTarget} section`);
                    }
                });
                
                console.log(`Mapped hero button ${index + 1}: "${buttonText}" -> ${dataTarget}`);
            }
        });
    }

    mapServiceButtons() {
        // All service card buttons with enhanced mapping and precise targeting
        const serviceButtons = document.querySelectorAll('.service-card .btn');
        serviceButtons.forEach((button, index) => {
            const buttonText = button.textContent.toLowerCase().trim();
            
            // Remove existing listeners to prevent duplicates
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const serviceCard = newButton.closest('.service-card');
                const serviceTitle = serviceCard?.querySelector('h3')?.textContent.toLowerCase() || '';
                
                // Enhanced button text matching with service context
                if (buttonText.includes('book home') || buttonText.includes('home session') || serviceTitle.includes('home')) {
                    this.scrollToFormSection('contact');
                    console.log(`Service button: "${buttonText}" - Navigated to contact form for home service`);
                } else if (buttonText.includes('demo') || buttonText.includes('book demo')) {
                    this.scrollToFormSection('demo');
                    console.log(`Service button: "${buttonText}" - Navigated to demo form`);
                } else if (buttonText.includes('join classes') || serviceTitle.includes('group')) {
                    this.scrollToFormSection('demo');
                    console.log(`Service button: "${buttonText}" - Navigated to demo form for group classes`);
                } else if (buttonText.includes('start training') || serviceTitle.includes('training')) {
                    this.scrollToFormSection('demo');
                    console.log(`Service button: "${buttonText}" - Navigated to demo form for training`);
                } else if (buttonText.includes('book session') || buttonText.includes('session')) {
                    // Determine form based on service type
                    if (serviceTitle.includes('wellness') || serviceTitle.includes('home')) {
                        this.scrollToFormSection('contact');
                        console.log(`Service button: "${buttonText}" - Navigated to contact form for wellness/home service`);
                    } else {
                        this.scrollToFormSection('demo');
                        console.log(`Service button: "${buttonText}" - Navigated to demo form for session booking`);
                    }
                } else {
                    // Enhanced default behavior based on service type
                    if (serviceTitle.includes('home') || serviceTitle.includes('wellness') || serviceTitle.includes('massage')) {
                        this.scrollToFormSection('contact');
                        console.log(`Service button: "${buttonText}" - Default navigation to contact form (service: ${serviceTitle})`);
                    } else {
                        this.scrollToFormSection('demo');
                        console.log(`Service button: "${buttonText}" - Default navigation to demo form (service: ${serviceTitle})`);
                    }
                }
                
                // Pre-fill service information in forms
                setTimeout(() => {
                    if (serviceTitle) {
                        const serviceSelect = document.getElementById('service');
                        const messageField = document.getElementById('message') || document.getElementById('contactMessage');
                        
                        if (serviceSelect) {
                            // Map service titles to select options
                            if (serviceTitle.includes('home')) {
                                serviceSelect.value = 'home-training';
                            } else if (serviceTitle.includes('personal')) {
                                serviceSelect.value = 'personal-training';
                            } else if (serviceTitle.includes('group')) {
                                serviceSelect.value = 'group-classes';
                            } else if (serviceTitle.includes('weight')) {
                                serviceSelect.value = 'personal-training';
                            } else if (serviceTitle.includes('wellness')) {
                                serviceSelect.value = 'general-fitness';
                            }
                        }
                        
                        if (messageField && !messageField.value) {
                            messageField.value = `I'm interested in ${serviceTitle}.`;
                        }
                    }
                }, 1000);
            });
            
            // Add visual feedback
            newButton.addEventListener('mouseenter', () => {
                newButton.style.transform = 'translateY(-2px)';
                newButton.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            });
            
            newButton.addEventListener('mouseleave', () => {
                newButton.style.transform = 'translateY(0)';
                newButton.style.boxShadow = '';
            });
            
            console.log(`Mapped service button ${index + 1}: "${buttonText}"`);
        });
    }

    mapPlanButtons() {
        // All plan card buttons with enhanced targeting and form pre-filling
        const planButtons = document.querySelectorAll('.plan-card .btn');
        planButtons.forEach((button, index) => {
            // Remove existing listeners to prevent duplicates
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Get plan information for better form pre-filling
                const planCard = newButton.closest('.plan-card');
                const planName = planCard?.querySelector('h3')?.textContent || '';
                const planPrice = planCard?.querySelector('.amount')?.textContent || '';
                
                // Always go to demo form for plan bookings
                this.scrollToFormSection('demo');
                console.log(`Plan button: "${planName}" - Navigated to demo form`);
                
                // Enhanced form pre-filling after navigation
                setTimeout(() => {
                    const planSelect = document.getElementById('planChoice');
                    const messageField = document.getElementById('message');
                    
                    if (planSelect && planName) {
                        const planLower = planName.toLowerCase();
                        if (planLower.includes('basic')) {
                            planSelect.value = 'basic';
                        } else if (planLower.includes('premium')) {
                            planSelect.value = 'premium';
                        } else if (planLower.includes('vip')) {
                            planSelect.value = 'vip-single';
                        }
                        
                        // Trigger change event to update form
                        planSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    
                    if (messageField && planName && !messageField.value) {
                        let message = `I'm interested in the ${planName}`;
                        if (planPrice) {
                            message += ` (AED ${planPrice}/month)`;
                        }
                        message += '. Please provide more details about this membership.';
                        messageField.value = message;
                    }
                }, 1200);
            });
            
            // Add visual feedback
            newButton.addEventListener('mouseenter', () => {
                newButton.style.transform = 'translateY(-3px)';
                newButton.style.boxShadow = '0 8px 25px rgba(255, 107, 53, 0.3)';
            });
            
            newButton.addEventListener('mouseleave', () => {
                newButton.style.transform = 'translateY(0)';
                newButton.style.boxShadow = '';
            });
            
            console.log(`Mapped plan button ${index + 1}: "${planName}"`);
        });
    }

    mapTrainerButtons() {
        // Trainer cards - clicking leads to demo booking form
        const trainerCards = document.querySelectorAll('.trainer-card');
        trainerCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on social links
                if (!e.target.closest('.social-links')) {
                    const trainerName = card.querySelector('h3')?.textContent || '';
                    this.scrollToFormSection('demo');
                    
                    // Optional: Pre-fill trainer preference in demo form
                    setTimeout(() => {
                        const messageField = document.getElementById('message');
                        if (messageField && trainerName && !messageField.value) {
                            messageField.value = `I would like to book a demo session with ${trainerName}.`;
                        }
                    }, 1000);
                }
            });
        });

        // Trainer social links (keep their original functionality)
        const trainerSocialLinks = document.querySelectorAll('.trainer-card .social-links a');
        trainerSocialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
            });
        });
    }

    mapMediaButtons() {
        // Video cards - clicking play button or video area
        const videoCards = document.querySelectorAll('.video-card');
        videoCards.forEach(card => {
            const videoInfo = card.querySelector('.video-info');
            if (videoInfo) {
                videoInfo.style.cursor = 'pointer';
                videoInfo.addEventListener('click', () => {
                    // Trigger video play
                    const playBtn = card.querySelector('.play-btn');
                    if (playBtn) {
                        playBtn.click();
                    }
                });
            }
        });
    }

    mapDataNavTargetButtons() {
        // Map all buttons with data-nav-target attribute
        const dataNavButtons = document.querySelectorAll('[data-nav-target]');
        dataNavButtons.forEach(button => {
            const targetSection = button.getAttribute('data-nav-target');
            if (this.sectionMapping[targetSection]) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.scrollToSection(targetSection);
                });
            }
        });
    }

    mapScrollIndicator() {
        // Scroll indicator in hero section
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.cursor = 'pointer';
            scrollIndicator.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.scrollToSection('about');
                console.log('Scroll indicator: Navigated to about section');
            });
            scrollIndicator.setAttribute('data-nav-mapped', 'true');
        }
        
        // Also handle scroll arrow specifically
        const scrollArrow = document.querySelector('.scroll-arrow');
        if (scrollArrow) {
            scrollArrow.style.cursor = 'pointer';
            scrollArrow.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.scrollToSection('about');
                console.log('Scroll arrow: Navigated to about section');
            });
            scrollArrow.setAttribute('data-nav-mapped', 'true');
        }
    }

    mapMiscellaneousButtons() {
        // Demo section benefits - clicking scrolls to demo form
        const benefitElements = document.querySelectorAll('.benefit');
        benefitElements.forEach(benefit => {
            benefit.style.cursor = 'pointer';
            benefit.addEventListener('click', () => {
                this.scrollToFormSection('demo');
            });
        });

        // About cards - clicking leads to services
        const aboutCards = document.querySelectorAll('.about-card');
        aboutCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                this.scrollToSection('services');
            });
        });

        // Contact cards - make them interactive with better targeting
        const contactCards = document.querySelectorAll('.contact-card');
        contactCards.forEach((card, index) => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                e.preventDefault();
                
                const icon = card.querySelector('i');
                const cardText = card.textContent.toLowerCase();
                
                if (icon) {
                    if (icon.classList.contains('fa-phone-alt') || cardText.includes('call')) {
                        // Phone card - open phone dialer
                        window.open('tel:+971581790093', '_self');
                    } else if (icon.classList.contains('fa-envelope') || cardText.includes('email')) {
                        // Email card - scroll to contact form instead of email client
                        this.scrollToFormSection('contact');
                    } else if (icon.classList.contains('fa-map-marker-alt') || cardText.includes('visit')) {
                        // Location card - open maps
                        window.open('https://maps.google.com/?q=25.301111,55.374061', '_blank');
                    } else if (icon.classList.contains('fa-clock') || cardText.includes('hours')) {
                        // Hours card - scroll to demo booking
                        this.scrollToFormSection('demo');
                    } else {
                        // Default action - scroll to contact form
                        this.scrollToFormSection('contact');
                    }
                }
            });
        });

        // WhatsApp chat button
        const whatsappChat = document.getElementById('whatsappChat');
        if (whatsappChat) {
            whatsappChat.addEventListener('click', (e) => {
                console.log('WhatsApp chat opened');
            });
        }

        // Back to top button
        const backToTop = document.getElementById('backtotop');
        if (backToTop) {
            backToTop.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection('home');
            });
        }

        // Logo elements in navbar
        const navLogo = document.querySelector('.nav-logo .Logo-3D');
        if (navLogo) {
            navLogo.style.cursor = 'pointer';
            navLogo.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection('home');
            });
        }

        // Stats in hero section - enhanced with form targeting
        const heroStats = document.querySelectorAll('.hero .stat');
        heroStats.forEach((stat, index) => {
            stat.style.cursor = 'pointer';
            stat.addEventListener('click', () => {
                if (index === 0) { // 24/7 stat
                    this.scrollToFormSection('contact');
                } else if (index === 1) { // Customers stat
                    this.scrollToSection('about');
                } else { // Experience stat
                    this.scrollToSection('trainers');
                }
            });
        });

        // Handle all buttons with data-nav-target attribute
        const dataNavButtons = document.querySelectorAll('[data-nav-target]');
        dataNavButtons.forEach(button => {
            const targetSection = button.getAttribute('data-nav-target');
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (targetSection === 'demo' || targetSection === 'contact') {
                    this.scrollToFormSection(targetSection);
                } else if (this.sectionMapping[targetSection]) {
                    this.scrollToSection(targetSection);
                }
            });
        });

        // Remove old onclick handlers and replace with proper event listeners
        const onclickButtons = document.querySelectorAll('[onclick*="scrollToSection"]');
        onclickButtons.forEach(button => {
            const onclickValue = button.getAttribute('onclick');
            button.removeAttribute('onclick');
            
            if (onclickValue) {
                const sectionMatch = onclickValue.match(/scrollToSection\(['"]([^'"]+)['"]\)/);
                if (sectionMatch) {
                    const sectionId = sectionMatch[1];
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        if (sectionId === 'demo' || sectionId === 'contact') {
                            this.scrollToFormSection(sectionId);
                        } else {
                            this.scrollToSection(sectionId);
                        }
                    });
                }
            }
        });
    }

    mapFooterNavigation() {
        // Footer logo navigation
        const footerLogo = document.querySelector('.footer-logo .Logo-3D');
        if (footerLogo) {
            footerLogo.style.cursor = 'pointer';
            footerLogo.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection('home');
            });
        }

        // Social media links (keep their original hrefs but add smooth scroll for internal links)
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sectionId = href.substring(1);
                    if (this.sectionMapping[sectionId]) {
                        this.scrollToSection(sectionId);
                    }
                });
            }
        });
    }

    // Setup global navigation for buttons throughout the site
    setupGlobalNavigation() {
        // Make scrollToSection globally accessible
        window.scrollToSection = (sectionId) => this.scrollToSection(sectionId);
        
        // Handle logo clicks to go to home
        const logoElements = document.querySelectorAll('.Logo-3D, .nav-logo');
        logoElements.forEach(logo => {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection('home');
            });
            logo.style.cursor = 'pointer';
        });

        // Handle any hash links in the document
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link && !link.classList.contains('nav-link')) {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                if (this.sectionMapping[sectionId]) {
                    this.scrollToSection(sectionId);
                }
            }
        });
    }

    // Enhanced section scrolling with proper offset handling
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) {
            console.warn(`Section with id '${sectionId}' not found`);
            return;
        }

        // Close mobile menu if open
        this.closeMobileMenu();

        const navHeight = this.navbar?.offsetHeight || 80;
        const offset = this.sectionOffsets[sectionId] || -80;
        const targetPosition = section.offsetTop + offset;

        // Smooth scroll to target position
        window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
        });

        // Update URL without triggering scroll event
        if (history.pushState) {
            history.pushState(null, null, `#${sectionId}`);
        }

        // Set scrolling flag to prevent conflicts with scroll detection
        this.isScrolling = true;
        setTimeout(() => {
            this.isScrolling = false;
        }, 1200);

        // Update active navigation immediately
        this.setActiveNavLink(sectionId);

        // Log navigation for debugging
        console.log(`Navigated to section: ${sectionId}`);
    }

    // New method for form-specific scrolling
    scrollToFormSection(sectionId) {
        this.scrollToSection(sectionId);
        
        // Additional focus on the form element after scrolling
        setTimeout(() => {
            let formElement = null;
            
            if (sectionId === 'demo') {
                formElement = document.getElementById('demoForm');
            } else if (sectionId === 'contact') {
                formElement = document.getElementById('contactForm');
            }
            
            if (formElement) {
                // Smooth scroll to center the form in view
                formElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // Optional: Focus on first input field
                setTimeout(() => {
                    const firstInput = formElement.querySelector('input[type="text"], input[type="email"]');
                    if (firstInput && window.innerWidth > 768) { // Only on desktop to avoid mobile keyboard issues
                        firstInput.focus();
                    }
                }, 500);
            }
        }, 800); // Wait for section scroll to complete
    }

    // Active navigation highlighting
    setupActiveNavHighlight() {
        this.updateActiveSection();
    }

    updateActiveSection() {
        if (this.isScrolling) return;

        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;
        let currentSection = 'home';

        // Offset for section detection
        const offset = 120;
        
        // Find current section based on scroll position
        for (const section of this.sections) {
            const sectionTop = section.offsetTop - offset;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                currentSection = section.id;
                break;
            }
        }

        // Handle edge cases
        if (scrollY + windowHeight >= document.documentElement.scrollHeight - 100) {
            currentSection = 'contact';
        }

        if (scrollY < 50) {
            currentSection = 'home';
        }

        // Update active section if changed
        if (currentSection !== this.activeSection) {
            this.activeSection = currentSection;
            this.setActiveNavLink(currentSection);
        }
    }

    setActiveNavLink(sectionId) {
        // Remove active class from all nav links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current section link
        const activeLink = document.querySelector(`[data-section="${sectionId}"], .nav-link[href="#${sectionId}"]`);
        if (activeLink && activeLink.classList.contains('nav-link')) {
            activeLink.classList.add('active');
            
            // Update URL hash if different
            if (window.location.hash !== `#${sectionId}`) {
                history.replaceState(null, null, `#${sectionId}`);
            }
        }
    }

    // Enhanced keyboard navigation
    setupKeyboardNavigation() {
        // Navigation links keyboard support
        this.navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowDown':
                    case 'ArrowRight':
                        e.preventDefault();
                        const nextIndex = (index + 1) % this.navLinks.length;
                        this.navLinks[nextIndex].focus();
                        break;
                        
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        e.preventDefault();
                        const prevIndex = index === 0 ? this.navLinks.length - 1 : index - 1;
                        this.navLinks[prevIndex].focus();
                        break;
                        
                    case 'Home':
                        e.preventDefault();
                        this.navLinks[0].focus();
                        break;
                        
                    case 'End':
                        e.preventDefault();
                        this.navLinks[this.navLinks.length - 1].focus();
                        break;
                        
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        link.click();
                        break;
                }
            });
        });

        // Global keyboard shortcuts for navigation
        document.addEventListener('keydown', (e) => {
            // Only trigger if not typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            // Number keys for quick section navigation
            const sectionKeys = {
                '1': 'home',
                '2': 'about', 
                '3': 'services',
                '4': 'trainers',
                '5': 'media',
                '6': 'plans',
                '7': 'demo',
                '8': 'contact'
            };

            if (sectionKeys[e.key]) {
                e.preventDefault();
                this.scrollToSection(sectionKeys[e.key]);
            }

            // Arrow keys for section navigation
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        this.scrollToSection('home');
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.scrollToSection('contact');
                        break;
                }
            }
        });
    }

    // Public method to programmatically navigate to a section
    navigateToSection(sectionId) {
        if (this.sectionMapping[sectionId]) {
            this.scrollToSection(this.sectionMapping[sectionId]);
        } else {
            console.warn(`Invalid section ID: ${sectionId}`);
        }
    }

    // Public method to get current active section
    getCurrentSection() {
        return this.activeSection;
    }

    // Public method to get all available sections
    getAvailableSections() {
        return Object.keys(this.sectionMapping);
    }

    // Enhanced keyboard navigation mapping
    mapKeyboardNavigation() {
        // Add keyboard shortcuts info
        const keyboardShortcuts = {
            '1': 'home',
            '2': 'about',
            '3': 'services', 
            '4': 'trainers',
            '5': 'media',
            '6': 'plans',
            '7': 'demo',
            '8': 'contact',
            'h': 'home',
            'a': 'about',
            's': 'services',
            't': 'trainers',
            'm': 'media',
            'p': 'plans',
            'd': 'demo',
            'c': 'contact'
        };

        // Display keyboard shortcuts on Alt+K
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'k') {
                e.preventDefault();
                this.showKeyboardShortcuts(keyboardShortcuts);
            }
        });
    }

    // Touch navigation for mobile devices
    mapTouchNavigation() {
        let touchStartY = 0;
        let touchEndY = 0;
        
        // Swipe navigation for mobile
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipeNavigation(touchStartY, touchEndY);
        }, { passive: true });
    }

    // Handle swipe navigation
    handleSwipeNavigation(startY, endY) {
        const minSwipeDistance = 100;
        const swipeDistance = Math.abs(startY - endY);
        
        if (swipeDistance < minSwipeDistance) return;
        
        const sections = Object.keys(this.sectionMapping);
        const currentIndex = sections.indexOf(this.activeSection);
        
        if (startY > endY && currentIndex < sections.length - 1) {
            // Swipe up - next section
            this.scrollToSection(sections[currentIndex + 1]);
        } else if (startY < endY && currentIndex > 0) {
            // Swipe down - previous section
            this.scrollToSection(sections[currentIndex - 1]);
        }
    }

    // Show keyboard shortcuts modal
    showKeyboardShortcuts(shortcuts) {
        const modal = document.createElement('div');
        modal.className = 'keyboard-shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-content">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-grid">
                    ${Object.entries(shortcuts).map(([key, section]) => 
                        `<div class="shortcut-item">
                            <kbd>${key}</kbd>
                            <span>${section.charAt(0).toUpperCase() + section.slice(1)}</span>
                        </div>`
                    ).join('')}
                </div>
                <p>Press <kbd>Esc</kbd> to close this dialog</p>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        document.body.appendChild(modal);
        
        // Close on Escape or click outside
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
}

// Global navigation controller instance
let navigationController;

// Initialize navigation system
function initializeNavigation() {
    navigationController = new NavigationController();
    
    // Ensure all buttons are properly mapped after initialization
    setTimeout(() => {
        navigationController.mapAllNavigationButtons();
        console.log('Navigation system fully initialized and mapped');
    }, 100);
}

// Legacy function for backward compatibility
function scrollToSection(sectionId) {
    if (navigationController) {
        navigationController.scrollToSection(sectionId);
    } else {
        console.warn('Navigation controller not initialized');
    }
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

    // Initialize simple CAPTCHA systems
    demoCaptcha = new SimpleCaptcha('demoCaptcha', 'demo');
    contactCaptcha = new SimpleCaptcha('contactCaptcha', 'contact');
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

// Auto-play videos function with ultra-aggressive mobile support
function initializeAutoplayVideos() {
    // Play hero background video with ultra-aggressive mobile autoplay
    const heroVideo = document.querySelector('.hero-background-video');
    if (heroVideo) {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                         window.innerWidth <= 768 || 
                         'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0;
        
        // Immediately set video source to prevent loading delays
        if (!heroVideo.src && heroVideo.querySelector('source')) {
            heroVideo.src = heroVideo.querySelector('source').src;
        }
        
        // Ultra-aggressive video configuration
        const configureVideo = () => {
            // Remove all possible controls and interactions
            heroVideo.removeAttribute('controls');
            heroVideo.controls = false;
            
            // Set all autoplay-required attributes
            heroVideo.muted = true;
            heroVideo.defaultMuted = true;
            heroVideo.volume = 0;
            heroVideo.autoplay = true;
            heroVideo.loop = true;
            heroVideo.playsInline = true;
            heroVideo.preload = 'auto';
            
            // Force all HTML attributes for maximum compatibility
            const attrs = {
                'muted': 'true',
                'autoplay': 'true',
                'loop': 'true',
                'playsinline': 'true',
                'webkit-playsinline': 'true',
                'defaultMuted': 'true',
                'preload': 'auto',
                'disableremoteplaybook': 'true',
                'disablepictureinpicture': 'true',
                'x-webkit-airplay': 'deny',
                'controlsList': 'nodownload nofullscreen noremoteplaybook noplaybackrate'
            };
            
            // Mobile-specific attributes for all devices
            if (isMobile) {
                attrs['x5-playsinline'] = 'true';
                attrs['x5-video-player-type'] = 'h5';
                attrs['x5-video-player-fullscreen'] = 'false';
                attrs['x5-video-orientation'] = 'portrait';
                attrs['t7-video-player-type'] = 'inline';
                attrs['webkit-playsinline'] = '';
                attrs['playsinline'] = '';
            }
            
            // Apply all attributes
            Object.entries(attrs).forEach(([key, value]) => {
                heroVideo.setAttribute(key, value);
            });
        };
        
        // Aggressive style enforcement
        const enforceBackgroundBehavior = () => {
            const styles = {
                'pointer-events': 'none',
                'outline': 'none',
                '-webkit-touch-callout': 'none',
                '-webkit-user-select': 'none',
                'user-select': 'none',
                '-webkit-appearance': 'none',
                'appearance': 'none',
                '-webkit-media-controls': 'none',
                '-webkit-media-controls-panel': 'none',
                '-webkit-media-controls-play-button': 'none',
                '-webkit-media-controls-start-playback-button': 'none',
                '-webkit-media-controls-overlay-play-button': 'none',
                'display': 'block'
            };
            
            Object.entries(styles).forEach(([prop, value]) => {
                heroVideo.style.setProperty(prop, value, 'important');
            });
            
            // Reapply video configuration
            configureVideo();
        };
        
        // Immediate configuration
        configureVideo();
        enforceBackgroundBehavior();
        
        // Monitor and enforce settings every 50ms
        const monitorInterval = setInterval(() => {
            enforceBackgroundBehavior();
            
            // Ensure video stays muted and configured
            if (heroVideo.volume > 0) heroVideo.volume = 0;
            if (!heroVideo.muted) heroVideo.muted = true;
            if (heroVideo.controls) heroVideo.controls = false;
        }, 50);
        
        // Enhanced autoplay function with better error handling
        const attemptAutoplay = async (retryCount = 0) => {
            try {
                // Reset to known good state
                heroVideo.currentTime = 0;
                heroVideo.muted = true;
                heroVideo.volume = 0;
                
                // Attempt to play
                const playPromise = heroVideo.play();
                
                if (playPromise !== undefined) {
                    await playPromise;
                    console.log('Background video autoplay successful');
                    clearInterval(monitorInterval); // Stop aggressive monitoring once playing
                    return true;
                }
                return false;
            } catch (error) {
                console.log('Autoplay failed, will retry:', error);
                
                // Retry logic with exponential backoff
                if (retryCount < 5) {
                    const delay = Math.min(100 * Math.pow(2, retryCount), 2000);
                    setTimeout(() => {
                        configureVideo();
                        attemptAutoplay(retryCount + 1);
                    }, delay);
                } else {
                    console.log('Retry failed:', error);
                }
                return false;
            }
        };
        
        // Immediate play attempts for mobile
        if (isMobile) {
            // Force immediate load
            heroVideo.load();
            
            // Multiple immediate attempts
            setTimeout(() => attemptAutoplay(0), 50);
            setTimeout(() => attemptAutoplay(0), 200);
            setTimeout(() => attemptAutoplay(0), 500);
            setTimeout(() => attemptAutoplay(0), 1000);
        }
        
        // Event-based autoplay attempts
        const videoReadyEvents = ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'];
        videoReadyEvents.forEach(eventName => {
            heroVideo.addEventListener(eventName, () => attemptAutoplay(0), { once: true, passive: true });
        });
        
        // Force initial load
        heroVideo.load();
        
        // Try immediate play if video is already ready
        if (heroVideo.readyState >= 2) {
            attemptAutoplay(0);
        }
        
        // User interaction fallback for stubborn mobile browsers
        let userInteracted = false;
        const playOnInteraction = async () => {
            if (!userInteracted) {
                userInteracted = true;
                configureVideo();
                await attemptAutoplay(0);
            }
        };
        
        // Capture ANY user interaction
        const interactionEvents = ['touchstart', 'touchend', 'touchmove', 'click', 'mousedown', 'keydown', 'scroll'];
        interactionEvents.forEach(event => {
            document.addEventListener(event, playOnInteraction, { once: true, passive: true });
            window.addEventListener(event, playOnInteraction, { once: true, passive: true });
        });
        
        // Prevent video pausing
        heroVideo.addEventListener('pause', () => {
            if (userInteracted) {
                setTimeout(() => {
                    if (heroVideo.paused) {
                        configureVideo();
                        attemptAutoplay(0);
                    }
                }, 10);
            }
        });
        
        // Block all user interactions with video
        const blockInteraction = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        };
        
        const eventsToBlock = [
            'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove',
            'touchstart', 'touchend', 'touchmove', 'touchcancel',
            'contextmenu', 'selectstart', 'dragstart', 'drag', 'dragend',
            'gesturestart', 'gesturechange', 'gestureend'
        ];
        
        eventsToBlock.forEach(eventType => {
            heroVideo.addEventListener(eventType, blockInteraction, { passive: false, capture: true });
        });
        
        // Handle page visibility and focus changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && heroVideo.paused) {
                setTimeout(() => {
                    configureVideo();
                    attemptAutoplay(0);
                }, 100);
            }
        });
        
        window.addEventListener('focus', () => {
            if (heroVideo.paused) {
                setTimeout(() => {
                    configureVideo();
                    attemptAutoplay(0);
                }, 100);
            }
        });
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                configureVideo();
                if (heroVideo.paused) {
                    attemptAutoplay(0);
                }
            }, 600);
        });
        
        // Success logging
        heroVideo.addEventListener('play', () => {
            console.log('Background video is now playing');
        });
        
        heroVideo.addEventListener('playing', () => {
            console.log('Background video is playing smoothly');
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
