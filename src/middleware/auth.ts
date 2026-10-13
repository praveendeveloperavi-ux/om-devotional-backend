import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'om_devotional_sacred_jwt_secret_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'devotee' | 'temple_admin' | 'super_admin';
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.user = decoded;
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Required privilege not granted.' });
    }
    next();
  };
};

export const generateTokens = (user: { id: string; email: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken, expiresIn: 7200 };
};
