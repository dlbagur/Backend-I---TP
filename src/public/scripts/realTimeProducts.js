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
  
        socket.emit('crearProducto', product);
        addProductModal.style.display = 'none';
    });

    let currentEditId = null;

    // Maneja clics en los botones de editar y eliminar
    document.getElementById('product-list').addEventListener('click', (e) => {
        const idProducto = e.target.getAttribute('data-id');

        if (e.target.classList.contains('delete-btn')) {
            socket.emit('eliminarProducto', parseInt(idProducto));
        }

        if (e.target.classList.contains('edit-btn')) {
            currentEditId = idProducto;
            const card = e.target.closest('.card-io');

            // Obtener datos del producto de la tarjeta
            const productCode = card.querySelector('.product-code-io').textContent.trim();
            const productCategory = card.querySelector('.product-category-io').textContent.trim();
            const productTitle = card.querySelector('.product-title-io').textContent.trim();
            const productDescription = card.querySelector('.product-description-io').textContent.trim();
            const productPrice = card.querySelector('.product-price-io').textContent.trim();
            const productStock = card.querySelector('.product-stock-io').textContent.trim();

            // Asignar valores al modal de edición
            document.getElementById('edit-product-code').value = productCode;
            document.getElementById('edit-product-category').value = productCategory;
            document.getElementById('edit-product-title').value = productTitle;
            document.getElementById('edit-product-description').value = productDescription;
            document.getElementById('edit-product-price').value = productPrice;
            document.getElementById('edit-product-stock').value = productStock;

            editProductModal.style.display = 'block';
        }
    });

    // Modifica un producto
    formModificarProducto.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedProduct = {
            id: currentEditId,
            code: document.getElementById('edit-product-code').value.trim(),
            category: document.getElementById('edit-product-category').value.trim(),
            title: document.getElementById('edit-product-title').value.trim(),
            description: document.getElementById('edit-product-description').value.trim(),
            price: parseFloat(document.getElementById('edit-product-price').value),
            stock: parseInt(document.getElementById('edit-product-stock').value),
        };

        // Validación
        if (!updatedProduct.code || !updatedProduct.category || !updatedProduct.title || isNaN(updatedProduct.price) || isNaN(updatedProduct.stock)) {
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

        socket.emit('modificarProducto', updatedProduct);
        editProductModal.style.display = 'none';
    });

    // Actualiza la lista de productos cuando se agrega uno nuevo
    socket.on('agregarProducto', (producto) => {
        const productList = document.getElementById('product-list');
        const productItem = document.createElement('li');
        productItem.classList.add('card-io');
        productItem.setAttribute('data-id', producto.id);
        productItem.innerHTML = `
            <span class="product-code-io">${producto.code}</span>
            <br>
            <span class="product-category-io">${producto.category}</span> - 
            <span class="product-title-io">${producto.title}</span>
            <br>
            <span class="product-description-io">${producto.description}</span>
            <br>
            Precio: $<span class="product-price-io">${producto.price}</span> - 
            Stock: <span class="product-stock-io">${producto.stock}</span>
            <div class="card-menu">
                <button class="edit-btn" data-id="${producto.id}">Editar</button>
                <button class="delete-btn" data-id="${producto.id}">Eliminar</button>
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
        const itemToUpdate = productList.querySelector(`li[data-id="${producto.id}"]`);
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
