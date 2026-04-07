import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const where = search
            ? {
                OR: [
                    { name: { contains: String(search), mode: 'insensitive' as const } },
                    { email: { contains: String(search), mode: 'insensitive' as const } },
                    { phone: { contains: String(search) } },
                ],
            }
            : {};

        const customers = await prisma.customer.findMany({
            where,
            orderBy: { lastVisit: 'desc' },
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching customers' });
    }
};

export const getCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const customer = await prisma.customer.findUnique({
            where: { id: Number(id) },
            include: { sales: true },
        });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching customer' });
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, location, address, gstNumber } = req.body;
        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
                location,
                address: address || null,
                gstNumber: gstNumber || null,
            },
        });
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Error creating customer' });
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phone, location, address, gstNumber } = req.body;
        const customer = await prisma.customer.update({
            where: { id: Number(id) },
            data: {
                name,
                email,
                phone,
                location,
                address: address || null,
                gstNumber: gstNumber || null,
            },
        });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: 'Error updating customer' });
    }
};
