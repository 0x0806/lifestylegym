# New Lifestyle Gym - Production Ready Web Application

A professional fitness website built with Node.js, Express, and modern web technologies, designed for New Lifestyle Gym in Sharjah, UAE.

## 🚀 Features

### Core Functionality
- **Responsive Design**: Mobile-first approach with seamless user experience across all devices
- **Advanced CAPTCHA System**: Multi-type CAPTCHA (text, math, selection, audio) with accessibility features
- **Secure Form Handling**: Backend API integration with comprehensive validation and sanitization
- **Email Notifications**: Professional HTML email templates for form submissions
- **Multi-language Support**: English and Arabic language capabilities
- **SEO Optimized**: Comprehensive meta tags, structured data, and local SEO implementation

### Security Features
- **Input Validation**: Joi schema validation for all form inputs
- **Rate Limiting**: Multi-level rate limiting (API, forms, CAPTCHA)
- **Security Headers**: Complete helmet.js configuration with CSP, HSTS, and security headers
- **XSS Protection**: DOMPurify sanitization and content security policy
- **CSRF Protection**: Token-based CSRF prevention
- **Data Sanitization**: Comprehensive input and output sanitization

### Performance Features
- **Static File Caching**: Long-term caching for assets with ETag support
- **Compression**: Gzip compression for optimal transfer speeds
- **Performance Monitoring**: Request timing and performance logging
- **Image Optimization**: WebP support and responsive images
- **Lazy Loading**: Optimized loading for better performance

### Production Features
- **Docker Support**: Complete Docker configuration with multi-stage builds
- **Nginx Configuration**: Production-ready reverse proxy with SSL termination
- **Redis Integration**: Session storage and caching with Redis
- **Process Management**: PM2 configuration for clustering and monitoring
- **Automated Deployment**: Shell scripts for automated deployment and backup
- **Health Monitoring**: Health check endpoints and monitoring capabilities

## 🛠️ Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Joi**: Data validation library
- **Nodemailer**: Email sending service
- **Winston**: Logging library
- **Helmet**: Security middleware
- **Rate Limiting**: Express rate limiting
- **DOMPurify**: HTML sanitization

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern CSS with animations and transitions
- **HTML5**: Semantic HTML5 structure
- **Font Awesome**: Icon library
- **Google Fonts**: Typography

### Development & Deployment
- **Docker & Docker Compose**: Containerization
- **Nginx**: Reverse proxy and static file serving
- **Redis**: Session storage and caching
- **PM2**: Process management
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 📁 Project Structure

```
lifestylegym/
├── index.js                 # Main application file
├── backend-integration.js   # Backend API integration
├── script.js               # Frontend functionality
├── style.css               # Stylesheets
├── index.html              # Main HTML file
├── package.json            # Dependencies and scripts
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Docker image configuration
├── nginx.conf              # Nginx configuration
├── redis.conf              # Redis configuration
├── deploy.sh               # Deployment script
├── .env.example            # Environment variables template
├── .env.production.example # Production environment template
├── .gitignore              # Git ignore rules
├── .deployignore            # Deployment ignore rules
├── jest.config.js          # Jest testing configuration
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── process-manager.json    # PM2 configuration
└── tests/                  # Test files
    ├── setup.js            # Test setup
    └── api.test.js         # API tests
```

## 🚀 Quick Start

### Development Environment

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd lifestylegym
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open browser**: Navigate to `http://localhost:5000`

### Production Deployment

#### Option 1: Direct Node.js Deployment

1. **Install PM2 globally**:
```bash
npm install -g pm2
```

2. **Set up production environment**:
```bash
cp .env.production.example .env.production
# Edit .env.production with production values
```

3. **Start application with PM2**:
```bash
npm run pm2:start
```

#### Option 2: Docker Deployment

1. **Build and run with Docker Compose**:
```bash
npm run docker:compose
```

2. **View logs**:
```bash
npm run docker:compose:logs
```

#### Option 3: Automated Deployment

1. **Configure deployment settings** in `deploy.sh`

2. **Run deployment script**:
```bash
chmod +x deploy.sh
npm run deploy
```

## 🔧 Configuration

### Environment Variables

#### Required Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Application port
- `FRONTEND_URL`: Frontend URL for CORS
- `SMTP_HOST`: Email server host
- `SMTP_USER`: Email server username
- `SMTP_PASS`: Email server password

#### Security Variables
- `SESSION_SECRET`: Session encryption secret
- `JWT_SECRET`: JWT signing secret
- `BCRYPT_ROUNDS`: Bcrypt salt rounds

