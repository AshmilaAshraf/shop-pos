import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSale = async (req: Request, res: Response) => {
    try {
        const { customerId, items, paymentMode } = req.body;
        // items: [{ productId, quantity, price, size }]

        // simple calculation (in real world, verify prices from DB)
        let totalAmount = 0;
        const salesItemsData = items.map((item: any) => {
            const lineTotal = item.price * item.quantity;
            totalAmount += lineTotal;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                size: item.size
            };
        });

        const taxAmount = totalAmount * 0.18;
        const subTotal = totalAmount;
        const finalTotal = subTotal + taxAmount;

        // Transaction: Create Sale, Create SalesItems, Update Product Stock, Update Customer Stats
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Create Sale
            const sale = await prisma.sale.create({
                data: {
                    customerId: customerId ? Number(customerId) : null,
                    subTotal,
                    taxAmount,
                    totalAmount: finalTotal,
                    paymentMode: paymentMode || 'CASH',
                    items: {
                        create: salesItemsData
                    }
                },
                include: { items: true }
            });

            // 2. Update Stock
            for (const item of items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity }
                    }
                });
            }

            // 3. Update Customer (if exists)
            if (customerId) {
                await prisma.customer.update({
                    where: { id: Number(customerId) },
                    data: {
                        totalSpent: { increment: finalTotal },
                        lastVisit: new Date(),
                        points: { increment: Math.floor(finalTotal / 100) } // 1 pt per 100 spent
                    }
                });
            }

            return sale;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing sale' });
    }
};

export const getSales = async (req: Request, res: Response) => {
    try {
        const sales = await prisma.sale.findMany({
            include: { customer: true, items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sales' });
    }
};
