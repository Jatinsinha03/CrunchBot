import { NextApiRequest, NextApiResponse } from 'next';
import { callGemini } from '../../../lib/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const headingPrompt = `
    You are a helpful assistant that creates short, descriptive headings for NFT analytics chat conversations.
    
    Given a user's query about NFT analytics, create a concise heading (maximum 50 characters) that summarizes what the user is asking about.
    
    Examples:
    - "Show me BAYC sales trends" → "BAYC Sales Trends"
    - "What's the floor price of CryptoPunks?" → "CryptoPunks Floor Price"
    - "Analyze whale activity in Doodles" → "Doodles Whale Activity"
    - "Compare volume between collections" → "Collection Volume Comparison"
    
    Make the heading:
    - Short and descriptive (max 50 chars)
    - Focus on the main topic/collection
    - Use title case
    - Avoid technical jargon
    - Be specific but concise
    
    Return only the heading text, nothing else.
    `;

    const heading = await callGemini([
      { role: "system", content: headingPrompt },
      { role: "user", content: `User query: ${query}` },
    ]);

    // Clean up the response and ensure it's within character limit
    const cleanHeading = heading.trim().replace(/^["']|["']$/g, '').substring(0, 50);

    res.status(200).json({ heading: cleanHeading });

  } catch (error) {
    console.error('Generate heading error:', error);
    res.status(500).json({ error: 'Failed to generate heading' });
  }
} 