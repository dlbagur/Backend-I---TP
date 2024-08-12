import express from "express"
import fs from "fs"
import VinosManager from "./src/dao/VinosManager.js"

const PORT=8080
const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

VinosManager.path="./archivos/data/vinos.json"

app.get("/", (req, res) => {
    res.write("<h1 style='color:blue;'>Bienvenidos a la home page del servidor de vinos!</h1>");
    res.write("<h3>Lista de vinos: <a href='http://localhost:8080/vinos'>http://localhost:8080/vinos</a></h3>");
    res.write("<h4 style='color:red;'>limit=5: <a href='http://localhost:8080/vinos?limit=5'>http://localhost:8080/vinos?limit=5</a></h4>");
    res.write("<h4 style='color:red;'>skip=10 <a href='http://localhost:8080/vinos?skip=10'>http://localhost:8080/vinos?skip=10</a></h4>");
    res.write("<h4 style='color:red;'>limit=2 & skip=5: <a href='http://localhost:8080/vinos?limit=2&skip=5'>http://localhost:8080/vinos?limit=2&skip=5</a></h4>");
    res.write("<h3>Tintos: <a href='http://localhost:8080/vinos/tintos'>http://localhost:8080/vinos/tintos</a></h3>");
    res.write("<h3>Blancos: <a href='http://localhost:8080/vinos/blancos'>http://localhost:8080/vinos/blancos</a></h3>");
    res.write("<h3>Rosados: <a href='http://localhost:8080/vinos/rosados'>http://localhost:8080/vinos/rosados</a></h3>");
    res.write("<h3>Espumantes: <a href='http://localhost:8080/vinos/espumantes'>http://localhost:8080/vinos/espumantes</a></h3>");
    res.end();
});

app.get("/vinos", async(req, res)=> {
    let vinos = await VinosManager.getVinos()
    let {limit, skip}=req.query
    if(limit){
        limit=Number(limit)
        if(isNaN(limit)){
           return res.status(400).send("El argumento limit tiene que ser numérico") 
        }        
    }else{
        limit=vinos.length
    }

    if(skip){
        skip=Number(skip)
        if(isNaN(skip)){
           return res.status(400).send("El argumento skip tiene que ser numérico") 
        }        
    }else{
        skip=0
    }

    let resultado=vinos.slice(skip,skip+limit)
    res.status(200).send(resultado)
})

app.get("/vinos/:id", async(req, res) => {
    let vinos = await VinosManager.getVinos()
    let {id} = req.params;
    const idaux = id
    id = Number(id);

    if (isNaN(id)) {
        // Si el parámetro no es un número, se trata de una categoría
        const categoria = idaux.toLowerCase();
        let resultado;

        switch (categoria) {
            case "tintos":
                resultado = vinos.filter(vino => vino.category.toLowerCase() === "tintos");
                break;
            case "blancos":
                resultado = vinos.filter(vino => vino.category.toLowerCase() === "blancos");
                break;
            case "rosados":
                resultado = vinos.filter(vino => vino.category.toLowerCase() === "rosados");
                break;
            case "espumantes":
                resultado = vinos.filter(vino => vino.category.toLowerCase() === "espumantes");
                break;
            default:
                resultado = { error: "Categoría no encontrada" };
        }
        res.send(resultado);
    } else {
        // Si el parámetro es un número, se trata de un ID
        const vino = vinos.find(v => v.id === id);
        if (vino) {
            res.status(200).send(vino);
        } else {
            res.status(404).send(`Producto ${id} no encontrado`);
        }
    }
});

app.listen(PORT, ()=>console.log(`Server en linea en puerto http://localhost:${PORT}`))
