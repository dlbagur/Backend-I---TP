import express from 'express';
import CartManager from '../dao/CartManager.js';

const router = express.Router();

// Crear un nuevo carrito de compra
router.post('/', async (req, res) => {
    try {
        const newCart = await CartManager.addCart();  
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error creando un carito' });
    }
});

// Obtener vinos de un carrito por ID
router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const vinos = await CartManager.getCartVinos(cartId);

        if (!vinos) {
            return res.status(404).json({ error: 'El carrito no existe' });
        }

        res.json(vinos);
    } catch (error) {
        console.error('Error recuperando el carrito con los vinos:', error.message);
        res.status(500).json({ error: 'Error recuperando el carrito con los vinos' });
    }
});

// Agregar un vinoo al carrito
router.post('/:cid/vino/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const vinoId = req.params.pid;
        const updatedVinos = await CartManager.addVinoToCart(cartId, vinoId);
        res.json(updatedVinos);
    } catch (error) {
        if (error.message.includes('Carrito con id')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Vino con id')) {
            return res.status(404).json({ error: error.message });
        }
        console.error('Error agregando vino al carrito:', error.message);
        res.status(500).json({ error: 'Error agregando vino al carrito' });
    }
});


export default router;
