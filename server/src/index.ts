import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import productRoutes from './routes/product.routes';
import customerRoutes from './routes/customer.routes';
import salesRoutes from './routes/sales.routes';
import dashboardRoutes from './routes/dashboard.routes';
import authRoutes from './routes/auth.routes';
import { authenticateToken } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('ShopPOS Backend Running');
});

app.use('/api/auth', authRoutes);

app.use('/api/products', authenticateToken, productRoutes);
app.use('/api/customers', authenticateToken, customerRoutes);
app.use('/api/sales', authenticateToken, salesRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});