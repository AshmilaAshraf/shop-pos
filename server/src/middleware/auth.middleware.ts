import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err: VerifyErrors | null, user: string | JwtPayload | undefined) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        (req as AuthRequest).user = user;
        next();
    });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (authReq.user && authReq.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};