// Global Variables
let currentTestimonial = 1;
let testimonialInterval;
let isLoading = true;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    // Show loading screen
    showLoadingScreen();
    
    // Initialize components after a delay to show loading
    setTimeout(() => {
        initializeNavigation();
        initializeHero();
        initializeScrollEffects();
        initializeModals();
        initializeForms();
        initializeGallery();
        initializeTestimonials();
        initializeTheme();
        initializeCursor();
        initializeAnimations();
        initializeCounters();
        
        // Hide loading screen
        hideLoadingScreen();
        
        // Check for success messages
        checkUrlParams();
    }, 2000);
}

// Loading Screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    isLoading = false;
}

// Navigation
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });

    // Scroll effects
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        updateActiveNavLink();
        toggleBackToTop();
    });

    // Smooth scrolling for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Hero Section
function initializeHero() {
    const heroVideo = document.querySelector('.hero-video');
    
    // Ensure video plays
    if (heroVideo) {
        heroVideo.play().catch(e => {
            console.log('Video autoplay failed:', e);
        });
    }
}

// Scroll Effects
function initializeScrollEffects() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .program-card, .trainer-card, .gallery-item, .testimonial-card');
    animateElements.forEach(el => observer.observe(el));
}

// Back to Top Button
function toggleBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Modals
function initializeModals() {
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Set minimum date for demo booking
        if (modalId === 'demoModal') {
            const dateInput = document.getElementById('demo-date');
            if (dateInput) {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                dateInput.min = tomorrow.toISOString().split('T')[0];
            }
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Forms
function initializeForms() {
    const demoForm = document.getElementById('demoForm');
    const contactForm = document.getElementById('contactForm');
    const newsletterForm = document.getElementById('newsletterForm');

    if (demoForm) {
        demoForm.addEventListener('submit', handleDemoSubmission);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmission);
    }
}

async function handleDemoSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    
    try {
        const response = await fetch('/submit-demo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData)
        });
        
        if (response.ok) {
            showToast('Demo session booked successfully! We\'ll contact you soon.', 'success');
            form.reset();
            closeModal('demoModal');
        } else {
            const errorData = await response.json();
            showToast(errorData.message || 'Failed to book demo session. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Demo submission error:', error);
        showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Book Demo Session';
    }
}

async function handleContactSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
        const response = await fetch('/submit-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData)
        });
        
        if (response.ok) {
            showToast('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
            form.reset();
        } else {
            const errorData = await response.json();
            showToast(errorData.message || 'Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Contact submission error:', error);
        showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
}

async function handleNewsletterSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const response = await fetch('/api/newsletter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email')
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Successfully subscribed to newsletter!', 'success');
            form.reset();
        } else {
            showToast(data.message || 'Failed to subscribe. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Newsletter submission error:', error);
        showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i>';
    }
}

// Gallery
function initializeGallery() {
    const filterBtns = document.querySelectorAll('.gallery-filter .filter-btn, .programs-filter .filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            const isGallery = btn.closest('.gallery-filter');
            const isPrograms = btn.closest('.programs-filter');
            
            // Update active button
            btn.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter items
            if (isGallery) {
                filterGalleryItems(filter);
            } else if (isPrograms) {
                filterProgramItems(filter);
            }
        });
    });
}

function filterGalleryItems(filter) {
    const items = document.querySelectorAll('.gallery-item');
    
    items.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

function filterProgramItems(filter) {
    const items = document.querySelectorAll('.program-card');
    
    items.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

// Lightbox
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    
    if (lightbox && lightboxImage) {
        lightboxImage.src = imageSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close lightbox when clicking outside image
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('lightbox')) {
        closeLightbox();
    }
});

// Close lightbox with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeLightbox = document.querySelector('.lightbox.active');
        if (activeLightbox) {
            closeLightbox();
        }
    }
});

// Testimonials
function initializeTestimonials() {
    startTestimonialSlider();
}

function startTestimonialSlider() {
    testimonialInterval = setInterval(() => {
        changeTestimonial(1);
    }, 5000);
}

function changeTestimonial(direction) {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonials-dots .dot');
    
    if (testimonials.length === 0) return;
    
    // Remove active class from current testimonial
    testimonials[currentTestimonial - 1].classList.remove('active');
    dots[currentTestimonial - 1].classList.remove('active');
    
    // Calculate next testimonial
    currentTestimonial += direction;
    
    if (currentTestimonial > testimonials.length) {
        currentTestimonial = 1;
    } else if (currentTestimonial < 1) {
        currentTestimonial = testimonials.length;
    }
    
    // Add active class to new testimonial
    testimonials[currentTestimonial - 1].classList.add('active');
    dots[currentTestimonial - 1].classList.add('active');
    
    // Restart interval
    clearInterval(testimonialInterval);
    startTestimonialSlider();
}

