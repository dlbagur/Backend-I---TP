import { Router } from "express";
import productsManager from "../dao/ProductsManager.js"
import { error } from "console"
import { isValidObjectId } from "mongoose";
import { io } from '../app.js';

const router = Router();

const categoriasValidas = ["Tintos", "Blancos", "Rosados", "Espumantes"];    

router.get("/", async (req, res) => {
  let products
  try {
    return products = await productsManager.getproducts();
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
  let { id } = req.params
  if(!isValidObjectId(id)){
    res.setHeader('Content-Type','application/json');
    return res.status(400).json({error:`id con format inválido`})
  }
  try {
    let product = await productsManager.getProductById(id);
    if(!product){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`No existe un producto con id ${id}`})
      } else {
        return res.status(200).json({ product });
      }
    
  } catch (error) {
      res.setHeader("Content-Type", "applcation/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor, Intente mas tarde`,
      detalle: `${error.mensaje}`,
    });
  }
});

router.post("/", async (req, res) => {
  let {code, category, title, description, price, stock, status, thumbnails, ...otros} = req.body
  if (!title || !description || !code || !price || !stock || !category) {
    res.setHeader("Content-Type", "applcation/json");
    return res.status(400).json({ 
      error: 'Es obligatorio completar los campos title, description, code, price, stock y category' 
    });
  }
  let precio = Number(price)
  if(isNaN(precio)) {
    {return res.status(400).json({ 
        error: 'El campo PRECIO debe ser numérico' 
      })
    }
    }else{
      if(precio<0) {
        {return res.status(400).json({ 
            error: 'El campo PRECIO debe ser mayor o igual a 0' 
          })
        }
      }
    }
    price = precio
    let disponible = Number(stock);
    if(isNaN(disponible)) {
    {return res.status(400).json({ 
        error: 'El campo STOCK debe ser numérico' 
      })
    } 
    }else{
      if(disponible<0) {
        {return res.status(400).json({ 
            error: 'El campo STOCK debe ser mayor o igual a 0' 
          })
        }
      }
    }
  stock = disponible 
  if (!categoriasValidas.includes(category)) {
    res.setHeader("Content-Type", "applcation/json");
    return res.status(400).json({ 
      error: `Las categorias válidas son: "Tintos", "Blancos", "Rosados" o "Espumantes"` 
    });
  }
  status = true
  thumbnails = []
  let existe
  try {
    existe = await productsManager.getProductBy({code});
  } catch (error) {
      res.setHeader("Content-Type", "applcation/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor, Intente mas tarde`,
      detalle: `${error.mensaje}`,
    });
  }
  if (!existe) {
    try {
        let newProd= await productsManager.addproduct({code, category, title, description, price, stock, status, thumbnails, ...otros});
        io.emit('agregarProducto', newProd);
        res.setHeader("Content-Type", "applcation/json");
        return res.status(200).json({ newProd });
    } catch (error) {
        res.setHeader("Content-Type", "applcation/json");
        res.status(500).json({ error: `Error ${error.mensaje} al agregar producto ${productoNuevo}` });
    }
  } else {
    res.setHeader("Content-Type", "applcation/json");
    return res
      .status(400)
      .json({ error: `Ya existe un producto de nombre ${code}`});
  }
});

router.put("/:id", async (req, res) => {
  let { id } = req.params;
  let producto
  try {
      producto = await productsManager.getProductById(id);
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor. Intente más tarde`,
      detalle: `${error.message}`,
    });
  }
  if (!producto) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe product con id: ${id}` });
  }
  let aModificar = req.body;
  if (aModificar.price) {
    let precio = Number(aModificar.price);
    if(isNaN(precio)) {
      {return res.status(400).json({ 
          error: 'El campo PRECIO debe ser numérico' 
        })
      } 
      }else{
        if(precio<0) {
          {return res.status(400).json({ 
              error: 'El campo PRECIO debe ser mayor o igual a 0' 
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
          error: 'El campo STOCK debe ser numérico' 
        })
      }
      }else{
        if(disponible<0) {
          {return res.status(400).json({ 
              error: 'El campo STOCK debe ser mayor o igual a 0' 
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
          error: `Las categorias válidas son: "Tintos", "Blancos", "Rosados" o "Espumantes"` 
        });
      }
    }
    if (aModificar.code) {
      let existe = productsManager.getProductByCode(aModificar.code)
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
  let { idD }= req.params
  if(!isValidObjectId(idD)){
    res.setHeader('Content-Type','application/json');
    return res.status(400).json({error:`id invalido`})
  }
  let productoExiste = await productsManager.getProductById(idD)
  if(!productoExiste){
      res.setHeader('Content-Type','application/json');
      return res.status(400).json({error:`No existe el producto con id: ${idD}`})
  }
  try {
      let productoEliminado=await productsManager.deleteproduct(idD)
      if(!productoEliminado){
          res.setHeader('Content-Type','application/json');
          return res.status(400).json({error:`No se ha podido eliminar el producto`})
      }
      res.setHeader('Content-Type','application/json');
      return res.status(200).json({productoEliminado});
  } catch (error) {
      console.log(error);
      res.setHeader('Content-Type','application/json');
      return res.status(500).json(
          { error:`Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle:`${error.message}`
          }
      )
  }
});

export default router;