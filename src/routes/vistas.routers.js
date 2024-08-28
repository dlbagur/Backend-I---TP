import { Router } from 'express';
import productsManager from '../dao/ProductsManager.js';

const router = Router();

router.get('/', async (req, res) => {
    const products = await productsManager.getproducts();
    res.render('home', { products });
});

router.get('/realtimeproducts', async (req, res) => {
    const products = await productsManager.getproducts();
    res.render('realTimeProducts', { products });
});

export { router };
