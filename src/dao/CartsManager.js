import mongoose from 'mongoose';
import { cartsModelo } from './models/cartsModel.js';
import { productosModelo } from './models/productsModel.js';

class CartsManager {

    static async getCarts() {
        return await cartsModelo.find()
            .populate('productos.producto')
            .lean();
    }
    
    static async getCartById(cartId) {
        return await cartsModelo.findById(cartId)
            .populate('productos.producto')
            .lean();
    }

    static async addCart(cart = {}) {
        let nuevoCart = await cartsModelo.create(cart);
        return nuevoCart; 
    }

    static async getCartProducts(cartId) {
        let cart
        try {
            cart = await this.getCart(cartId);
            if (!cart) {
                throw new Error(`No existe un carrito con el id ${cartId}`);
            }
            } catch (error) {
            throw new Error(`Error recuperando el carrito: ${error.message}`);
        }
        return cart.products;
    }

    static async addProductToCart(cartId, prodId) {
        let cart;
        try {
            console.log("Buscando carrito con ID:", cartId);
            cart = await cartsModelo.findById(cartId);
            if (!cart) {
                throw new Error(`No existe un carrito con el ID ${cartId}`);
            }
        } catch (error) {
            throw new Error(`Error al recuperar el carrito: ${error.message}`);
        }

        let productoExistente;
        try {
            console.log("Buscando producto con ID:", prodId);
            productoExistente = await productosModelo.findById(prodId);
            if (!productoExistente) {
                throw new Error(`No existe producto con el ID ${prodId}`);
            }
        } catch (error) {
            throw new Error(`Error al recuperar el producto: ${error.message}`);
        }

        const productoIndex = cart.productos.findIndex(p => p.producto.toString() === prodId);
        console.log("Producto encontrado en el carrito:", productoIndex !== -1);

        if (productoIndex === -1) {
            if (productoExistente.stock < 1) {
                throw new Error(`No hay stock suficiente del producto con ID ${prodId}`);
            } else {
                cart.productos.push({ producto: new mongoose.Types.ObjectId(prodId), quantity: 1 });
            }
        } else {
            if (productoExistente.stock - cart.productos[productoIndex].quantity < 1) {
                throw new Error(`No hay stock suficiente del producto con ID ${prodId}`);
            } else {
                cart.productos[productoIndex].quantity += 1;
            }
        }

        await cart.save();
        console.log("Carrito actualizado guardado:", cart);

        return cart.productos;
    }

    static async deleteCart(idCarrito) {
        try {
            const cart = await cartsModelo.findById(idCarrito);
            if (!cart) {
                throw new Error(`No existe un carrito con el ID ${idCarrito}`);
            }
            const resultado = await cartsModelo.findByIdAndDelete(idCarrito);
            console.log("Carrito eliminado:", resultado);
            return resultado;
        } catch (error) {
            throw new Error(`Error eliminando el carrito: ${error.message}`);
        }
    }



    static async deleteProductFromCart(cartId, productId) {
        let cart = await cartsModelo.findById(cartId);
        if (!cart) {
            throw new Error(`No existe un carrito con el ID ${cartId}`);
        }
        cart.productos = cart.productos.filter(p => p.producto.toString() !== productId);
        await cart.save();
        return cart;
    }

}

export default CartsManager;
