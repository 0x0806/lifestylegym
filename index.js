
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
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
            upgradeInsecureRequests: [],
        },
    },
}));

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
