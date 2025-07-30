import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/mongodb';
import User, { IChatSession } from '../../../lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    // If sessionId is provided, return all messages for that session
    const { sessionId } = req.query;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (sessionId) {
      const session = user.sessions.id(sessionId as string);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      return res.status(200).json({
        heading: session.heading,
        createdAt: session.createdAt,
        messages: session.messages
      });
    }

    // Otherwise, return all sessions (headings, createdAt, message count, _id)
    const sessions = user.sessions.map((s: IChatSession & { _id: string }) => ({
      _id: s._id,
      heading: s.heading,
      createdAt: s.createdAt,
      messageCount: Array.isArray(s.messages) ? s.messages.length : 0
    }));
    res.status(200).json({ sessions });

  } catch (error) {
    console.error('Get chats error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
} 