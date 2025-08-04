//load env variables first
require('dotenv').config();

const express = require('express');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const app = express();

//Middleware that parses json bodies from the frontend
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//Adding a strict, structured output
const causalChainSchema = {
    type: SchemaType.OBJECT,
    propertyOrdering: ["is_finished", "next_choices", "final_cause"],
    properties: {
      is_finished: {
        type: SchemaType.BOOLEAN,
        description: "…"
      },
      next_choices: {
        type: SchemaType.ARRAY,
        minItems: 3,
        maxItems: 3,
        items: { type: SchemaType.STRING },
        description: "…"
      },
      final_cause: {
        type: SchemaType.STRING,
        description: "…"
      }
    },
    required: ["is_finished", "next_choices", "final_cause"]
  };


// API endpoint for AI generation
app.post('/api/generate', async (req, res) => {
    try {
      //Let the model see the entire history now.
      const { history } = req.body;

      if (!history || history.length === 0) {
        return res.status(400).json({ error: "History is required." });
      }

      //Better prompt that sees the history now.
      const prompt = `You are a philosophical engine tracing a user's causal chain backward. 
      Their history, from recent to oldest, is: ${JSON.stringify(history)}.
      Analyze their most recent reason: "${history[history.length - 1]}".
      
      Decide if this reason has reached a foundational origin (like birth, genetics, etc.).
      - If it has, your response should indicate the chain is finished and provide the final cause.
      - If it has not, provide three new plausible preceding causes.`;;

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
          temperature: 0.5,
          responseMimeType: "application/json",
          responseSchema: causalChainSchema
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