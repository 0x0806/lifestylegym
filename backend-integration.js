// Backend API Integration Script
// This script handles communication with the Node.js backend

class BackendFormHandler {
    constructor() {
        this.apiBase = ''; // Same origin
        this.init();
    }

    init() {
        this.setupCaptcha();
        this.setupForms();
        this.setupEventListeners();
    }

    // CAPTCHA System
    async setupCaptcha() {
        // Initialize demo CAPTCHA
        await this.loadCaptcha('demo');

        // Initialize contact CAPTCHA
        await this.loadCaptcha('contact');

        // Setup refresh buttons
        this.setupCaptchaRefresh();
    }

    async loadCaptcha(formType) {
        const challengeContainer = document.getElementById(`${formType}CaptchaChallenge`);
        const captchaIdInput = document.getElementById(`${formType}CaptchaId`);

        if (!challengeContainer || !captchaIdInput) return;

        try {
            // Show loading state
            challengeContainer.innerHTML = `
                <div class="captcha-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading CAPTCHA...
                </div>
            `;

            const response = await fetch(`${this.apiBase}/api/captcha`);

            if (!response.ok) {
                throw new Error('Failed to load CAPTCHA');
            }

            const captcha = await response.json();

            // Store CAPTCHA ID
            captchaIdInput.value = captcha.id;

            // Display CAPTCHA image
            challengeContainer.innerHTML = `
                <img src="${captcha.image}" alt="CAPTCHA" />
            `;

        } catch (error) {
            console.error('CAPTCHA loading error:', error);
            challengeContainer.innerHTML = `
                <div class="captcha-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    Failed to load CAPTCHA. Please refresh.
                </div>
            `;
        }
    }

