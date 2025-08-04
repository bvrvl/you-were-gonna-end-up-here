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

      //Better prompt that decides when to end. No more keywords now.
      const prompt = `
      You are the engine for a philosophical app. A user is tracing their causal chain backward.
      The user's last stated reason is: "${cause}".
      The chain is currently ${chainLength} steps long.

      Your Task:
      1. Analyze the user's reason. Decide if it has reached a truly foundational, unavoidable origin point (e.g., birth, the laws of physics, biological imperatives, consciousness itself).
      
      2. Respond with a valid JSON object ONLY. There are two possible formats for your response:

      - If the chain has NOT reached a foundational origin, generate 3 plausible preceding causes. The JSON object MUST be in this format:
      {
        "is_finished": false,
        "next_choices": [
          "1. A first plausible preceding cause.",
          "2. A second plausible preceding cause.",
          "3. A third plausible preceding cause."
        ]
      }

      - If the chain HAS reached a foundational origin, you MUST declare it finished. The JSON object MUST be in this format:
      {
        "is_finished": true,
        "final_cause": "The single, definitive origin you have identified (e.g., 'You were born.')."
      }

      Analyze the input "${cause}" and provide the appropriate JSON response now.`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite", 
        //JSON response
        generationConfig: { 
          temperature: 0.5,
          response_mime_type: "application/json",
          thinkingConfig: {thinkingBudget: 0}
        }
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;

      // The AI's response is a JSON string. We parse it and send it directly to the frontend.
      const aiResponseObject = JSON.parse(response.text());
      res.json(aiResponseObject);
  
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({ error: "Failed to generate text from API" });
    }
  });


//For local testing
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// export Express app instance to be used as a serverless function
module.exports = app;