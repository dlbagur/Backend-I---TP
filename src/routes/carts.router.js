import { Router } from "express";
import CartsManager from '../dao/CartsManager.js';

const router = Router();

// Ruta para obtener un carrito por ID
router.get('/:cid', async (req, res) => {
    try {
        const carts = await CartsManager.getCart();
        const { cid } = req.params;
        const cart = carts.find(c => c.id === Number(cid));

        if (!cart) {
            return res.status(400).json({ error: `No existe el carrito con ID ${cid}` });
        }

        const products = await CartsManager.getCartProducts(cid);
        if (!products || products.length === 0) {
            return res.status(404).json({ alerta: 'El carrito está vacío' });
        }

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: `Error inesperado en el servidor: ${error.message}` });
    }
});

router.post('/', async (req, res) => {
  try {
      const newCart = await CartsManager.addCart();  
      res.status(201).json(newCart);
  } catch (error) {
      res.status(500).json({ error: 'Error creando un carrito' })
  }
});

router.post('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    try {
        const updatedProducts = await CartsManager.addProductToCart(cartId, productId);
        res.json(updatedProducts);
    } catch (error) {
        if (error.message.includes('Carrito con id')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Producto con id')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Error agregando producto al carrito' });
    }
});

export default router;
