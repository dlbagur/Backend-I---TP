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
            const idC = Number(cartId);
            const carts = await this.getCart();
            const cart = carts.find(c => c.id === idC);  // Corregido para devolver el carrito
    
            if (!cart) {
                return null;
            }
    
            return cart;
        } catch (error) {
            console.log(error);
            throw new Error('Error recuperando el carrito de los vinos');
        }
    }

    static async addVinoToCart(cartId, vinoId) {
        const carts = await this.getCart();  // Obtener todos los carritos
        let idC = Number(cartId);
        let idV = Number(vinoId);
    
        const cartIndex = carts.findIndex(c => c.id === idC);
        if (cartIndex === -1) {
            throw new Error(`No existe un carrito con el id ${cartId}`);
        }
    
        const cart = carts[cartIndex]; // Obteniendo el carrito específico
    
        const vinos = await VinosManager.getVinos();
        console.log("desde cartmanager: ", vinos)
        const vinoExistente = vinos.find(v => v.id === idV);
        if (!vinoExistente) {
            throw new Error(`No existe vino con id ${vinoId}`);
        }
        // else
        // {
        //     if vinos.stock
        // }
    
        const vinoIndex = cart.vinos.findIndex(v => v.vino === idV);
        if (vinoIndex === -1) {
            cart.vinos.push({ vino: idV, quantity: 1 });
        } else {
            cart.vinos[vinoIndex].quantity += 1;
        }
    
        carts[cartIndex] = cart; // Actualizar el carrito específico en el array
    
        await fs.promises.writeFile(cartsFilePath, JSON.stringify(carts, null, 2)); // Escribir el array completo de carritos
    
        return cart.vinos;
    }    
}

export default CartsManager;
