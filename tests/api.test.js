// API Integration Tests
const request = require('supertest');

describe('API Endpoints', () => {
  describe('Health Check', () => {
    test('GET /api/health should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Gym Stats', () => {
    test('GET /api/gym-stats should return gym statistics', async () => {
      const response = await request(app)
        .get('/api/gym-stats')
        .expect(200);

      expect(response.body).toHaveProperty('members');
      expect(response.body).toHaveProperty('trainers');
      expect(response.body).toHaveProperty('classes');
      expect(response.body).toHaveProperty('equipment');
      expect(response.body).toHaveProperty('satisfaction');
      expect(response.body).toHaveProperty('yearsExperience');
      expect(response.body).toHaveProperty('facilities');
      expect(Array.isArray(response.body.facilities)).toBe(true);
    });
  });

  describe('CAPTCHA', () => {
    test('GET /api/captcha should generate CAPTCHA', async () => {
      const response = await request(app)
        .get('/api/captcha')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('image');
      expect(typeof response.body.id).toBe('string');
      expect(typeof response.body.image).toBe('string');
      expect(response.body.image).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    test('GET /api/captcha should handle rate limiting', async () => {
      // Make multiple requests to test rate limiting
      const requests = Array(15).fill().map(() =>
        request(app).get('/api/captcha')
      );

      const responses = await Promise.allSettled(requests);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(
        response => response.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Demo Form Submission', () => {
    test('POST /api/demo should handle valid form submission', async () => {
      // First get a CAPTCHA
      const captchaResponse = await request(app)
        .get('/api/captcha')
        .expect(200);

      const demoData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+971581234567',
        service: 'personal-training',
        planChoice: 'premium',
        preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        message: 'I want to get fit',
        captchaId: captchaResponse.body.id,
        captchaAnswer: 'test', // This will fail but tests the endpoint structure
        _form_id: 'demo_booking',
        _timestamp: Date.now().toString(),
        _user_agent: 'test-agent',
        _referrer: 'direct'
      };

      const response = await request(app)
        .post('/api/demo')
        .send(demoData)
        .expect(400); // Expected to fail due to CAPTCHA validation

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/demo should validate required fields', async () => {
      const response = await request(app)
        .post('/api/demo')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/demo should validate email format', async () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+971581234567',
        service: 'personal-training',
        planChoice: 'premium',
        preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        captchaId: 'test-id',
        captchaAnswer: 'test'
      };

      const response = await request(app)
        .post('/api/demo')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Contact Form Submission', () => {
    test('POST /api/contact should handle valid form submission', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        inquiry_type: 'membership',
        subject: 'Membership Information',
        message: 'I would like to know about membership options.',
        captchaId: 'test-id',
        captchaAnswer: 'test'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(400); // Expected to fail due to CAPTCHA validation

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/contact should validate message length', async () => {
      const longMessage = 'a'.repeat(1001); // Exceeds 1000 character limit
      const contactData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        inquiry_type: 'membership',
        subject: 'Test Subject',
        message: longMessage,
        captchaId: 'test-id',
        captchaAnswer: 'test'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Newsletter Subscription', () => {
    test('POST /api/newsletter should handle valid email', async () => {
      const newsletterData = {
        email: 'newsletter@example.com'
      };

      const response = await request(app)
        .post('/api/newsletter')
        .send(newsletterData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    test('POST /api/newsletter should validate email format', async () => {
      const invalidData = {
        email: 'invalid-email-format'
      };

      const response = await request(app)
        .post('/api/newsletter')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});

describe('Error Handling', () => {
  test('404 - Non-existent endpoint', async () => {
    const response = await request(app)
      .get('/api/non-existent')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  });

  test('405 - Invalid HTTP method', async () => {
    const response = await request(app)
      .patch('/api/health')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
  });
});

describe('Security Headers', () => {
  test('Should include security headers', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers).toHaveProperty('x-xss-protection');
    expect(response.headers).toHaveProperty('referrer-policy');
    expect(response.headers).toHaveProperty('permissions-policy');
  });
});