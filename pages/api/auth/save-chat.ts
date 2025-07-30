import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const userId = decoded.userId;

    const { sessionId, heading, role, content, time, graph } = req.body;

    if (!role || !content || !time) {
      return res.status(400).json({ error: 'role, content, and time are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If sessionId is provided, append to that session
    if (sessionId) {
      const session = user.sessions.id(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      session.messages.push({ role, content, time, graph });
      await user.save();
      return res.status(200).json({ message: 'Message added to session', sessionId });
    }

    // Otherwise, create a new session
    if (!heading) {
      return res.status(400).json({ error: 'Heading is required for new session' });
    }
    const newSession = {
      heading,
      createdAt: new Date(),
      messages: [{ role, content, time, graph }]
    };
    user.sessions.push(newSession);
    await user.save();
    const createdSession = user.sessions[user.sessions.length - 1];
    return res.status(200).json({ message: 'New session created', sessionId: createdSession._id });
  } catch (error) {
    console.error('Save chat error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
} 