#### Optional Variables
- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port
- `GOOGLE_ANALYTICS_ID`: Google Analytics tracking ID
- `SENTRY_DSN`: Sentry error tracking DSN

### SSL Configuration

For production deployment, you'll need SSL certificates. Update the following files:

1. **Nginx SSL paths** in `nginx.conf`
2. **Docker volumes** in `docker-compose.yml`
3. **Environment variables** in `.env.production`

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Security Audit
```bash
# Check for security vulnerabilities
npm run security:audit

# Fix security vulnerabilities
npm run security:fix
```

## 📊 Monitoring

### Health Check
```bash
# Check application health
npm run health
curl http://localhost:5000/api/health
```

### PM2 Monitoring
```bash
# View PM2 status
npm run pm2:monit

# View logs
npm run pm2:logs
```

### Docker Monitoring
```bash
# View container status
docker ps

# View logs
npm run docker:compose:logs
```

## 🔒 Security Features

### Implemented Security Measures

1. **Input Validation**: Joi schema validation for all user inputs
2. **XSS Protection**: DOMPurify sanitization and CSP headers
3. **CSRF Protection**: Token-based CSRF prevention
4. **Rate Limiting**: Multiple rate limiting strategies
5. **Security Headers**: Comprehensive security headers configuration
6. **Password Security**: Bcrypt hashing with configurable rounds
7. **Session Security**: Secure session management with Redis

### Security Best Practices

1. **Environment Variables**: Sensitive data stored in environment variables
2. **Input Sanitization**: All user inputs sanitized and validated
3. **Error Handling**: Secure error handling without information leakage
4. **HTTPS Enforcement**: HSTS headers for HTTPS enforcement
5. **API Security**: Rate limiting and CORS configuration

## 📈 Performance Optimization

### Implemented Optimizations

1. **Static File Caching**: Long-term caching for assets
2. **Compression**: Gzip compression for all responses
3. **Image Optimization**: WebP support and responsive images
4. **Lazy Loading**: Optimized loading strategies
5. **Database Optimization**: Efficient query patterns
6. **Memory Management**: Memory leak prevention and monitoring

### Performance Monitoring

1. **Request Timing**: Track request processing times
2. **Memory Usage**: Monitor memory consumption
3. **Response Times**: API response time tracking
4. **Error Rates**: Error rate monitoring

## 📝 API Documentation

### Endpoints

#### Health Check
- `GET /api/health` - Application health status
- `GET /api/gym-stats` - Gym statistics

#### CAPTCHA
- `GET /api/captcha` - Generate new CAPTCHA

#### Forms
- `POST /api/demo` - Submit demo booking form
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter` - Subscribe to newsletter

### Rate Limiting

- **API**: 200 requests per 15 minutes
- **Forms**: 5 submissions per hour
- **CAPTCHA**: 10 requests per 5 minutes

## 🚀 Deployment Process

### Pre-deployment Checklist

1. [ ] Environment variables configured
2. [ ] SSL certificates installed
3. [ ] Database connections tested
4. [ ] Email configuration verified
5. [ ] Security audit passed
6. [ ] Performance tests passed
7. [ ] Backup procedures in place

### Deployment Steps

1. **Code Review**: Review all code changes
2. **Testing**: Run comprehensive test suite
3. **Security Audit**: Run security vulnerability scan
4. **Backup**: Create application backup
5. **Deployment**: Deploy using preferred method
6. **Verification**: Verify deployment success
7. **Monitoring**: Set up monitoring and alerts

## 🛠️ Maintenance

### Regular Tasks

1. **Security Updates**: Update dependencies regularly
2. **Backup Verification**: Verify backup integrity
3. **Performance Monitoring**: Monitor application performance
4. **Log Review**: Review application logs
5. **SSL Certificate Renewal**: Renew SSL certificates before expiry

### Troubleshooting

#### Common Issues

1. **Application Not Starting**: Check environment variables and dependencies
2. **Database Connection**: Verify database configuration and connectivity
3. **Email Not Sending**: Check SMTP configuration and credentials
4. **High Memory Usage**: Monitor for memory leaks and optimize
5. **Slow Response Times**: Check database queries and implement caching

## 📞 Support

For support and maintenance:

- **Email**: newlifeconnection1@gmail.com
- **Phone**: +971581790093
- **Location**: Al Tayer 5, 19 street G Floor, Al Nahda, Sharjah, UAE 61179

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Security Guide](./docs/security.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

---

**New Lifestyle Gym** - Transform Your Lifestyle, Train Like a Champion 🏋️‍♂️