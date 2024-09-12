import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

const productosColl="products"
const productosSchema=new mongoose.Schema(
    {
        id: Number,
        category: String,
        title: String,
        code: 
        {
            type: String, unique: true
        },
        price: Number,
        status:
        {
            Boolean
        },
        description: String,
        thumbnails: [],
        stock: Number,
    },
    {
        timestamps: true,
    }
)

productosSchema.plugin(mongoosePaginate)

export const productosModelo=mongoose.model(
    productosColl,
    productosSchema
)
