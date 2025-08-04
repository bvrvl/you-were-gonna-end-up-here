//load env variables first
require('dotenv').config();

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

//Middleware that parses json bodies from the frontend
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// API endpoint for AI generation
app.post('/api/generate', async (req, res) => {
    try {

      const { cause, chainLength } = req.body;

      // Prompt aware of the chain's depth. AI can generate more fundamental causes as the chain grows
      const prompt = `A user's journey is being traced backward. We are ${chainLength} steps deep. The last known step is: "${cause}"

    What is a plausible preceding cause for that? Generate 3 distinct and brief options that dig deeper into personal, social, or biological reasons. As the number of steps increases, the reasons should become more fundamental.
    One of the options should eventually lead to birth or a similar foundational origin.

    Format the response ONLY as a numbered list, like this:
    1. First plausible cause.
    2. Second plausible cause.
    3. Third plausible cause.`;


      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite", 
        generationConfig: { temperature: 0.4 },
        thinkingConfig:{thinkingBudged: 0}
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the AI's response into an array
      // Filter out empty lines and split the text by new lines
      const choices = text.split('\n').filter(line => line.trim().length > 0 && line.includes('.'));

       // Send the structured array back to the frontend
       res.json({ next_choices: choices });
  
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: "Failed to generate text from API" });
    }
  });


//For local testing
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// export Express app instance to be used as a serverless function
module.exports = app;