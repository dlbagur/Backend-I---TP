import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import productsRouter from './routes/products.router.js';
import productsManager from "./dao/ProductsManager.js"
import cartsRouter from './routes/carts.router.js';
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
 
    // validación de existencia de producto
    socket.on('validarProducto', async (code) => {
        try {
            const existe = await productsManager.getProductBy({ code });
            socket.emit('productoExiste', !!existe);
        } catch (error) {
            console.error('Error al validar el producto:', error);
            socket.emit('productoExiste', false);
        }
    });
    

    // Creación de un nuevo producto
    socket.on('crearProducto', async (producto) => {
        try {
            const nuevoProducto = await productsManager.addproduct(producto);            
            io.emit('agregarProducto', nuevoProducto);
        } catch (error) {
            console.log("Error ", error)
            socket.emit('error', 'Error al agregar producto');
        }
    });

    // Modificación de un producto
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

    // Eliminación de un producto
    socket.on('eliminarProducto', async (idProducto) => {
        try {
            await productsManager.deleteproduct(idProducto);
            io.emit('eliminarProducto', idProducto);
        } catch (error) {
            socket.emit('error', 'Error al eliminar producto');
        }
    });
});

connDB()

export { io };