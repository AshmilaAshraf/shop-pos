import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Settings
    const settings = await prisma.storeSettings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            storeName: 'Kerala Style Lounge',
            contactEmail: 'admin@keralastyle.local',
            currencySymbol: '₹',
            taxRate: 18,
            address: 'M.G. Road, Ernakulam, Kerala 682011',
            gstNumber: '32ABCDE1234F1Z5',
            receiptFooter: 'Thank you for shopping with us! Visit again. All disputes subject to Ernakulam jurisdiction.',
        },
    });

    // Admin
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: { username: 'admin', password: hashedAdminPassword, role: 'ADMIN' },
    });

    // Standard User
    const hashedUserPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
        where: { username: 'user' },
        update: {},
        create: { username: 'user', password: hashedUserPassword, role: 'USER' },
    });

    // IMPORTANT: Clear DB exactly in correct dependency order
    await prisma.salesItem.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.customer.deleteMany({});

    // Customers (Expanded list)
    const customersInfo = [
        { name: 'Rahul Menon', email: 'rahul.m@example.com', phone: '9847012301', location: 'Kochi', address: 'Panampilly Nagar, Kochi, Kerala 682036', gstNumber: '32XXXXX1111X1Z1', points: 0, totalSpent: 0 },
        { name: 'Anjali Nair', email: 'anjali.n@example.com', phone: '9447012302', location: 'Thiruvananthapuram', address: 'Kowdiar, Thiruvananthapuram', gstNumber: null, points: 0, totalSpent: 0 },
        { name: 'Vishnu Namboothiri', email: 'vishnu.n@example.com', phone: '9747012303', location: 'Kozhikode', address: 'Nadakkavu, Kozhikode', gstNumber: '32YYYYY2222Y2Z2', points: 0, totalSpent: 0 },
        { name: 'Priya Varghese', email: 'priya.v@example.com', phone: '8281012304', location: 'Thrissur', address: 'East Fort, Thrissur', gstNumber: null, points: 0, totalSpent: 0 },
        { name: 'George Thomas', email: 'george.t@example.com', phone: '8111012305', location: 'Kollam', address: 'Chinnakada, Kollam', gstNumber: null, points: 0, totalSpent: 0 },
        { name: 'Sneha Patel', email: 'sneha.p@example.com', phone: '9000123401', location: 'Palakkad', address: 'Fort Maidan, Palakkad', gstNumber: null, points: 0, totalSpent: 0 },
        { name: 'Aravind Krishnan', email: 'aravind.k@example.com', phone: '9000123402', location: 'Kannur', address: 'Payyambalam, Kannur', gstNumber: '32ZZZZZ3333Z3Z3', points: 0, totalSpent: 0 },
        { name: 'Megha Reddy', email: 'megha.r@example.com', phone: '9000123403', location: 'Kochi', address: 'Edappally, Kochi', gstNumber: null, points: 0, totalSpent: 0 },
        { name: 'Farooq Abdullah', email: 'farooq.a@example.com', phone: '9000123404', location: 'Kasaragod', address: 'Naya Bazar, Kasaragod', gstNumber: null, points: 0, totalSpent: 0 },
        { name: 'Divya Sree', email: 'divya.s@example.com', phone: '9000123405', location: 'Alappuzha', address: 'Beach Road, Alappuzha', gstNumber: null, points: 0, totalSpent: 0 },
    ];

    const customers = [];
    for (const c of customersInfo) {
        const customer = await prisma.customer.create({ data: c });
        customers.push(customer);
    }

    // Products - Pure Dress Shop (Traditional & Modern, Ladies & Gents)
    const productsInfo = [
        { name: 'Kanchipuram Silk Saree', sku: 'L-TRAD-001', barcode: '8901000000001', category: 'Ladies Traditional', price: 15999, discount: 1000, taxSlab: 12, stock: 25, sizes: ['Free Size'] },
        { name: 'Kerala Kasavu Saree', sku: 'L-TRAD-002', barcode: '8901000000002', category: 'Ladies Traditional', price: 3499, discount: 200, taxSlab: 5, stock: 60, sizes: ['Standard'] },
        { name: 'Designer Anarkali Suit', sku: 'L-MOD-001', barcode: '8901000000003', category: 'Ladies Modern', price: 4999, discount: 500, taxSlab: 12, stock: 40, sizes: ['S', 'M', 'L', 'XL'] },
        { name: 'Western Floral Maxi Dress', sku: 'L-MOD-002', barcode: '8901000000004', category: 'Ladies Modern', price: 2299, discount: 0, taxSlab: 18, stock: 80, sizes: ['XS', 'S', 'M', 'L'] },
        { name: 'Premium Silk Mundu', sku: 'G-TRAD-001', barcode: '8901000000005', category: 'Gents Traditional', price: 1499, discount: 100, taxSlab: 5, stock: 120, sizes: ['Standard'] },
        { name: 'Men\'s Kurta Pyjama Set', sku: 'G-TRAD-002', barcode: '8901000000006', category: 'Gents Traditional', price: 2899, discount: 300, taxSlab: 12, stock: 55, sizes: ['M', 'L', 'XL', 'XXL'] },
        { name: 'Slim Fit Denim Jeans', sku: 'G-MOD-001', barcode: '8901000000007', category: 'Gents Modern', price: 1899, discount: 0, taxSlab: 18, stock: 150, sizes: ['30', '32', '34', '36'] },
        { name: 'Casual Checkered Shirt', sku: 'G-MOD-002', barcode: '8901000000008', category: 'Gents Modern', price: 1199, discount: 150, taxSlab: 12, stock: 200, sizes: ['S', 'M', 'L', 'XL'] },
        { name: 'Party Wear Gown', sku: 'L-MOD-003', barcode: '8901000000009', category: 'Ladies Modern', price: 7999, discount: 800, taxSlab: 18, stock: 15, sizes: ['M', 'L'] },
        { name: 'Formal Linen Trousers', sku: 'G-MOD-003', barcode: '8901000000010', category: 'Gents Modern', price: 2499, discount: 0, taxSlab: 12, stock: 90, sizes: ['32', '34', '36', '38'] },
        { name: 'Chiffon Wrap Dress', sku: 'L-MOD-004', barcode: '8901000000011', category: 'Ladies Modern', price: 1899, discount: 0, taxSlab: 18, stock: 110, sizes: ['S', 'M', 'L'] },
        { name: 'Off-shoulder Prom Dress', sku: 'L-MOD-005', barcode: '8901000000012', category: 'Ladies Modern', price: 5499, discount: 450, taxSlab: 18, stock: 30, sizes: ['S', 'M'] },
        { name: 'A-Line Midi Skirt', sku: 'L-MOD-006', barcode: '8901000000013', category: 'Ladies Modern', price: 1299, discount: 100, taxSlab: 12, stock: 85, sizes: ['M', 'L', 'XL'] },
        { name: 'Men\'s Chino Shorts', sku: 'G-MOD-004', barcode: '8901000000014', category: 'Gents Modern', price: 899, discount: 0, taxSlab: 12, stock: 300, sizes: ['30', '32', '34'] },
        { name: 'Polo T-Shirt Classic', sku: 'G-MOD-005', barcode: '8901000000015', category: 'Gents Modern', price: 1499, discount: 200, taxSlab: 12, stock: 150, sizes: ['S', 'M', 'L', 'XL'] },
        { name: 'Men\'s Leather Jacket', sku: 'G-MOD-006', barcode: '8901000000016', category: 'Gents Modern', price: 8500, discount: 1000, taxSlab: 18, stock: 20, sizes: ['M', 'L', 'XL'] },
        { name: 'Indo-Western Sherwani', sku: 'G-TRAD-003', barcode: '8901000000017', category: 'Gents Traditional', price: 12500, discount: 1500, taxSlab: 12, stock: 10, sizes: ['38', '40', '42'] },
        { name: 'Banarasi Silk Dupatta', sku: 'L-TRAD-003', barcode: '8901000000018', category: 'Ladies Traditional', price: 1999, discount: 0, taxSlab: 5, stock: 55, sizes: ['Standard'] },
        { name: 'Women\'s Blazer Suit', sku: 'L-MOD-007', barcode: '8901000000019', category: 'Ladies Modern', price: 4299, discount: 350, taxSlab: 18, stock: 45, sizes: ['M', 'L'] },
        { name: 'Denim Jacket Unisex', sku: 'U-MOD-001', barcode: '8901000000020', category: 'Gents Modern', price: 2999, discount: 0, taxSlab: 18, stock: 65, sizes: ['M', 'L', 'XL'] }
    ];

    const products = [];
    for (const p of productsInfo) {
        const product = await prisma.product.create({ data: p });
        products.push(product);
    }

    // Generate Heavy Sales Data (200 records over last 90 days)
    console.log('Generating 200 sales records. This may take a moment...');
    for (let i = 0; i < 200; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const numItems = Math.floor(Math.random() * 5) + 1; // 1 to 5 items per sale
        const items = [];
        
        let subTotal = 0;
        let discountAmount = 0;
        let taxAmount = 0;
        
        for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const price = Number(product.price);
            const itemDiscount = Number(product.discount) * quantity;
            const itemTaxSlab = Number(product.taxSlab) || 18;
            
            subTotal += (price * quantity);
            discountAmount += itemDiscount;
            taxAmount += ((price * quantity - itemDiscount) * (itemTaxSlab / 100));

            items.push({
                productId: product.id,
                quantity,
                price: price,
                size: product.sizes[0]
            });
        }
        
        const totalAmount = subTotal - discountAmount + taxAmount;
        const paymentModes = ['CASH', 'CREDIT_CARD', 'UPI', 'NET_BANKING'];
        const isGuest = Math.random() > 0.4; // 40% chance of guest checkout

        await prisma.sale.create({
            data: {
                invoiceNo: `INV-2024-${1000 + i}`,
                totalAmount,
                taxAmount,
                discountAmount,
                subTotal,
                paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
                customerId: isGuest ? null : customer.id,
                cashierName: Math.random() > 0.5 ? 'admin' : 'user',
                createdAt: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 90))), // last 90 days
                items: {
                    create: items
                }
            }
        });

        // Update customer totalSpent proactively
        if (!isGuest) {
            await prisma.customer.update({
                where: { id: customer.id },
                data: {
                    totalSpent: { increment: totalAmount },
                    points: { increment: Math.floor(totalAmount / 100) },
                    lastVisit: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 90)))
                }
            })
        }
    }

    console.log('Seeding finished successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