    setupCaptchaRefresh() {
        const refreshButtons = ['demoCaptchaRefresh', 'contactCaptchaRefresh'];

        refreshButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const formType = buttonId.includes('demo') ? 'demo' : 'contact';

                    // Clear current answer
                    document.getElementById(`${formType}CaptchaAnswer`).value = '';

                    // Reload CAPTCHA
                    await this.loadCaptcha(formType);
                });
            }
        });
    }

    // Form Setup
    setupForms() {
        this.setupDemoForm();
        this.setupContactForm();
        this.setupNewsletterForm();
        this.addSecurityFields();
    }

    setupDemoForm() {
        const demoForm = document.getElementById('demoForm');
        if (!demoForm) return;

        demoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleDemoSubmission(demoForm);
        });

        // Character counter for message field
        const messageField = demoForm.querySelector('#message');
        if (messageField) {
            messageField.addEventListener('input', (e) => {
                const count = e.target.value.length;
                // Update character count if element exists
                const counter = demoForm.querySelector('.character-count span');
                if (counter) {
                    counter.textContent = count;
                }
            });
        }
    }

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleContactSubmission(contactForm);
        });

        // Character counter for message field
        const messageField = contactForm.querySelector('#contactMessage');
        const messageCount = document.getElementById('messageCount');

        if (messageField && messageCount) {
            messageField.addEventListener('input', (e) => {
                const count = e.target.value.length;
                messageCount.textContent = count;

                // Update color based on count
                messageCount.className = '';
                if (count > 900) {
                    messageCount.classList.add('danger');
                } else if (count > 700) {
                    messageCount.classList.add('warning');
                }
            });
        }
    }

    setupNewsletterForm() {
        // Add newsletter form handler if it exists
        const newsletterForms = document.querySelectorAll('form[action*="newsletter"]');
        newsletterForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleNewsletterSubmission(form);
            });
        });
    }

    // Form Submission Handlers
    async handleDemoSubmission(form) {
        const submitBtn = document.getElementById('demoSubmitBtn');
        const originalBtnHTML = submitBtn.innerHTML;

        try {
            // Validate form
            if (!this.validateForm(form)) {
                return;
            }

            // Show loading state
            this.setButtonLoading(submitBtn, true);
            this.clearFormErrors(form);

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Add CAPTCHA answer
            data.captchaAnswer = document.getElementById('demoCaptchaAnswer').value;

            // Submit to backend
            const response = await fetch(`${this.apiBase}/api/demo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showSuccessNotification('Demo Booking Successful!', result.message);
                form.reset();
                await this.loadCaptcha('demo');
            } else {
                this.showFormErrors(form, result.errors || [{ message: result.error }]);
            }

        } catch (error) {
            console.error('Demo submission error:', error);
            this.showErrorNotification('Submission failed. Please try again.');
        } finally {
            this.setButtonLoading(submitBtn, false, originalBtnHTML);
        }
    }

    async handleContactSubmission(form) {
        const submitBtn = document.getElementById('contactSubmitBtn');
        const originalBtnHTML = submitBtn.innerHTML;

        try {
            // Validate form
            if (!this.validateForm(form)) {
                return;
            }

            // Show loading state
            this.setButtonLoading(submitBtn, true);
            this.clearFormErrors(form);

            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Add CAPTCHA answer
            data.captchaAnswer = document.getElementById('contactCaptchaAnswer').value;

            // Submit to backend
            const response = await fetch(`${this.apiBase}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showSuccessNotification('Message Sent!', result.message);
                form.reset();
                await this.loadCaptcha('contact');
            } else {
                this.showFormErrors(form, result.errors || [{ message: result.error }]);
            }

        } catch (error) {
            console.error('Contact submission error:', error);
            this.showErrorNotification('Submission failed. Please try again.');
        } finally {
            this.setButtonLoading(submitBtn, false, originalBtnHTML);
        }
    }

    async handleNewsletterSubmission(form) {
        const email = form.querySelector('input[type="email"]').value;

        if (!email || !this.isValidEmail(email)) {
            this.showErrorNotification('Please enter a valid email address.');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/api/newsletter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showSuccessNotification('Newsletter Subscription Successful!', result.message);
                form.reset();
            } else {
                this.showErrorNotification(result.error || 'Failed to subscribe. Please try again.');
            }

        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showErrorNotification('Subscription failed. Please try again.');
        }
    }

    // Form Validation
    validateForm(form) {
        let isValid = true;
        let firstInvalidField = null;

        // Clear previous errors
        this.clearFormErrors(form);

        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            const value = field.value.trim();

            if (!value) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            } else {
                // Field-specific validation
                if (field.type === 'email' && !this.isValidEmail(value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    isValid = false;
                    if (!firstInvalidField) firstInvalidField = field;
                } else if (field.type === 'tel' && !this.isValidPhone(value)) {
                    this.showFieldError(field, 'Please enter a valid phone number');
                    isValid = false;
                    if (!firstInvalidField) firstInvalidField = field;
                } else if (field.type === 'date') {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (selectedDate < today) {
                        this.showFieldError(field, 'Please select a future date');
                        isValid = false;
                        if (!firstInvalidField) firstInvalidField = field;
                    }
                }
            }
        });

        // Validate CAPTCHA
        const captchaAnswer = form.querySelector('[id$="CaptchaAnswer"]');
        if (captchaAnswer && !captchaAnswer.value.trim()) {
            this.showFieldError(captchaAnswer, 'Please complete the CAPTCHA');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = captchaAnswer;
        }

        if (!isValid && firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    }

    // Utility Functions
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) && email.length <= 100;
    }

    isValidPhone(phone) {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        const regex = /^[\+]?[1-9][\d]{6,14}$/;
        return regex.test(cleanPhone);
    }

    // UI Functions
    setButtonLoading(button, isLoading, originalHTML = '') {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.innerHTML = originalHTML;
        }
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.add('has-error');

        // Remove existing error message
        const existingError = formGroup.querySelector('.form-error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error message
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error-message';
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

        formGroup.appendChild(errorElement);
    }

    clearFormErrors(form) {
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('has-error');
        });

        form.querySelectorAll('.form-error-message').forEach(error => {
            error.remove();
        });
    }

    showFormErrors(form, errors) {
        if (Array.isArray(errors)) {
            errors.forEach(error => {
                const field = form.querySelector(`[name="${error.field}"]`);
                if (field) {
                    this.showFieldError(field, error.message);
                }
            });
        } else if (errors.message) {
            this.showErrorNotification(errors.message);
        }
    }

    showSuccessNotification(title, message = '') {
        const notification = document.createElement('div');
        notification.className = 'form-notification success';
        notification.innerHTML = `
            <div>
                <h4>${title}</h4>
                ${message ? `<p>${message}</p>` : ''}
            </div>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'form-notification error';
        notification.innerHTML = `<p>${message}</p>`;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Security
    addSecurityFields() {
        // Add timestamp
        const timestampFields = document.querySelectorAll('[id$="Timestamp"]');
        timestampFields.forEach(field => {
            field.value = Date.now().toString();
        });

        // Add user agent
        const userAgentFields = document.querySelectorAll('[id$="UserAgent"]');
        userAgentFields.forEach(field => {
            field.value = navigator.userAgent.substring(0, 200);
        });

        // Add referrer
        const referrerFields = document.querySelectorAll('[id$="Referrer"]');
        referrerFields.forEach(field => {
            field.value = document.referrer || 'direct';
        });
    }

    setupEventListeners() {
        // Add input validation feedback
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', (e) => {
                const value = e.target.value.trim();
                if (value && !this.isValidEmail(value)) {
                    this.showFieldError(e.target, 'Please enter a valid email address');
                } else {
                    const formGroup = e.target.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.remove('has-error');
                        const errorMsg = formGroup.querySelector('.form-error-message');
                        if (errorMsg) errorMsg.remove();
                    }
                }
            });
        });

        document.querySelectorAll('input[type="tel"]').forEach(input => {
            input.addEventListener('blur', (e) => {
                const value = e.target.value.trim();
                if (value && !this.isValidPhone(value)) {
                    this.showFieldError(e.target, 'Please enter a valid phone number');
                } else {
                    const formGroup = e.target.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.remove('has-error');
                        const errorMsg = formGroup.querySelector('.form-error-message');
                        if (errorMsg) errorMsg.remove();
                    }
                }
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the backend (Node.js environment)
    if (typeof window !== 'undefined') {
        window.backendFormHandler = new BackendFormHandler();

        // Make it globally available for other scripts
        window.BackendFormHandler = BackendFormHandler;
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackendFormHandler;
}