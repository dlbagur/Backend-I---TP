import fs from 'fs';
import productsManager from './ProductsManager.js'; 

const cartsFilePath = 'src/data/carts.json';

class CartsManager {
    static path = cartsFilePath;

    static async getCart() {
        try {
            if (fs.existsSync(this.path)) {
                let carts = JSON.parse(await fs.promises.readFile(this.path, { encoding: "utf-8" }));
                return carts;
            } else {
                return [];
            }
        } catch (error) {
            throw new Error(`Error inesperado en el servidor: ${error.message}`);
        }
    }

    static async addCart() {
        try {
            const carts = await this.getCart();
            let id = 1;
            if (carts.length > 0) {
                id = Math.max(...carts.map(v => v.id)) + 1;
            }
            let nuevoCarrito = {
                id,
                products: []
            };
            carts.push(nuevoCarrito);
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
            return nuevoCarrito;
        } catch (error) {
            throw new Error(`Error inesperado en el servidor: ${error.message}`);
        }
    }

    static async getCartProducts(cartId) {
        let carts;
        try {
            carts = await this.getCart();
        } catch (error) {
            throw new Error(`Error recuperando el carrito: ${error.message}`);
        }
        
        let idC = Number(cartId);
        const cart = carts.find(c => c.id === idC);
        if (!cart) {
            throw new Error(`No existe un carrito con el id ${cartId}`);
        }
        return cart.products;
    }

    static async addProductToCart(cartId, prodId) {
        let carts;
        try {
            carts = await this.getCart();
        } catch (error) {
            throw new Error(`Error inesperado en el servidor: ${error.message}`);
        }

        let idC = Number(cartId);
        let idP = Number(prodId);
        const cartIndex = carts.findIndex(c => c.id === idC);
        if (cartIndex === -1) {
            throw new Error(`No existe un carrito con el id ${cartId}`);
        }
        const cart = carts[cartIndex];

        let products;
        try {
            products = await productsManager.getproducts();
        } catch (error) {
            throw new Error(`Error recuperando productos: ${error.message}`);
        }

        const productoExistente = products.find(p => p.id === idP);
        if (!productoExistente) {
            throw new Error(`No existe producto con id ${prodId}`);
        }

        const productoIndex = cart.products.findIndex(p => p.products === idP);
        if (productoIndex === -1) {
            if (productoExistente.stock < 1) {
                throw new Error(`No hay stock suficiente del producto con id ${prodId}`);
            } else {
                cart.products.push({ products: idP, quantity: 1 });
            }
        } else {
            if (productoExistente.stock - cart.products[productoIndex].quantity < 1) {
                throw new Error(`No hay stock suficiente del producto con id ${prodId}`);
            } else {
                cart.products[productoIndex].quantity += 1;
            }
        }

        carts[cartIndex] = cart;
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));

        return cart.products;
    }
}

export default CartsManager;
