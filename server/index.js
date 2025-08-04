//load env variables first
require('dotenv').config();

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

//Middleware that parses json bodies from the frontend
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Test API request route
app.get('api/test', (req, res) => {
    res.json({ message: "Hello from the server"});
});

// API endpoint for AI generation

app.post('/api/generate', async (req, res) => {
    try {
      // Test a simple prompt
      const prompt = "Why did I end up on this website? Give me one plausible, short reason.";
  
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite", generationConfig: {thinkingConfig: {thinkingBudget: 0}} });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
  
      // Send the AI's response back to the frontend
      res.json({ generated_text: text });
  
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: "Failed to generate text from API" });
    }
  });


//For local testing
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// export Express app instance to be used as a serverless function
module.exports = app;
