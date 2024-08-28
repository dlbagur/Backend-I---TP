import { Router } from "express";
import productsManager from "../dao/ProductsManager.js"
import { error } from "console"
import { io } from '../app.js';

const router = Router();

productsManager.path="src/data/products.json"

const categoriasValidas = ["Tintos", "Blancos", "Rosados", "Espumantes"];    

router.get("/", async (req, res) => {
  let products
  try {
    products = await productsManager.getproducts();
  } catch (error) {
    res.setHeader("Content-Type", "applcation/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor. Intente mas tarde`,
      detalle: `${error.mensaje}`,
    });
  }

  let { limit, skip } = req.query;
  if (limit) {
    limit = Number(limit);
    if (isNaN(limit)) {
      res.setHeader("Content-Type", "applcation/json");
      return res
      .status(400)
      .json({ error: `El argumento limit tiene que ser numérico` });
    }
  } else {
      limit = products.length;
  }

  if (skip) {
    skip = Number(skip);
    if (isNaN(skip)) {
      res.setHeader("Content-Type", "applcation/json");
      return res
        .status(400)
        .json({ error: `El argumento skip tiene que ser numérico` });
    }
  } else {
      skip = 0;
  }

  let resultado = products.slice(skip, skip + limit);
  res.setHeader("Content-Type", "applcation/json");
  return res.status(200).json({ resultado });
});

router.get("/:id", async (req, res) => {
  let products
  try {
      products = await productsManager.getproducts();
  } catch (error) {
      res.setHeader("Content-Type", "applcation/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor, Intente mas tarde`,
      detalle: `${error.mensaje}`,
    });
  }

  let { id } = req.params;
  const idaux = id;
  id = Number(id);

  if (isNaN(id)) {
    const categoria = idaux.toLowerCase();
    let resultado;

    switch (categoria) {
      case "tintos":
        resultado = products.filter(
          (product) => product.category.toLowerCase() === "tintos"
        );
        break;
      case "blancos":
        resultado = products.filter(
          (product) => product.category.toLowerCase() === "blancos"
        );
        break;
      case "rosados":
        resultado = products.filter(
          (product) => product.category.toLowerCase() === "rosados"
        );
        break;
      case "espumantes":
        resultado = products.filter(
          (product) => product.category.toLowerCase() === "espumantes"
        );
        break;
      default:
        res.setHeader("Content-Type", "applcation/json");
        return res.status(400).json({ error: `Categoría no encontrada` });
    }
    res.setHeader("Content-Type", "applcation/json");
    return res.status(200).json({ resultado });
  } else {
    const product = products.find((v) => v.id === id);
    res.setHeader("Content-Type", "applcation/json");
    if (product) {
      return res.status(200).json({ product });
    } else {
      return res.status(404).send(`Producto ${id} no encontrado`);
    }
  }
});

router.post("/", async (req, res) => {
  const productNuevo = req.body
  productNuevo.Status = true
  if (!productNuevo.title || !productNuevo.description || !productNuevo.code || !productNuevo.price || !productNuevo.stock || !productNuevo.category) {
    res.setHeader("Content-Type", "applcation/json");
    return res.status(400).json({ 
      error: 'Es obligatorio completar los campos title, description, code, price, stock y category' 
    });
  }
  let precio = Number(productNuevo.price)
  if(isNaN(precio)) {
    {return res.status(400).json({ 
        error: 'El campo precio debe ser numérico' 
      })
    }
    }else{
      if(precio<0) {
        {return res.status(400).json({ 
            error: 'El campo precio debe ser mayor o igual a 0' 
          })
        }
      }
    }
    productNuevo.price = precio
    let disponible = Number(productNuevo.stock);
    if(isNaN(disponible)) {
    {return res.status(400).json({ 
        error: 'El campo stock debe ser numérico' 
      })
    } 
    }else{
      if(disponible<0) {
        {return res.status(400).json({ 
            error: 'El campo stock debe ser mayor o igual a 0' 
          })
        }
      }
    }
  productNuevo.stock = disponible 
  if (!categoriasValidas.includes(productNuevo.category)) {
    res.setHeader("Content-Type", "applcation/json");
    return res.status(400).json({ 
      error: `Las categorias (category) válidas son: "Tintos", "Blancos", "Rosados" o "Espumantes"` 
    });
  }

  let products
  try {
      products = await productsManager.getproducts();
  } catch (error) {
      res.setHeader("Content-Type", "applcation/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor, Intente mas tarde`,
      detalle: `${error.mensaje}`,
    });
  }

  let existe = products.find((v) => v.code.toLowerCase() === productNuevo.code.toLowerCase());
  if (existe) {
    res.setHeader("Content-Type", "applcation/json");
    return res
      .status(400)
      .json({ error: `Ya existe un product de nombre ${productNuevo.code}` });
  }
  let newProd
  try {
    newProd= await productsManager.addproduct(productNuevo);
    io.emit('agregarProducto', newProd);
    res.setHeader("Content-Type", "applcation/json");
    return res.status(200).json({ newProd });
  } catch (error) {
    res.setHeader("Content-Type", "applcation/json");
    res.status(500).json({ error: `Error ${error.mensaje} al agregar producto ${productNuevo}` });
  }

});

