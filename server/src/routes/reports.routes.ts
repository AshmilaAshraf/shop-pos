import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        // Fetch all sales, customers and items for reporting
        const sales = await prisma.sale.findMany({
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                customer: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        
        const customers = await prisma.customer.findMany({
            include: {
                _count: {
                    select: { sales: true }
                }
            }
        });

        // 1. Calculate Metrics
        const totalSales = sales.reduce((sum, sale) => sum + Number(sale.totalAmount), 0);
        const totalTax = sales.reduce((sum, sale) => sum + Number(sale.taxAmount), 0);
        const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discountAmount || 0), 0);
        const totalOrders = sales.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        
        const totalCustomers = customers.length;
        // Simple metric for new vs returning
        const customersWithMultiplePurchases = sales.filter(s => s.customerId).map(s => s.customerId).filter((v, i, a) => a.indexOf(v) !== i).length;
        const newVsReturning = {
            new: totalCustomers - customersWithMultiplePurchases,
            returning: customersWithMultiplePurchases
        };

        // 2. Sales Over Time (Monthly grouped)
        const salesOverTime: Record<string, {name: string, sales: number, orders: number}> = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        sales.forEach(sale => {
            const date = new Date(sale.createdAt);
            const key = `${monthNames[date.getMonth()]} '${date.getFullYear().toString().substring(2)}`;
            if (!salesOverTime[key]) {
                salesOverTime[key] = { name: key, sales: 0, orders: 0 };
            }
            salesOverTime[key].sales += Number(sale.totalAmount);
            salesOverTime[key].orders += 1;
        });

        // 3. Category Performance
        const categoryPerformanceMap: Record<string, number> = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const category = item.product.category;
                if (!categoryPerformanceMap[category]) {
                    categoryPerformanceMap[category] = 0;
                }
                categoryPerformanceMap[category] += Number(item.price) * item.quantity;
            });
        });
        const categoryPerformance = Object.entries(categoryPerformanceMap).map(([name, value]) => ({
            name,
            value,
            percentage: Math.round((value / totalSales) * 100) || 0
        })).sort((a, b) => b.value - a.value);

        // 4. Top Customers
        const topCustomers = customers.map(c => ({
            id: c.id,
            name: c.name,
            totalSpent: Number(c.totalSpent),
            salesCount: c._count?.sales || 0
        })).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

        res.json({
            metrics: {
                totalSales,
                totalOrders,
                avgOrderValue,
                totalCustomers,
                totalTax,
                totalDiscount,
                newVsReturning
            },
            salesOverTime: Object.values(salesOverTime),
            categoryPerformance,
            topCustomers
        });

    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
