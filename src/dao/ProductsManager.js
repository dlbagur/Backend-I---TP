import { productosModelo } from "./models/productsModel.js";

class ProductsManager {

    static async getproducts() {
        return await productosModelo.find().lean()
    }    

    static async getproductsPaginate(skip, limit, page, sortOptions = {}, filters = {}) {
        const query = {}
        if (filters.category) {
            query.category = filters.category
        }
        if (filters.inStock) {
            query.stock = { $gt:0}
        }

        const options = {
            page: page || 1,
            limit: limit || 10,
            sort: sortOptions,
            lean: true
        };
        return await productosModelo.paginate(query, options);
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