router.put("/:id", async (req, res) => {
  let { id } = req.params;
  id = Number(id);
  if (isNaN(id)) {
      res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `id ${id} debe ser numérico` });
  }
  let products
  try {
      products = await productsManager.getproducts();
  } catch (error) {
      res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor. Intente más tarde`,
      detalle: `${error.message}`,
    });
  }
  let product = products.find((h) => h.id === id);
  if (!product) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe product con id: ${id}` });
  }

  let aModificar = req.body;
  product = products.find((h) => h.id === id);
  if (!product) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe product con id: ${id}` });
  }

  if (aModificar.price) {
    let precio = Number(aModificar.price);
    if(isNaN(precio)) {
      {return res.status(400).json({ 
          error: 'El campo precio debe ser numérico' 
        })
      } 
      }else{
        if(precio<0) {
          {return res.status(400).json({ 
              error: 'El campo precio debe ser mayor o igual a 0' 
            })
          }
        }
      }
    aModificar.price=precio
  }
  if(aModificar.stock) {
    let disponible = Number(aModificar.stock);
    if(isNaN(disponible)) {
      {return res.status(400).json({ 
          error: 'El campo stock debe ser numérico' 
        })
      } 
      }else{
        if(disponible<0) {
          {return res.status(400).json({ 
              error: 'El campo stock debe ser mayor o igual a 0' 
            })
          }
        }
      };
      aModificar.stock=disponible
    }
    if(aModificar.category) {
    if (!categoriasValidas.includes(aModificar.category)) {
        res.setHeader("Content-Type", "applcation/json");
        return res.status(400).json({ 
          error: `Las categorias (category) válidas son: "Tintos", "Blancos", "Rosados" o "Espumantes"` 
        });
      }
    }

    if (aModificar.code) {
      let existe = products.find(
        (h) =>
          h.code.toLowerCase() === aModificar.code.toLowerCase() && h.id !== id
      );
      if (existe) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: `Ya existe otro product llamado ${aModificar.code}` });
      }
  }
  let productModificado
  try {
    productModificado = await productsManager.updateproduct(id, aModificar);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ productModificado });
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor al actualizar producto. Intente más tarde`,
      detalle: `${error.message}`,
    });
  }
});

router.delete("/:id", async (req, res) => {
  let { id } = req.params;
  id = Number(id);
  if (isNaN(id)) {
      res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `id ${id} debe ser numérico` });
  }
  let products
  try {
      products = await productsManager.getproducts();
  } catch (error) {
      res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor. Intente más tarde`,
      detalle: `${error.message}`,
    });
  }
  let product = products.find((h) => h.id === id);
  if (!product) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe product con id: ${id}` });
  }
  try {
    await productsManager.deleteproduct(id);
    io.emit('eliminarProducto', id);
    res.status(200).json({ mensaje: 'Producto eliminado' });
  } catch (error) {
      res.status(500).json({ error: 'Error al eliminar producto' });
  }
  
});

export default router;