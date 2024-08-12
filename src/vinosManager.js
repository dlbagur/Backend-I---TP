const fs = require("fs")

let rutaArchivos = "./archivos/vinos.json"

class VinosManager {
    constructor(ruta) {
        this.path=ruta
    }

    async getvinos() {
        if (fs.existsSync(this.path)) {
            return JSON.parse(await fs.promises.readFile(this.path, {encoding:"utf-8"}))
        } else {
            return []
        }
    }

    async addVino(variedad, marca, nombre, precio, imagen, cantidad) {
        // validaciones
            // AGREGAR ACA VALIDACIONES
        //
        let vinos = await this.getvinos()

        let id=1
        if (vinos.length>0) {
            id=Math.max(...vinos.map(d=>d.id))+1
        }
        
        vinos.push({
            id, variedad, marca, nombre, precio, imagen, cantidad
        })

        await fs.promises.writeFile(this.path, JSON.stringify(vinos, null, 5))
        console.log(`Vino ${nombre} generado con id ${id}`)
    }
}

const vinosGestor = new VinosManager("./archivos/vinos.json")

const app = async ()=>{
    console.log(await vinosGestor.getvinos())
    await vinosGestor.addVino("Verde", "Quinta do Louridal", "Alvarinho Poema Verde", 25000, "./archivos/imagenes/vino-verde.jpg", 10)
    console.log(await vinosGestor.getvinos())
}

app()
