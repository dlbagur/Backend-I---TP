import { Router } from "express";
import VinosManager from "../dao/VinosManager.js"
import { error } from "console"

const router = Router();

VinosManager.path="src/data/vinos.json"

const categoriasValidas = ["Tintos", "Blancos", "Rosados", "Espumantes"];    

router.get("/", async (req, res) => {
  let vinos
  try {
    vinos = await VinosManager.getVinos();
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "applcation/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor. Intente mas tarde`,
      detalle: `${error.mensaje}`,
    });
  }

  console.log(vinos);
  const vinosAux=VinosManager.getVinos()
  console.log(vinosAux);

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
    limit = vinos.length;
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

  let resultado = vinos.slice(skip, skip + limit);
  res.setHeader("Content-Type", "applcation/json");
  return res.status(200).json({ resultado });
});

router.get("/:id", async (req, res) => {
  let vinos
  try {
    vinos = await VinosManager.getVinos();
    VinosManager.getVinos();
  } catch (error) {
    console.log(error);
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
    // Si el parámetro no es un número, posiblemente se trata de una categoría
    const categoria = idaux.toLowerCase();
    let resultado;

    switch (categoria) {
      case "tintos":
        resultado = vinos.filter(
          (vino) => vino.category.toLowerCase() === "tintos"
        );
        break;
      case "blancos":
        resultado = vinos.filter(
          (vino) => vino.category.toLowerCase() === "blancos"
        );
        break;
      case "rosados":
        resultado = vinos.filter(
          (vino) => vino.category.toLowerCase() === "rosados"
        );
        break;
      case "espumantes":
        resultado = vinos.filter(
          (vino) => vino.category.toLowerCase() === "espumantes"
        );
        break;
      default:
        res.setHeader("Content-Type", "applcation/json");
        return res.status(400).json({ error: `Categoría no encontrada` });
    }
    res.setHeader("Content-Type", "applcation/json");
    return res.status(200).json({ resultado });
  } else {
    // Si el parámetro es un número, se trata de un ID
    const vino = vinos.find((v) => v.id === id);
    res.setHeader("Content-Type", "applcation/json");
    if (vino) {
      return res.status(200).json({ vino });
    } else {
      return res.status(404).send(`Producto ${id} no encontrado`);
    }
  }
});

router.post("/", async (req, res) => {
  const vinoNuevo = req.body
  vinoNuevo.Status = true
  if (!vinoNuevo.title || !vinoNuevo.description || !vinoNuevo.code || !vinoNuevo.price || !vinoNuevo.stock || !vinoNuevo.category) {
    res.setHeader("Content-Type", "applcation/json");
    return res.status(400).json({ 
      error: 'Es obligatorio completar los campos title, description, code, price, stock y category' 
    });
  }
  let precio = Number(vinoNuevo.price);
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
  let disponible = Number(vinoNuevo.stock);
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
  if (!categoriasValidas.includes(vinoNuevo.category)) {
    res.setHeader("Content-Type", "applcation/json");
    return res.status(400).json({ 
      error: `Las categorias (category) válidas son: "Tintos", "Blancos", "Rosados" o "Espumantes"` 
    });
  }
  let vinos = await VinosManager.getVinos();
  let existe = vinos.find((v) => v.code.toLowerCase() === vinoNuevo.code.toLowerCase());
  if (existe) {
    res.setHeader("Content-Type", "applcation/json");
    return res
      .status(400)
      .json({ error: `Ya existe un vino de nombre ${vinoNuevo.code}` });
  }

  try {
    await VinosManager.addVino(vinoNuevo);
    res.setHeader("Content-Type", "applcation/json");
    return res.status(200).json({ vinoNuevo });
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "applcation/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor! Intente mas tarde`,
      detalle: `${error.mensaje}`,
    });
  }
});

router.put("/:id", async (req, res) => {
  let { id } = req.params;
  id = Number(id);
  if (isNaN(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `id ${id} debe ser numérico` });
  }
  let vinos
  try {
    vinos = await VinosManager.getVinos();
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor. Intente más tarde`,
      detalle: `${error.message}`,
    });
  }
  let vino = vinos.find((h) => h.id === id);
  if (!vino) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe vino con id: ${id}` });
  }

  let aModificar = req.body;
  vinos
  try {
    vinos = await VinosManager.getVinos();
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor. Intente más tarde`,
      detalle: `${error.message}`,
    });
  }
  vino = vinos.find((h) => h.id === id);
  if (!vino) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe vino con id: ${id}` });
  }

  // validaciones
  if (!aModificar.title || !aModificar.description || !aModificar.code || !aModificar.price || !aModificar.stock || !aModificar.category) {
    res.setHeader("Content-Type", "applcation/json");
    return res.status(400).json({ 
      error: 'Es obligatorio completar los campos title, description, code, price, stock y category' 
    });
  }

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
    }
  if (!categoriasValidas.includes(aModificar.category)) {
    res.setHeader("Content-Type", "applcation/json");
    return res.status(400).json({ 
      error: `Las categorias (category) válidas son: "Tintos", "Blancos", "Rosados" o "Espumantes"` 
    });
  }
  vinos = await VinosManager.getVinos();

  if (aModificar.code) {
    let existe = vinos.find(
      (h) =>
        h.code.toLowerCase() === aModificar.code.toLowerCase() && h.id !== id
    );
    if (existe) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `Ya existe otro vino llamado ${aModificar.code}` });
    }
  }

  try {
    let vinoModificado = await VinosManager.updateVino(id, aModificar);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ vinoModificado });
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor. Intente más tarde`,
      detalle: `${error.message}`,
    });
  }
});

router.delete("/:id", async (req, res) => {
  let { id } = req.params;
  id = Number(id);
  if (isNaN(id)) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `El id ${id} debe ser numérico` });
  }
  let vinos;
  try {
    vinos = await VinosManager.getVinos();
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor. Intente más tarde`,
      detalle: `${error.message}`,
    });
  }

  let vinoDel = vinos.find((h) => h.id === id);
  if (!vinoDel) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({ error: `No existe vino con id: ${id}` });
  }

  try {
    let resultado = await VinosManager.deleteVino(id);
    if (resultado > 0) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(200)
        .json({ resultado: `El vino ${id} fue eliminado!` });
    } else {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: `Error al eliminar el vino ${id}` });
    }
  } catch (error) {
    console.log(error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor. Intente más tarde.`,
      detalle: `${error.message}`,
    });
  }
});

export default router;
