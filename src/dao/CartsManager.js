import fs from 'fs';
// import path from 'path';
import VinosManager from './VinosManager.js'; 

const cartsFilePath = 'src/data/carts.json'

class CartsManager {
    static path
    static async getCart() {
        if (fs.existsSync(this.path)) {
            let carrito=JSON.parse(await fs.promises.readFile(this.path, {encoding:"utf-8"}))
            return carrito
            // return JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
        } else {
            return [];
        }
    }

    static async addCart() {
        const carts = await this.getCart();
        let id=1
        if(carts.length>0){
            id=Math.max(...carts.map(v=>v.id))+1
        }
        let nuevoCarrito={
            id,
            vinos: []
        }
        carts.push(nuevoCarrito);
        await fs.promises.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
        return nuevoCarrito;
    }

    static async getCartVinos(cartId) {
        try {
            let idC=Number(cartId)
            const carts = await this.getCart(idC);
            const cart = carts.find(c => c.id === idC);

            if (!cart) {
                return null;
            }
            return cart.vinos;
        } catch (error) {
            console.log(error);
            throw new Error('Error recuperando el carrito de los vinos');
        }
    }

    static async addVinoToCart(cartId, vinoId) {
        const cart = await this.getCartVinos(cartId);
        let idC=Number(cartId)
        let idV=Number(vinoId)
        const cartId2 = cart.find(c => c.id === idC);
        if (!cartId2) {
            throw new Error(`No existe un carrito con el id ${cartId2}`);
        }
    
        const vinos = await VinosManager.getVinos();
        const vinoId2 = vinos.find(v => v.id === idV);
        if (!vinoId2) {
            throw new Error(`No existe vino con id ${vinoId}`);
        }
        const vinoIndex = cart.vinos.findIndex(v => v.vino === vinoId);
        if (vinoIndex === -1) {
            cart.vinos.push({ vino: vinoId, quantity: 1 });
        } else {
            cart.vinos[vinoIndex].quantity += 1;
        }

        await fs.promises.writeFile(cartsFilePath, JSON.stringify(cartId2, null, 2));

        return cart.vinos;
    }
    
}

export default CartsManager;
