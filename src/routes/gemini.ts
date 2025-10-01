// src/routes/gemini.ts
import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

// Load environment variables from .env file
import 'dotenv/config';

const router = Router();

// Check for API key on startup
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

// Initialize the Google AI client with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @route   POST /api/gemini/generate
 * @desc    Generate content with Gemini
 * @access  Private
 */
router.post('/generate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Use a recent, powerful model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Send the generated text back to the client
    res.json({ generatedText: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

export default router;
