
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle demo form submission
app.post('/submit-demo', (req, res) => {
    console.log('Demo form submitted:', req.body);
    
    // Log form data for debugging
    const { name, email, phone, preferredDate, preferredTime, goals, experience } = req.body;
    console.log(`Demo booking from: ${name} (${email})`);
    
    // Simulate form processing delay
    setTimeout(() => {
        // Redirect to homepage with success parameter
        res.redirect('/?success=demo');
    }, 1000);
});

// Handle contact form submission
app.post('/submit-contact', (req, res) => {
    console.log('Contact form submitted:', req.body);
    
    // Log form data for debugging
    const { name, email, phone, subject, message } = req.body;
    console.log(`Contact message from: ${name} (${email}) - Subject: ${subject}`);
    
    // Simulate form processing delay
    setTimeout(() => {
        // Redirect to homepage with success parameter
        res.redirect('/?success=contact');
    }, 1000);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`New Lifestyle Gym website running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});
