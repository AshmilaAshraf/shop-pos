import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const COOKIE_NAME = 'auth_token';

export const getRSAPublicKey = (req: Request, res: Response) => {
    res.json({ publicKey: 'RSA_DEPRECATED' });
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Missing credentials' });
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password with bcrypt (the REAL security layer)
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set HttpOnly Cookie (still works for local development)
        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        // CHANGED: Also return token in response body (for deployed frontend)
        res.json({
            message: 'Login successful',
            token,  // ← ADD THIS LINE
            user: { id: user.id, username: user.username, role: user.role }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        // Check if requester is admin (Middleware should handle this)
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: role || 'USER'
            }
        });

        res.status(201).json({
            message: 'User created',
            user: { id: user.id, username: user.username }
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Username already exists' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ message: 'Logged out' });
};

export const me = (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user;
    if (user) {
        res.json({ user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
}