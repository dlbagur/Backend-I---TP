import { Router } from 'express';
import ProductsManager from '../dao/ProductsManager.js';
import CartsManager from '../dao/CartsManager.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const products = await ProductsManager.getproducts();
        res.render('home', { products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await ProductsManager.getproducts();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/realtimecarts', async (req, res) => {
    try {
        const carts = await CartsManager.getCarts();
        res.render('realTimeCarts', { carts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export { router };
