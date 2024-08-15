import fs from "fs"
class VinosManager{
    static path
    static async getVinos(){
        if(fs.existsSync(this.path)){
            let vinos=JSON.parse(await fs.promises.readFile(this.path, {encoding:"utf-8"}))
            return vinos
        }else{
            return []
        }
    }

    static async addVino(vino={}){
        let vinos=await this.getVinos()
        let id=1
        if(vinos.length>0){
            id=Math.max(...vinos.map(v=>v.id))+1
        }
        let nuevoVino={
            id,
            ...vino
        }
        vinos.push(nuevoVino)
        await fs.promises.writeFile(this.path, JSON.stringify(vinos, null, 5))

        return nuevoVino
    }

    static async updateVino(id, aModificar={}){
        let vinos=await this.getVinos()
        let indiceVino=vinos.findIndex(h=>h.id===id)
        if(indiceVino===-1){
            throw new Error(`Error: no existe el id: ${id}`)
        }
        vinos[indiceVino]={
            ...vinos[indiceVino],
            ...aModificar,
            id
        }
        await fs.promises.writeFile(this.path, JSON.stringify(vinos, null, 5))
        return vinos[indiceVino]
    }

    static async deleteVino(id){
        let vinos=await this.getVinos()
        let indiceVino=vinos.findIndex(h=>h.id===id)
        if(indiceVino===-1){
            throw new Error(`Error: no existe id ${id}`)
        }
        let cantidadAntes=vinos.length
        vinos=vinos.filter(h=>h.id!==id)   
        let cantidadDespues=vinos.length
       
        await fs.promises.writeFile(this.path, JSON.stringify(vinos, null, 5))

        return cantidadAntes-cantidadDespues
    }
}

export default VinosManager