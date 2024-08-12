import { existsSync, promises } from "fs"
class VinosManager{
    static path

    static async getVinos(){
        if(existsSync(this.path)){
            return JSON.parse(await promises.readFile(this.path, {encoding:"utf-8"}))
        }else{
            return []
        }
    }
}

export default VinosManager