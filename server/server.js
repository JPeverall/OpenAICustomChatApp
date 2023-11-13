// Import required modules.
const express = require('express');
const cors = require("cors");
const app = express();
require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");
const apiKey = `Your API Key`
const serverKey = `Your Server Key, if desired`

console.log("API Key:", apiKey);


// Enables CORS with specified settins. Allows for API calls from origin listed.
// For hosting on Azure as below, set CORS permissions in web-app also.
app.use(cors({
    origin: [
        'https://YourWebsite.com', // For production
        'http://localhost:3000'], // For local testing
    methods: ['GET', 'POST'],
    credentials: [true],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
}));

// Enable JSON body parsing for incoming requests
app.use(express.json());

// Define a GET endpoint for testing if server is live, which returns a simple message
app.get('/test', (req, res) => {
    res.send('Server is running...');
});

// Define a POST endpoint for the '/api' path to handle OpenAI API requests
app.post("/api", async (req, res) => {

    

    try {
        // Extract model and messages from the request body (defined in fetch request)
        const { model, messages } = req.body;

        

        // Create an OpenAI API configuration with the API key.
        // If hosting on Azure, must add APIKEY to web-app application settings. It will not load from .env file.
        // Web-app > Settings > Configuration > + New application settings
        const configuration = new Configuration({
            apiKey: `${apiKey}`,
        });

        // Initialize the OpenAI API client
        const openai = new OpenAIApi(configuration);

        // Make a chat completion request to the OpenAI API
        const response = await openai.createChatCompletion({
            model: model,
            messages: messages
        });

        // Return the response message and token usage (for monitoring of usage limitations)
        res.json({
            message: response.data.choices[0].message.content,
            tokens: response.data.usage.total_tokens,
        });

    } catch (error) {
        // Log error and return a 500 status code with a descriptive message
        console.error("Error in the /api endpoint:", error);
        
        res.status(500).send("Internal Server Error. OpenAI API call failed.")
    }
});

// Define a POST endpoint for the '/api/get-image' path to handle request to local server
app.get("/api/get-image", async (req, res) => {

    const prompt = req.query.prompt;

    try {
        const response = await fetch(`https://YourWebsite.com?prompt=${prompt}`, { // I use locally hosted Python server. If PC specs are not sufficient, consider using web-based image generation APIs.
            method: 'GET',
            headers: {
                'Authorization': 'Bearer' + serverKey
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`)
        }
        const result = await response.text();
        res.send(result);
    }
    catch (error) {
        // Log error and return a 500 status code with a descriptive message
        console.error("Error in the /api/get-image endpoint:", error);
        res.status(500).send("Internal Server Error. API call to remote server failed.")
    }
});


// Start the server on the specified port, or port defined by Azure environment (process.env.PORT)
const port = process.env.PORT || 8080
app.listen(port, () => { console.log("Server start on Port 8080") });