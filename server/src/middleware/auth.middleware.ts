
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const COOKIE_NAME = 'auth_token';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const headerToken = req.headers.authorization?.split(' ')[1];
    const cookieToken = req.cookies[COOKIE_NAME];
    const token = headerToken || cookieToken;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        // @ts-ignore
        req.user = user;
        next();
    });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};