function currentTestimonial(n) {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonials-dots .dot');
    
    if (n > testimonials.length) return;
    
    // Remove active class from all
    testimonials.forEach(t => t.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    // Set current
    currentTestimonial = n;
    testimonials[currentTestimonial - 1].classList.add('active');
    dots[currentTestimonial - 1].classList.add('active');
    
    // Restart interval
    clearInterval(testimonialInterval);
    startTestimonialSlider();
}

// Theme Toggle
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// Cursor Follower
function initializeCursor() {
    const cursor = document.querySelector('.cursor-follower');
    
    if (!cursor || window.innerWidth <= 768) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        cursorX += dx * 0.1;
        cursorY += dy * 0.1;
        
        cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px)`;
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Cursor effects on hover
    const hoverElements = document.querySelectorAll('a, button, .btn, .program-card, .trainer-card, .gallery-item');
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform += ' scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = cursor.style.transform.replace(' scale(1.5)', '');
        });
    });
}

// Animations
function initializeAnimations() {
    // Parallax effect for hero
    window.addEventListener('scroll', () => {
        if (isLoading) return;
        
        const scrolled = window.pageYOffset;
        const heroVideo = document.querySelector('.hero-video');
        
        if (heroVideo) {
            heroVideo.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Counter Animation
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    // Intersection Observer for counters
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Video Player
function playVideo(button) {
    const videoContainer = button.closest('.video-container');
    const video = videoContainer.querySelector('video');
    const overlay = videoContainer.querySelector('.video-overlay');
    
    if (video && overlay) {
        video.play();
        overlay.classList.add('hidden');
        
        video.addEventListener('pause', () => {
            overlay.classList.remove('hidden');
        });
        
        video.addEventListener('ended', () => {
            overlay.classList.remove('hidden');
        });
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="toast-icon ${iconMap[type]}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="closeToast(this)">&times;</button>
        </div>
        <div class="toast-progress"></div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            closeToast(toast.querySelector('.toast-close'));
        }
    }, 5000);
}

function closeToast(button) {
    const toast = button.closest('.toast');
    if (toast) {
        toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }
}

// URL Parameters Check
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    
    if (success === 'demo') {
        showToast('Demo session booked successfully! We\'ll contact you soon.', 'success');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (success === 'contact') {
        showToast('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Performance Optimization
function optimizeImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Error Handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // Don't show error toast to users in production
    if (window.location.hostname === 'localhost') {
        showToast('A JavaScript error occurred. Check the console for details.', 'error');
    }
});

// Unhandled Promise Rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // Don't show error toast to users in production
    if (window.location.hostname === 'localhost') {
        showToast('A network error occurred. Please try again.', 'error');
    }
});

// Service Worker Registration (for PWA capabilities)
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

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Close modals with Escape
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        const activeLightbox = document.querySelector('.lightbox.active');
        
        if (activeModal) {
            closeModal(activeModal.id);
        } else if (activeLightbox) {
            closeLightbox();
        }
    }
    
    // Navigate testimonials with arrow keys
    if (e.key === 'ArrowLeft') {
        const testimonialSection = document.querySelector('.testimonials');
        if (isElementInViewport(testimonialSection)) {
            changeTestimonial(-1);
        }
    } else if (e.key === 'ArrowRight') {
        const testimonialSection = document.querySelector('.testimonials');
        if (isElementInViewport(testimonialSection)) {
            changeTestimonial(1);
        }
    }
});

// Utility Functions
function isElementInViewport(el) {
    if (!el) return false;
    
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimize scroll events
const optimizedScrollHandler = throttle(() => {
    updateActiveNavLink();
    toggleBackToTop();
}, 100);

window.addEventListener('scroll', optimizedScrollHandler);

// Resize handler
const optimizedResizeHandler = debounce(() => {
    // Reinitialize cursor on resize
    if (window.innerWidth > 768) {
        initializeCursor();
    }
}, 250);

window.addEventListener('resize', optimizedResizeHandler);

// Export functions for global access
window.openModal = openModal;
window.closeModal = closeModal;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.scrollToSection = scrollToSection;
window.scrollToTop = scrollToTop;
window.changeTestimonial = changeTestimonial;
window.currentTestimonial = currentTestimonial;
window.playVideo = playVideo;
window.closeToast = closeToast;