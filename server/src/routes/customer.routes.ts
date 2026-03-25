import { Router } from 'express';
import {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
} from '../controllers/customer.controller';

const router = Router();

router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);

export default router;
