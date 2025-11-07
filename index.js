
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const Joi = require('joi');
const DOMPurify = require('isomorphic-dompurify');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced logging configuration
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'lifestyle-gym' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Enhanced security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            mediaSrc: ["'self'", "blob:"],
            connectSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Session-based CAPTCHA storage
const captchaStore = new Map();

// Generate secure CAPTCHA
function generateCaptcha() {
    const captcha = {
        id: crypto.randomBytes(16).toString('hex'),
        text: '',
        type: 'text',
        createdAt: Date.now()
    };

    // Generate random text
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    for (let i = 0; i < 6; i++) {
        captcha.text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    captchaStore.set(captcha.id, captcha);

    // Clean up old CAPTCHAs
    setTimeout(() => {
        captchaStore.delete(captcha.id);
    }, 5 * 60 * 1000); // 5 minutes

    return captcha;
}

// Enhanced Joi validation schemas
const demoSchema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .pattern(/^[A-Za-z\s]+$/)
        .required()
        .messages({
            'string.empty': 'First name is required',
            'string.min': 'First name must be at least 2 characters',
            'string.max': 'First name cannot exceed 50 characters',
            'string.pattern.base': 'First name can only contain letters and spaces'
        }),
    lastName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .pattern(/^[A-Za-z\s]+$/)
        .required()
        .messages({
            'string.empty': 'Last name is required',
            'string.min': 'Last name must be at least 2 characters',
            'string.max': 'Last name cannot exceed 50 characters',
            'string.pattern.base': 'Last name can only contain letters and spaces'
        }),
    email: Joi.string()
        .email()
        .max(100)
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.max': 'Email cannot exceed 100 characters',
            'any.required': 'Email is required'
        }),
    phone: Joi.string()
        .pattern(/^[+]?[0-9]{7,15}$/)
        .required()
        .messages({
            'string.pattern.base': 'Phone number must be valid (7-15 digits, optional +)',
            'any.required': 'Phone number is required'
        }),
    service: Joi.string()
        .valid('personal-training', 'group-classes', 'ladies-section', 'home-training', 'general-fitness')
        .required()
        .messages({
            'any.only': 'Please select a valid service type',
            'any.required': 'Service selection is required'
        }),
    planChoice: Joi.string()
        .valid('basic', 'premium', 'vip-single', 'vip-couple')
        .required()
        .messages({
            'any.only': 'Please select a valid membership plan',
            'any.required': 'Membership plan selection is required'
        }),
    preferredDate: Joi.date()
        .min('now')
        .max(Joi.ref('maxDate'))
        .required()
        .messages({
            'date.min': 'Preferred date must be in the future',
            'any.required': 'Preferred date is required'
        }),
    message: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .optional(),
    captchaId: Joi.string().required(),
    captchaAnswer: Joi.string().required()
});

const contactSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .pattern(/^[A-Za-z\s]+$/)
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 100 characters',
            'string.pattern.base': 'Name can only contain letters and spaces'
        }),
    email: Joi.string()
        .email()
        .max(100)
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.max': 'Email cannot exceed 100 characters',
            'any.required': 'Email is required'
        }),
    inquiry_type: Joi.string()
        .valid('membership', 'personal-training', 'classes', 'facilities', 'pricing', 'complaint', 'other')
        .required()
        .messages({
            'any.only': 'Please select a valid inquiry type',
            'any.required': 'Inquiry type is required'
        }),
    subject: Joi.string()
        .trim()
        .min(5)
        .max(150)
        .required()
        .messages({
            'string.empty': 'Subject is required',
            'string.min': 'Subject must be at least 5 characters',
            'string.max': 'Subject cannot exceed 150 characters'
        }),
    message: Joi.string()
        .trim()
        .min(10)
        .max(1000)
        .required()
        .messages({
            'string.empty': 'Message is required',
            'string.min': 'Message must be at least 10 characters',
            'string.max': 'Message cannot exceed 1000 characters'
        }),
    captchaId: Joi.string().required(),
    captchaAnswer: Joi.string().required()
});

// Enhanced security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
});

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
    credentials: true
}));

app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

const formLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 form submissions per hour
    message: 'Too many form submissions, please try again later.'
});

app.use(limiter);

// Middleware to parse form data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Serve static files with caching
app.use(express.static(__dirname, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    etag: true,
    lastModified: true
}));

