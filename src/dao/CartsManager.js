import fs from 'fs';
import productsManager from './ProductsManager.js'; 

const cartsFilePath = 'src/data/carts.json'

class CartsManager {
    static path 
    static async getCart() {
        try {
            if (fs.existsSync(this.path)) {
                let carts=JSON.parse(await fs.promises.readFile(this.path, {encoding:"utf-8"}))
                return carts
            } else {
                return [];
            }
        } catch (error) {
            res.setHeader("Content-Type", "application/json");
            return res.status(500).json({
                error: `Error inesperado en el servidor. Intente más tarde`,
                detalle: `${error.message}`,
            });
        }
    }

    static async addCart() {
        try {
            const carts = await this.getCart();
            let id=1
            if(carts.length>0){
                id=Math.max(...carts.map(v=>v.id))+1
            }
            let nuevoCarrito={
                id,
                products: []
            }
            carts.push(nuevoCarrito);
            await fs.promises.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
            return nuevoCarrito;
        } catch (error) {
            res.setHeader("Content-Type", "application/json");
            return res.status(500).json({
            error: `Error inesperado en el servidor. Intente más tarde`,
            detalle: `${error.message}`,
        });
        }
    }

    static async getCartProducts(cartId) {
        let carts
        try {
            carts = await this.getCart();
         } catch (error) {
            res.setHeader("Content-Type", "application/json");
            return res.status(500).json({
                error: `Error recuperando el carrito de los productos`,
                detalle: `${error.message}`,
                })
            }
        let productos = []
        let idC = Number(cartId);
        const cartIndex = carts.findIndex(c => c.id === idC);
        if (cartIndex === -1) {
            throw new Error(`No existe un carrito con el id ${cartId}`);
        }else {
            productos = carts.products
        }
        return productos;
    }

    static async addProductToCart(cartId, prodId) {
        let carts
        try {
            carts = await this.getCart();
        } catch (error) {
            res.setHeader("Content-Type", "applcation/json");
            return res.status(500).json({
              error: `Error inesperado en el servidor. Intente mas tarde`,
              detalle: `${error.mensaje}`,
            });
          }
        let idC = Number(cartId);
        let idP = Number(prodId);
        const cartIndex = carts.findIndex(c => c.id === idC);
        if (cartIndex === -1) {
            throw new Error(`No existe un carrito con el id ${cartId}`);
        }
        const cart = carts[cartIndex];
        let products
        try {
          products = await productsManager.getproducts();
          } catch (error) {
          res.setHeader("Content-Type", "applcation/json");
          return res.status(500).json({
            error: `Error inesperado en el servidor. Intente mas tarde`,
            detalle: `${error.mensaje}`,
          });
        }
        const productoExistente = products.find(p => p.id === idP);
        const saldoStock=productoExistente.stock
        if (!productoExistente) {
            throw new Error(`No existe producto con id ${prodId}`);
        }

        const productoIndex = cart.products.findIndex(p => p.products === idP);
        if (productoIndex === -1) {
            if (saldoStock<1){
                throw new Error(`No hay stock suficiente del producto con id ${prodId}`);
            }else{
                cart.products.push({ products: idP, quantity: 1 });
            }
        } else {
            if (saldoStock-1-cart.products[productoIndex].quantity < 0){
                throw new Error(`No hay stock suficiente del producto con id ${prodId}`);
            }else{
                cart.products[productoIndex].quantity += 1;
            }
        }

        carts[cartIndex] = cart;
 
        await fs.promises.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
    
        return cart.products;
    }       
}

export default CartsManager;
