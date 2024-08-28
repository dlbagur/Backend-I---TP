import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import productsRouter from './routes/products.router.js';
import productsManager from "./dao/ProductsManager.js"
import cartsRouter from './routes/carts.router.js';
import { router as vistasRouter } from './routes/vistas.routers.js';

const app = express();
const PORT = 8080;

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
    
    // Manejar la creación de un nuevo producto
    socket.on('crearProducto', async (producto) => {
        try {
            const nuevoProducto = await productsManager.addproduct(producto);
            io.emit('agregarProducto', nuevoProducto);
        } catch (error) {
            socket.emit('error', 'Error al agregar producto');
        }
    });

    // Manejar la eliminación de un producto
    socket.on('eliminarProducto', async (idProducto) => {
        try {
            await productsManager.deleteproduct(idProducto);
            io.emit('eliminarProducto', idProducto);
        } catch (error) {
            socket.emit('error', 'Error al eliminar producto');
        }
    });
});

export { io };