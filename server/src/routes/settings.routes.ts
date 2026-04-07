import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const settings = await prisma.storeSettings.findUnique({
            where: { id: 1 }
        });
        
        if (!settings) {
            return res.status(404).json({ error: 'Settings not found' });
        }
        
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    const { storeName, contactEmail, currencySymbol, taxRate, address, gstNumber, receiptFooter } = req.body;
    
    try {
        const settings = await prisma.storeSettings.upsert({
            where: { id: 1 },
            update: {
                storeName,
                contactEmail,
                currencySymbol,
                taxRate,
                address,
                gstNumber,
                receiptFooter
            },
            create: {
                storeName: storeName || 'ShopPOS Store',
                contactEmail: contactEmail || 'admin@shoppos.com',
                currencySymbol: currencySymbol || '₹',
                taxRate: taxRate || 18,
                address: address || null,
                gstNumber: gstNumber || null,
                receiptFooter: receiptFooter || null
            }
        });
        
        res.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
