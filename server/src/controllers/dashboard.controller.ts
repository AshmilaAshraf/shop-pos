import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [
            totalProducts,
            lowStockCount,
            totalCustomers,
            salesResult
        ] = await Promise.all([
            prisma.product.count(),
            prisma.product.count({ where: { stock: { lte: prisma.product.fields.minStock } } }),
            prisma.customer.count(),
            prisma.sale.aggregate({
                _sum: { totalAmount: true }
            })
        ]);

        const totalRevenue = salesResult._sum.totalAmount || 0;

        res.json({
            totalProducts,
            lowStockCount,
            totalCustomers,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dashboard stats' });
    }
};
