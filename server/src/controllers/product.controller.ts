import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const where = search
            ? {
                OR: [
                    { name: { contains: String(search), mode: 'insensitive' as const } },
                    { sku: { contains: String(search), mode: 'insensitive' as const } },
                ],
            }
            : {};

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching product' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, sku, barcode, category, price, discount, taxSlab, stock, minStock, sizes } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                sku,
                barcode: barcode || null,
                category,
                price: Number(price),
                discount: discount ? Number(discount) : 0,
                taxSlab: taxSlab ? Number(taxSlab) : null,
                stock: Number(stock),
                minStock: Number(minStock) || 5,
                sizes: sizes || [],
            },
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, sku, barcode, category, price, discount, taxSlab, stock, minStock, sizes } = req.body;
        const product = await prisma.product.update({
            where: { id: Number(id) },
            data: {
                name,
                sku,
                barcode: barcode || null,
                category,
                price: Number(price),
                discount: discount ? Number(discount) : 0,
                taxSlab: taxSlab ? Number(taxSlab) : null,
                stock: Number(stock),
                minStock: Number(minStock),
                sizes,
            },
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id: Number(id) },
        });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
};
