const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize the Express application
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to handle form submission
app.post('/register', (req, res) => {
    const { name, age, gender, condition } = req.body;

    // Here, you can add code to save the data to a database
    console.log('Patient Registration Data:', { name, age, gender, condition });

    // Sending a response back to the client
    res.status(200).send({ message: 'Patient registered successfully!', data: req.body });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
