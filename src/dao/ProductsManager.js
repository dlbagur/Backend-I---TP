import fs from "fs"

class ProductsManager{
    static path
    static async getproducts(){
        try {
            if (fs.existsSync(this.path)) {
                let products=JSON.parse(await fs.promises.readFile(this.path, {encoding:"utf-8"}))
                return products
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

    static async addproduct(product={}){
        let products
        try {
            products=await this.getproducts()
        } catch (error) {
            res.setHeader("Content-Type", "application/json");
            return res.status(500).json({
            error: `Error inesperado en el servidor. Intente más tarde`,
            detalle: `${error.message}`,        
            })
        }
        let id=1
        if(products.length>0){
            id=Math.max(...products.map(v=>v.id))+1
        }
        let nuevoProducto={
            id,
            ...product
        }
        nuevoProducto.status=true
        nuevoProducto.thumbnails=[]
        products.push(nuevoProducto)
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5))

        return nuevoProducto
    }

    static async updateproduct(id, aModificar={}){
        let products
        try {
            products = await this.getproducts()
        } catch (error) {
            res.setHeader("Content-Type", "application/json");
            return res.status(500).json({
            error: `Error inesperado en el servidor durante update. Intente más tarde`,
            detalle: `${error.message}`,        })
            }   
        let indiceProducto=products.findIndex(h=>h.id===id)
        if(indiceProducto===-1){
            throw new Error(`Error: no existe el id: ${id}`)
        }
        products[indiceProducto]={
            ...products[indiceProducto],
            ...aModificar,
            id
        }

        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5))
        return products[indiceProducto]
    }

    static async deleteproduct(id){
        id=Number(id)
        let products 
        try {
            products = await this.getproducts()
        } catch (error) {
            res.setHeader("Content-Type", "application/json");
            return res.status(500).json({
                error: `Error inesperado en el servidor. Intente más tarde`,
                detalle: `${error.message}`,        })
        }
        let indiceproduct=products.findIndex(h=>h.id===id)
        if(indiceproduct===-1){
            throw new Error(`Error: no existe id ${id}`)
        }
        products=products.filter(h=>h.id!==id)   
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 5))
        return products
    }
}

export default ProductsManager