import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [
            totalProducts,
            totalCustomers,
            salesResult,
            products
        ] = await Promise.all([
            prisma.product.count(),
            prisma.customer.count(),
            prisma.sale.aggregate({
                _sum: { totalAmount: true }
            }),
            prisma.product.findMany({ select: { stock: true, minStock: true } })
        ]);

        const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

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
