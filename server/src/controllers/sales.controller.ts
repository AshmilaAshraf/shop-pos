import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSale = async (req: Request, res: Response) => {
    try {
        const { customerId, items, paymentMode } = req.body;
        const cashierName = (req as any).user?.name || (req as any).user?.username || 'Admin';

        let subTotal = 0;
        let taxAmount = 0;
        let totalDiscountAmount = 0;

        const salesItemsData = items.map((item: any) => {
            const price = Number(item.price);
            const discount = Number(item.discount || 0);
            const taxSlab = Number(item.taxSlab || 0);
            const quantity = Number(item.quantity);

            const grossLineTotal = price * quantity;
            const lineDiscount = discount * quantity;
            const netLineTotal = grossLineTotal - lineDiscount;
            const lineTax = (netLineTotal * taxSlab) / 100;

            subTotal += netLineTotal;
            taxAmount += lineTax;
            totalDiscountAmount += lineDiscount;

            return {
                productId: item.productId,
                quantity: quantity,
                price: price,
                size: item.size
            };
        });

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
                    discountAmount: totalDiscountAmount,
                    cashierName,
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
