import { Request, Response } from 'express';
import { dataStore } from '../data/store';
import { generateTokens, AuthRequest } from '../middleware/auth';

export const login = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    let user = dataStore.findUserByEmail(email);

    // If logging in as admin with default demo credentials
    if (email.toLowerCase() === 'praveendeveloperavi@gmail.com') {
      if (!user) {
        user = dataStore.createUser({
          name: 'Praveen Developer (Temple Admin)',
          email: 'praveendeveloperavi@gmail.com',
          role: 'super_admin'
        });
      }
    } else if (!user) {
      // Auto-create or login devotee
      user = dataStore.createUser({
        name: email.split('@')[0],
        email,
        role: 'devotee'
      });
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        savedVideos: user.savedVideos,
        followedTemples: user.followedTemples
      },
      ...tokens
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const register = (req: Request, res: Response) => {
  try {
    const { name, email, phone, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    let existing = dataStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Account already exists for this email.' });
    }

    const newUser = dataStore.createUser({
      name,
      email,
      phone,
      role: role || 'devotee'
    });

    const tokens = generateTokens(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      user: newUser,
      ...tokens
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const user = dataStore.findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleSaveVideo = (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.body;
    if (!req.user || !videoId) {
      return res.status(400).json({ success: false, message: 'User ID and videoId are required.' });
    }
    const saved = dataStore.toggleSaveVideo(req.user.id, videoId);
    res.json({ success: true, savedVideos: saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
