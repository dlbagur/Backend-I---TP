import fs from 'fs';
import path from 'path';
import VinosManager from './VinosManager.js'; 

const cartFilePath = path.resolve('src/archivos/data/cart.json');

class CartManager {
    static async getCart() {
        if (fs.existsSync(cartsFilePath)) {
            return JSON.parse(await fs.promises.readFile(cartsFilePath, 'utf-8'));
        } else {
            return [];
        }
    }

    static async addCart() {
        const cart = await this.getCart();
        const newCart = {
            id: uuidv4(), 
            vinos: []
        };

        carts.push(newCart);

        await fs.promises.writeFile(cartFilePath, JSON.stringify(cart, null, 2));

        return newCart;
    }

    static async getCartVinos(cartId) {
        try {
            const carts = await this.getCarts();
            const cart = carts.find(c => c.id === cartId);

            if (!cart) {
                return null;
            }

            return cart.vinos;
        } catch (error) {
            console.error('Error retrieving cart vinos:', error.message);
            throw new Error('Error retrieving cart vinos');
        }
    }

    static async addVinoToCart(cartId, vinoId) {
        const cart = await this.getCart();
        const cartId2 = cart.find(c => c.id === cartId);
        if (!cartId2) {
            throw new Error(`Cart with id ${cartId} not found.`);
        }
    
        const vinos = await VinosManager.getVinos();
        const vinoId2 = vinos.find(p => p.id === vinoId);
        if (!vinoId2) {
            throw new Error(`El vino con id ${vinoId} not found.`);
        }
    
        const vinoIndex = cart.vinos.findIndex(p => p.vino === vinoId);
        if (vinoIndex === -1) {
            cart.vinos.push({ vino: vinoId, quantity: 1 });
        } else {
            cart.vinos[vinoIndex].quantity += 1;
        }
    
        await fs.promises.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
    
        return cart.vinos;
    }
    
}

export default CartManager;
