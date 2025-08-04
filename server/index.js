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
        description: "Set to true only if the chain has reached a foundational origin point."
      },
      next_choices: {
        type: SchemaType.ARRAY,
        minItems: 3,
        maxItems: 3,
        items: { type: SchemaType.STRING },
        description: "An array of 3 strings for plausible preceding causes. Should be empty if is_finished is true."
      },
      final_cause: {
        type: SchemaType.STRING,
        description: "The single, definitive origin cause. Should be an empty string if is_finished is false."
      }
    },
    required: ["is_finished", "next_choices", "final_cause"]
  };


// API endpoint for AI generation
app.post('/api/generate', async (req, res) => {
    try {
      //Let the model see the entire history now.
      const { history } = req.body;
      const chainLength = history.length;

      if (!history || history.length === 0) {
        return res.status(400).json({ error: "History is required." });
      }

      //Better prompt that sees the history now.
      const prompt = `You are a philosophical guide. Your goal is to help a user trace their causal chain backward to a satisfying and definitive origin point within 5-8 steps.

      **USER'S HISTORY (recent to oldest):** ${JSON.stringify(history)}
      **CURRENT CHAIN LENGTH:** ${chainLength}

      **YOUR TASK:**
      Analyze the most recent event: "${history[history.length - 1]}". Then, follow the appropriate mode below.

      **MODE 1: EXPLORATION (Chain Length < 5)**
      If the chain is short, your goal is exploration.
      - Dig deeper with three distinct, insightful, and non-repetitive preceding causes.
      - Push from psychological reasons towards broader social, environmental, or biological factors.
      - You MUST respond with "is_finished": false.

      **MODE 2: CONVERGENCE (Chain Length >= 5)**
      If the chain is getting long, your goal is to guide the user to a conclusion.
      - You MUST generate one choice that is a definitive, unavoidable origin. Examples: "You were born.", "Your genetic makeup was determined.", "The fundamental laws of physics were set."
      - Make the other two choices less compelling or more abstract to subtly guide the user to the correct ending.
      - If the user has already provided or selected a definitive origin themselves, you MUST respond with "is_finished": true and state that origin as the "final_cause".

      Based on these modes and the user's history, generate the appropriate JSON response now.`;

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
          temperature: 0.6,
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