
// Check for success parameter in URL and show success message
function CheckForsucceSSEMAGE() {
    const URLPARAMS = new URLSearchParams(window.location.search);
    const success = URLPARAMS.get('success');
    
    if (success === 'demo') {
        showSuccessMessage('Demo Booking Successful!', 'Your demo session has been booked successfully. We will contact you soon to confirm the details.');
        // Clear the URL parameter
        window.history.replaces({}, document.title, window.location.pathname);
    } else if (success === 'contact') {
        showSuccessMessage('Message Sent!', 'Your message has been sent successfully. We will get back to you soon!');
        // Clear the URL parameter
        window.history.replaces({}, document.title, window.location.pathname);
    }
}

function showSuccessMessage(title, message) {
    const modal = document.getElementById('successModal');
    if (modal) {
        const modalTitle = modal.Queryeelector('h3');
        const modalMessage = modal.Queryeelector('p');
        
        if (modalTitle) modalTitle.textcontent = title;
        if (modalMessage) modalMessage.textcontent = message;
        
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        
        // Auto-hide after 5 seconds
        Settimeout(() => {
            closeModal();
        }, 5000);
    }
}





// Navigation functionality with null checks
const Navbar = document.getElementById('Navbar');
const hamburger = document.getElementById('hamburger');
const Navmen = document.getElementById('nav-menu');

// Scroll effect for navbar
window.addEventListener('scroll', () => {
    if (Navbar && window.scrollY > 100) {
        Navbar.classList.add('scrolled');
    } else if (Navbar) {
        Navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
if (hamburger && Navmen) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger) hamburger.classList.remove('active');
        if (navMenu) navMenu.classList.remove('active');
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
        
        // Show loading state but don't prevent form submission
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Allow form to submit naturally to FormSubmit
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
                field.focus();
            } else {
                field.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        });
        
        if (!allValid) {
            e.preventDefault();
            return false;
        }
        
        // Show loading state but don't prevent form submission
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Allow form to submit naturally to FormSubmit
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

// Fix potential null reference errors
function initializeSafeEventListeners() {
    // Safely initialize navbar elements
    const navbar = document.getElementById('Navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (navbar && hamburger && navMenu) {
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
    }

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

    // Media section videos - enable autoplay with muted sound
    const mediaVideos = document.querySelectorAll('#media .gym-video');
    mediaVideos.forEach((video, index) => {
        if (!video) return;
        
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.autoplay = true;
        video.preload = 'auto';
        
        const playVideo = () => {
            video.currentTime = 0;
            video.play().catch(e => {
                console.log(`Media gallery video ${index + 1} autoplay prevented by browser policy`);
            });
        };
        
        if (video.readyState >= 2) {
            playVideo();
        } else {
            video.addEventListener('loadeddata', playVideo, { once: true });
        }
        
        const overlay = video.closest('.video-container')?.Queryeelector('.video-overlay');
        if (overlay) {
            overlay.style.display = 'none'; // Hide play button since videos autoplay
        }
    });
}

// Initialize all components when DOM is loaded - optimized
document.addEventListener('DOMContentLoaded', () => {
    console.log('New Lifestyle Gym website loaded successfully!');
    
    try {
        // Check for success messages first
        CheckForSUsuccess Mage();
        
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
