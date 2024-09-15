import { productosModelo } from "./models/productsModel.js";

class ProductsManager {

    static async getproducts() {
        return await productosModelo.find().lean()
    }    
    static async getproductsPaginate(skip, limit, page, order) {
        return await productosModelo.paginate({},{page, lean:true, limit})
    }    

    static async getProductById(filtro={}){
        return await productosModelo.findById(filtro).lean()
    }

    static async getProductBy(filtro={}){
        return await productosModelo.findOne(filtro).lean()
    }
    static async getProductByCode(nombre={}){
        return await productosModelo.find({code:nombre})
    }

    static async getProductByQry(skip, limit, order = {}){
        return await productosModelo.find()
                .skip(skip)
                .limit(limit)        
    }

    static async createProduct(producto){
        return productosModelo.create(producto)
    }
    
    static async addproduct(producto = {}) {
        let nuevoProducto = await productosModelo.create(producto)
        return nuevoProducto; 
    }

    static async updateproduct(id, aModificar = {}) {
        return await productosModelo.updateOne({ _id: id }, aModificar);
    }

    static async deleteproduct(id) {
        return await productosModelo.findByIdAndDelete(id, {new:true}).lean()
    }
}

export default ProductsManager;
