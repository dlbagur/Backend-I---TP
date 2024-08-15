import { Router } from "express";
import CartsManager from '../dao/CartsManager.js';
import { error } from "console"

const router = Router();

CartsManager.path="src/data/carts.json"

// Crear un nuevo carrito de compra
router.post('/', async (req, res) => {
    try {
        const newCart = await CartsManager.addCart();  
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error creando un carrito' })
        console.log(error);
    }
});

// Obtener vinos de un carrito por ID
router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const vinos = await CartsManager.getCartVinos(cartId);

        if (!vinos) {
            return res.status(404).json({ error: 'El carrito está vacío' });
        }

        res.json(vinos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error recuperando el carrito con los vinos' });
    }
});

// Agregar un vino al carrito
router.post('/:cid/vino/:vid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const vinoId = req.params.vid;
        const updatedVinos = await CartsManager.addVinoToCart(cartId, vinoId);
        res.json(updatedVinos);
    } catch (error) {
        if (error.message.includes('Carrito con id')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Vino con id')) {
            return res.status(404).json({ error: error.message });
        }
        console.log(error);
        res.status(500).json({ error: 'Error agregando vino al carrito' });
    }
});


export default router;