// Email transporter setup
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Validation middleware
const demoValidation = [
    body('name').trim().isLength({ min: 2, max: 50 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('phone').isMobilePhone().optional(),
    body('preferredDate').isISO8601().toDate(),
    body('preferredTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('goals').trim().isLength({ min: 10, max: 500 }).escape(),
    body('experience').isIn(['beginner', 'intermediate', 'advanced'])
];

const contactValidation = [
    body('name').trim().isLength({ min: 2, max: 50 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('phone').isMobilePhone().optional(),
    body('subject').trim().isLength({ min: 5, max: 100 }).escape(),
    body('message').trim().isLength({ min: 10, max: 1000 }).escape()
];

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoints
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api/gym-stats', (req, res) => {
    res.json({
        members: 2847,
        trainers: 23,
        classes: 156,
        equipment: 89,
        satisfaction: 98.5
    });
});

// Handle demo form submission with advanced validation
app.post('/submit-demo', formLimiter, demoValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { name, email, phone, preferredDate, preferredTime, goals, experience } = req.body;
        
        console.log(`Demo booking from: ${name} (${email}) - ${new Date().toISOString()}`);
        
        // Send confirmation email
        if (process.env.SMTP_USER) {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Demo Session Confirmation - New Lifestyle Gym',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ff6b35;">Demo Session Confirmed!</h2>
                        <p>Hi ${name},</p>
                        <p>Thank you for booking a demo session with New Lifestyle Gym!</p>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>Session Details:</h3>
                            <p><strong>Date:</strong> ${new Date(preferredDate).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> ${preferredTime}</p>
                            <p><strong>Experience Level:</strong> ${experience}</p>
                        </div>
                        <p>We'll contact you soon to confirm the final details.</p>
                        <p>Best regards,<br>New Lifestyle Gym Team</p>
                    </div>
                `
            };
            
            await transporter.sendMail(mailOptions);
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json({ success: true, message: 'Demo session booked successfully!' });
        } else {
            res.redirect('/?success=demo');
        }
    } catch (error) {
        console.error('Demo submission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error. Please try again later.' 
        });
    }
});

// Handle contact form submission with advanced validation
app.post('/submit-contact', formLimiter, contactValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { name, email, phone, subject, message } = req.body;
        
        console.log(`Contact message from: ${name} (${email}) - Subject: ${subject} - ${new Date().toISOString()}`);
        
        // Send confirmation email
        if (process.env.SMTP_USER) {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Message Received - New Lifestyle Gym',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ff6b35;">Thank You for Contacting Us!</h2>
                        <p>Hi ${name},</p>
                        <p>We've received your message and will get back to you within 24 hours.</p>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3>Your Message:</h3>
                            <p><strong>Subject:</strong> ${subject}</p>
                            <p><strong>Message:</strong> ${message}</p>
                        </div>
                        <p>Best regards,<br>New Lifestyle Gym Team</p>
                    </div>
                `
            };
            
            await transporter.sendMail(mailOptions);
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json({ success: true, message: 'Message sent successfully!' });
        } else {
            res.redirect('/?success=contact');
        }
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error. Please try again later.' 
        });
    }
});

// Newsletter subscription endpoint
app.post('/api/newsletter', [
    body('email').isEmail().normalizeEmail()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { email } = req.body;
        console.log(`Newsletter subscription: ${email} - ${new Date().toISOString()}`);
        
        // Send welcome email
        if (process.env.SMTP_USER) {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Welcome to New Lifestyle Gym Newsletter!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #ff6b35;">Welcome to Our Community!</h2>
                        <p>Thank you for subscribing to our newsletter!</p>
                        <p>You'll receive the latest updates about:</p>
                        <ul>
                            <li>New fitness programs and classes</li>
                            <li>Health and nutrition tips</li>
                            <li>Special offers and promotions</li>
                            <li>Success stories from our members</li>
                        </ul>
                        <p>Stay fit, stay healthy!</p>
                        <p>Best regards,<br>New Lifestyle Gym Team</p>
                    </div>
                `
            };
            
            await transporter.sendMail(mailOptions);
        }

        res.json({ success: true, message: 'Successfully subscribed to newsletter!' });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error. Please try again later.' 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!' 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 New Lifestyle Gym website running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log(`📧 Email configured: ${process.env.SMTP_USER ? 'Yes' : 'No'}`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});
