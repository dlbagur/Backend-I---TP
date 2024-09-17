import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import productsRouter from './routes/products.router.js';
import productsManager from "./dao/ProductsManager.js"
import cartsRouter from './routes/carts.router.js';
import CartsManager from './dao/CartsManager.js';
import { router as vistasRouter } from './routes/vistas.routers.js';
import { config } from "./config/config,js";
import { connDB } from './connDB.js';

const PORT=config.PORT;
const app = express();

const serverHTTP = app.listen(PORT, () => {
    console.log(`Server en línea en http://localhost:${PORT}`);
});

const io = new Server(serverHTTP);

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src/public'));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', vistasRouter);

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('validarProducto', async (code) => {
        try {
            const existe = await productsManager.getProductBy({ code });
            socket.emit('productoExiste', !!existe);
        } catch (error) {
            console.error('Error al validar el producto:', error);
            socket.emit('productoExiste', false);
        }
    });

    socket.on('crearProducto', async (producto) => {
        try {
            const nuevoProducto = await productsManager.addproduct(producto);            
            io.emit('agregarProducto', nuevoProducto);
        } catch (error) {
            console.log("Error ", error)
            socket.emit('error', 'Error al agregar producto');
        }
    });

    socket.on('modificarProducto', async (producto) => {
        try {
            const { _id, ...dataToUpdate } = producto;
            const aModificarProducto = await productsManager.updateproduct(_id, dataToUpdate);
            io.emit('productoModificado', producto);
        } catch (error) {
            console.log("Error ", error)
            socket.emit('error', 'Error al modificar producto');
        }
    });

    socket.on('eliminarProducto', async (idProducto) => {
        try {
            console.log("Eliminar producto an APP:", idProducto);            
            await productsManager.deleteproduct(idProducto);
            io.emit('eliminarProducto', idProducto);
        } catch (error) {
            socket.emit('error', 'Error al eliminar producto');
        }
    });

    socket.on('eliminarCarrito', async (idCarrito) => {
        try {
            // await CartsManager.deleteCart(idCarrito);
            await CartsManager.deleteAllProductsFromCart(idCarrito);
            io.emit('eliminarCarrito', idCarrito);
        } catch (error) {
            socket.emit('error', 'Error al eliminar carrito');
        }
    });

    socket.on('agregarProductToCart', async ({ cart, idProducto }) => {  // Desestructuramos el objeto
        try {
            await CartsManager.addProductToCart(cart, idProducto);
            io.emit('CarritoActualizado', cart);
        } catch (error) {
            socket.emit('error', 'Error al agregar Producto al Carrito');
        }
    });

    socket.on('realTimeProductsRequest', async (data) => {
        const { skip = 0, limit = 10 } = data;
        const productosPaginados = await productsManager.getproductsPaginate(skip, limit);
        socket.emit('realTimeProductsResponse', productosPaginados);
    });
    
});

connDB()

export { io };
