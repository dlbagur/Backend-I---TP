import { Router } from "express";
import CartsManager from '../dao/CartsManager.js';
import { error } from "console"

const router = Router();

CartsManager.path="src/data/carts.json"

router.post('/', async (req, res) => {
    try {
        const newCart = await CartsManager.addCart();  
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error creando un carrito' })
    }
});

router.get('/:cid', async (req, res) => {
    let carts
    try {
        carts = await CartsManager.getCart()
    } catch (error) {
        res.setHeader("Content-Type", "applcation/json");
        return res.status(500).json({
          error: `Error inesperado en el servidor, Intente mas tarde`,
          detalle: `${error.mensaje}`,
        })
    }
    let { cid } = req.params;
    cid = Number(cid);
    const cart = carts.find((c) => c.id === cid);
    if (!cart) {
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`no existe el carrito ${cid}`})
     }
     try {
        const products = await CartsManager.getCartProducts(cid);
        if (!products) {
            return res.status(404).json({alerta: 'El carrito está vacío' });
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error recuperando el carrito con los productos' });
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

router.delete("/:cid", async (req, res) => {
    let { id } = req.params;
    id = Number(id);
    if (isNaN(id)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `El id ${id} debe ser numérico` });
    }
    let products;
    try {
      products = await productsManager.getproducts();
    } catch (error) {
        res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor. Intente más tarde`,
        detalle: `${error.message}`,
      });
    }
  
    let productDel = products.find((h) => h.id === id);
    if (!productDel) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No existe product con id: ${id}` });
    }
  
    let resultado
    try {
      resultado = await productsManager.deleteproduct(id);
      if (resultado > 0) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(200)
          .json({ resultado: `El product ${id} fue eliminado!` });
      } else {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({ error: `Error al eliminar el product ${id}` });
      }
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor. Intente más tarde.`,
        detalle: `${error.message}`,
      });
    }
  });
  
export default router;
