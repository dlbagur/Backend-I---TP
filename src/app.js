import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import productsRouter from './routes/products.router.js';
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

// WebSocket
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
    
    socket.on('agregarProducto', (producto) => {
        io.emit('agregarProducto', producto);
    });

    socket.on('eliminarProducto', (idProducto) => {
        io.emit('eliminarProducto', idProducto);
    });
});

export { io };
