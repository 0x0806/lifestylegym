
// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }, 1500);
});

// Navigation functionality
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// Scroll effect for navbar
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

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
    rootMargin: '0px 0px -50px 0px'
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
            const target = parseInt(counter.textContent.replace(/\D/g, ''));
            animateCounter(counter, target, 2000);
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

// Form handling
const demoForm = document.getElementById('demoForm');
const contactForm = document.getElementById('contactForm');
const modal = document.getElementById('successModal');

// Demo form submission
demoForm.addEventListener('submit', handleFormSubmit);
contactForm.addEventListener('submit', handleFormSubmit);

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Reset form
        e.target.reset();
        
        // Show success modal
        showModal();
        
        // Log form data (in real implementation, send to server)
        console.log('Form submitted:', data);
    }, 2000);
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

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

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
const backToTopBtn = document.getElementById('backToTop');

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

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-card');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

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

// Performance optimization
function optimizePerformance() {
    // Debounce scroll events
    let scrollTimer;
    const originalScrollHandler = window.onscroll;
    
    window.addEventListener('scroll', () => {
        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            if (originalScrollHandler) originalScrollHandler();
        }, 16); // 60fps
    });
    
    // Preload critical images
    const criticalImages = [
        // Add image URLs that need to be preloaded
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

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

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('New Lifestyle Gym website loaded successfully!');
    
    // Set minimum date for demo booking to today
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    // Initialize any additional components
    // This is where you would initialize other features like:
    // - Workout tracking
    // - Nutrition calculator
    // - Progress tracking
    // - Social features
    // - etc.
});
