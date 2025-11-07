
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
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Enhanced multi-level rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: 900
        });
    }
});

const formLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 form submissions per hour
    message: {
        error: 'Too many form submissions, please try again later.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip + ':' + (req.body._form_id || 'unknown');
    },
    handler: (req, res) => {
        logger.warn(`Form rate limit exceeded for IP: ${req.ip}, Form: ${req.body._form_id}`);
        res.status(429).json({
            error: 'Too many form submissions, please try again later.',
            retryAfter: 3600
        });
    }
});

const captchaLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // limit each IP to 10 CAPTCHA requests per 5 minutes
    message: {
        error: 'Too many CAPTCHA requests, please try again later.',
        retryAfter: 300
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`CAPTCHA rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many CAPTCHA requests, please try again later.',
            retryAfter: 300
        });
    }
});

app.use(apiLimiter);

// Enhanced input sanitization middleware
app.use((req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = DOMPurify.sanitize(req.body[key].trim());
            }
        });
    }
    next();
});

// Middleware to parse form data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Serve static files with caching and security
app.use(express.static(__dirname, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        // Security headers for static files
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Email transporter setup with enhanced security
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
});

// CAPTCHA validation function
function validateCaptcha(captchaId, answer) {
    const captcha = captchaStore.get(captchaId);
    if (!captcha) {
        return false;
    }

    // Check if CAPTCHA has expired (5 minutes)
    if (Date.now() - captcha.createdAt > 5 * 60 * 1000) {
        captchaStore.delete(captchaId);
        return false;
    }

    // Case-insensitive comparison
    const isValid = captcha.text.toLowerCase() === answer.toLowerCase();

    // Remove used CAPTCHA
    captchaStore.delete(captchaId);

    return isValid;
}

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Enhanced API endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

app.get('/api/gym-stats', (req, res) => {
    res.json({
        members: 12800,
        trainers: 15,
        classes: 50,
        equipment: 100,
        satisfaction: 98.5,
        yearsExperience: 15,
        facilities: ['24/7 Access', 'Ladies Section', 'Personal Training', 'Group Classes', 'Cardio Area', 'Weight Training']
    });
});

// CAPTCHA generation endpoint
app.get('/api/captcha', captchaLimiter, (req, res) => {
    try {
        const captcha = generateCaptcha();
        logger.info(`CAPTCHA generated: ${captcha.id} for IP: ${req.ip}`);

        res.json({
            id: captcha.id,
            image: `data:image/svg+xml;base64,${Buffer.from(`
                <svg width="150" height="50" xmlns="http://www.w3.org/2000/svg">
                    <rect width="150" height="50" fill="#f0f0f0"/>
                    <text x="75" y="30" font-family="Arial" font-size="20" text-anchor="middle" fill="#333">
                        ${captcha.text.split('').map(char =>
                            `<tspan x="${75 + (Math.random() - 0.5) * 20}" y="${30 + (Math.random() - 0.5) * 10}">${char}</tspan>`
                        ).join('')}
                    </text>
                    ${Array.from({length: 5}, () =>
                        `<line x1="${Math.random() * 150}" y1="${Math.random() * 50}" x2="${Math.random() * 150}" y2="${Math.random() * 50}" stroke="#ccc" stroke-width="1"/>`
                    ).join('')}
                </svg>
            `).toString('base64')}`
        });
    } catch (error) {
        logger.error('CAPTCHA generation error:', error);
        res.status(500).json({ error: 'Failed to generate CAPTCHA' });
    }
});

// Enhanced demo form submission with Joi validation
app.post('/api/demo', formLimiter, async (req, res) => {
    const startTime = Date.now();

    try {
        logger.info(`Demo submission attempt from IP: ${req.ip}`, {
            userAgent: req.get('User-Agent'),
            body: { ...req.body, email: req.body.email ? 'masked' : undefined }
        });

        // Validate CAPTCHA first
        if (!validateCaptcha(req.body.captchaId, req.body.captchaAnswer)) {
            logger.warn(`Invalid CAPTCHA for demo form from IP: ${req.ip}`);
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired CAPTCHA. Please try again.',
                field: 'captcha'
            });
        }

        // Validate with Joi schema
        const { error, value } = demoSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            logger.warn(`Demo validation failed from IP: ${req.ip}`, { errors: validationErrors });
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors: validationErrors
            });
        }

        const { firstName, lastName, email, phone, service, planChoice, preferredDate, message } = value;
        const fullName = `${firstName} ${lastName}`;

        logger.info(`Demo booking from: ${fullName} (${email}) - Service: ${service}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Send confirmation email with enhanced template
        if (process.env.SMTP_USER) {
            try {
                const mailOptions = {
                    from: `"New Lifestyle Gym" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: '🏋️ Demo Session Confirmation - New Lifestyle Gym Sharjah',
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Demo Session Confirmation</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <div style="background: linear-gradient(135deg, #ff6b35, #ff8f65); padding: 30px; border-radius: 10px; text-align: center; color: white;">
                                <h1 style="margin: 0; font-size: 28px;">🏋️ Demo Session Confirmed!</h1>
                                <p style="margin: 10px 0 0 0; font-size: 18px;">New Lifestyle Gym - Sharjah</p>
                            </div>

                            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff6b35;">
                                <h2 style="color: #ff6b35; margin-top: 0;">Hello ${firstName} ${lastName}!</h2>
                                <p style="font-size: 16px;">Thank you for booking a demo session with <strong>New Lifestyle Gym</strong>! We're excited to help you start your fitness journey.</p>

                                <h3 style="color: #ff6b35; border-bottom: 2px solid #ff6b35; padding-bottom: 5px;">Session Details:</h3>
                                <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                                    <p><strong>📅 Preferred Date:</strong> ${new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p><strong>🎯 Service:</strong> ${service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                    <p><strong>💳 Membership Plan:</strong> ${planChoice.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                    <p><strong>📱 Phone:</strong> ${phone}</p>
                                    ${message ? `<p><strong>📝 Message:</strong> ${message}</p>` : ''}
                                </div>
                            </div>

                            <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745;">
                                <h3 style="color: #28a745; margin-top: 0;">What's Next?</h3>
                                <ul style="padding-left: 20px;">
                                    <li>Our team will contact you within <strong>24 hours</strong> to confirm your demo session</li>
                                    <li>We'll discuss your fitness goals and preferences</li>
                                    <li>You'll get a <strong>free tour</strong> of our state-of-the-art facilities</li>
                                    <li>Meet our expert personal trainers</li>
                                </ul>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://newlifestylegym.ae" style="background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                                    Visit Our Website
                                </a>
                            </div>

                            <div style="border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
                                <p><strong>New Lifestyle Gym</strong><br>
                                Al Tayer 5, 19 street G Floor, Al Nahda, Sharjah, UAE 61179<br>
                                📞 +971581790093 | 📧 newlifeconnection1@gmail.com</p>
                            </div>
                        </body>
                        </html>
                    `
                };

                await transporter.sendMail(mailOptions);
                logger.info(`Demo confirmation email sent to: ${email}`);

                // Send notification to gym
                const notificationMail = {
                    from: `"New Lifestyle Gym" <${process.env.SMTP_USER}>`,
                    to: process.env.SMTP_USER,
                    subject: `🏋️ New Demo Booking - ${fullName}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #ff6b35;">New Demo Booking Received!</h2>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                                <p><strong>Name:</strong> ${fullName}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Phone:</strong> ${phone}</p>
                                <p><strong>Service:</strong> ${service}</p>
                                <p><strong>Plan:</strong> ${planChoice}</p>
                                <p><strong>Preferred Date:</strong> ${new Date(preferredDate).toLocaleDateString()}</p>
                                <p><strong>IP Address:</strong> ${req.ip}</p>
                                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    `
                };

                await transporter.sendMail(notificationMail);

            } catch (emailError) {
                logger.error('Failed to send demo email:', emailError);
                // Continue with response even if email fails
            }
        }

        const processingTime = Date.now() - startTime;
        logger.info(`Demo form processed successfully in ${processingTime}ms`, {
            email: email,
            ip: req.ip
        });

        res.json({
            success: true,
            message: 'Demo session booked successfully! We will contact you within 24 hours to confirm your appointment.',
            processingTime: processingTime
        });

    } catch (error) {
        const processingTime = Date.now() - startTime;
        logger.error('Demo submission error:', {
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            processingTime: processingTime,
            body: req.body
        });

        res.status(500).json({
            success: false,
            error: 'Internal server error. Please try again later.',
            processingTime: processingTime
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
