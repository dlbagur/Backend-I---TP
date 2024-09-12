const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const addProductModal = document.getElementById('addProductModal');
    const openAddProductModalBtn = document.getElementById('openAddProductModal');
    const closeAddProductModalBtns = document.querySelectorAll('.modal .close');
    const editProductModal = document.getElementById('productModal');
    const formAgregarProducto = document.getElementById('form-agrego-producto');
    const formModificarProducto = document.getElementById('form-modificar-producto');

    // Abre el modal de agregar producto
    openAddProductModalBtn.addEventListener('click', () => {
        addProductModal.style.display = 'block';
    });

    // Cierra los modales
    closeAddProductModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            addProductModal.style.display = 'none';
            editProductModal.style.display = 'none';
        });
    });

    // Cierra el modal si se hace clic fuera del modal
    window.addEventListener('click', (event) => {
        if (event.target === addProductModal || event.target === editProductModal) {
            addProductModal.style.display = 'none';
            editProductModal.style.display = 'none';
        }
    });

    socket.on('productoExiste', (existe) => {
        if (existe) {
            alert(`El producto con ese código ya existe.`);
        } else {
            socket.emit('crearProducto', productoPendiente);
            addProductModal.style.display = 'none';
        }
    });
    
    let productoPendiente = null;

    // Agrega un nuevo producto
    formAgregarProducto.addEventListener('submit', (e) => {
        e.preventDefault();
        const product = {
            code: document.getElementById('product-code').value.trim(),
            category: document.getElementById('product-category').value.trim(),
            title: document.getElementById('product-title').value.trim(),
            description: document.getElementById('product-description').value.trim(),
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value),
            status: true,
            thumbnails: [],
        };

        if (!product.code || !product.title || isNaN(product.price) || isNaN(product.stock) || !product.category) {
            alert('Todos los campos son obligatorios y deben ser válidos.');
            return;
        }
    
        if (product.price < 0) {
            alert('El precio no puede ser negativo.');
            return;
        }
        if (product.stock < 0) {
            alert('El stock no puede ser negativo.');
            return;
        }
  
        const categoriasValidas = ["tintos", "blancos", "rosados", "espumantes"];
        const categoryLetraChica = product.category.toLowerCase();
        if (!categoriasValidas.includes(categoryLetraChica)) {
            alert('Las categorías válidas son: "Tintos", "Blancos", "Rosados" o "Espumantes".');
            return;
        }

        productoPendiente = product;

        socket.emit('validarProducto', product.code)
    });

    let currentEditId = null;

    // Maneja clics en los botones de menú
    document.getElementById('product-list').addEventListener('click', (e) => {
        const idProducto = e.target.getAttribute('data-id');

        // Clic en eliminar producto
        if (e.target.classList.contains('delete-btn')) {
            socket.emit('eliminarProducto', idProducto);
        }

        // Clic en editar producto
        if (e.target.classList.contains('edit-btn')) {
            currentEditId = idProducto;
            const card = e.target.closest('.card-io');
            document.getElementById('edit-product-code').value = card.querySelector('.product-code-io').textContent.trim();
            document.getElementById('edit-product-category').value = card.querySelector('.product-category-io').textContent.trim();
            document.getElementById('edit-product-title').value = card.querySelector('.product-title-io').textContent.trim();
            document.getElementById('edit-product-description').value = card.querySelector('.product-description-io').textContent.trim();
            document.getElementById('edit-product-price').value = card.querySelector('.product-price-io').textContent.trim();
            document.getElementById('edit-product-stock').value = card.querySelector('.product-stock-io').textContent.trim();
            editProductModal.style.display = 'block';
        }

        // Clic en agregar al carrito
        if (e.target.classList.contains('add-cart-btn')) {
            alert(`Producto con ID ${idProducto} agregado al carrito`); 
            
            // Agregar la funcionalidad
        }
    });

    // Modifica un producto
    formModificarProducto.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedProduct = {
            code: document.getElementById('edit-product-code').value.trim(),
            category: document.getElementById('edit-product-category').value.trim(),
            title: document.getElementById('edit-product-title').value.trim(),
            description: document.getElementById('edit-product-description').value.trim(),
            price: parseFloat(document.getElementById('edit-product-price').value),
            stock: parseInt(document.getElementById('edit-product-stock').value),
        };

        if (!updatedProduct.code || !updatedProduct.title || isNaN(updatedProduct.price) || isNaN(updatedProduct.stock) || !updatedProduct.category) {
            alert('Todos los campos son obligatorios y deben ser válidos.');
            return;
        }
    
        if (updatedProduct.price < 0) {
            alert('El precio no puede ser negativo.');
            return;
        }
        if (updatedProduct.stock < 0) {
            alert('El stock no puede ser negativo.');
            return;
        }

        const categoriasValidas = ["tintos", "blancos", "rosados", "espumantes"];
        const categoryLetraChica = updatedProduct.category.toLowerCase();
        if (!categoriasValidas.includes(categoryLetraChica)) {
            alert('Las categorías válidas son: "Tintos", "Blancos", "Rosados" o "Espumantes".');
            return;
        }
  
        socket.emit('modificarProducto', { _id: currentEditId, ...updatedProduct });
        editProductModal.style.display = 'none';
    });


    // Actualiza la lista de productos cuando se agrega uno nuevo
    socket.on('agregarProducto', (producto) => {
        const productList = document.getElementById('product-list');
        const productItem = document.createElement('li');
        productItem.classList.add('card-io');
        productItem.setAttribute('data-id', producto._id);
        productItem.innerHTML = `
            <span class="product-code-io">${producto.code}</span>
            <br> 
            <span class="product-category-io">${producto.category}</span> - 
            <span class="product-title-io">${producto.title}</span>
            <br>
            <span class="product-description-io">Notas: ${producto.description}</span>
            <br> 
            Precio: $<span class="product-price-io">${producto.price}</span> - 
            Stock: <span class="product-stock-io">${producto.stock}</span>
            <div class="dropdown">
                <button class="dropdown-btn">Opciones</button>
                <div class="dropdown-menu">
                    <a href="#" class="edit-btn" data-id="${producto._id}">Modificar</a>
                    <a href="#" class="delete-btn" data-id="${producto._id}">Eliminar</a>
                    <a href="#" class="add-cart-btn" data-id="${producto._id}">Agregar al Carrito</a>
                </div>
            </div>
        `;
        productList.appendChild(productItem);
    });

    // Elimina un producto de la lista
    socket.on('eliminarProducto', (idProducto) => {
        const productList = document.getElementById('product-list');
        const itemToRemove = productList.querySelector(`li[data-id="${idProducto}"]`);
        if (itemToRemove) {
            productList.removeChild(itemToRemove);
        }
    });

    // Actualiza un producto modificado en la lista
    socket.on('productoModificado', (producto) => {
        const productList = document.getElementById('product-list');
        const itemToUpdate = productList.querySelector(`li[data-id="${producto._id}"]`);
        if (itemToUpdate) {
            itemToUpdate.querySelector('.product-code-io').textContent = producto.code;
            itemToUpdate.querySelector('.product-category-io').textContent = producto.category;
            itemToUpdate.querySelector('.product-title-io').textContent = producto.title;
            itemToUpdate.querySelector('.product-description-io').textContent = producto.description;
            itemToUpdate.querySelector('.product-price-io').textContent = producto.price;
            itemToUpdate.querySelector('.product-stock-io').textContent = producto.stock;
        }
    });


});
