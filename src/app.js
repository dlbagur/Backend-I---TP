import express from "express"
import vinosRouter from "./routes/vinos.router.js";
import cartsRouter from './routes/carts.router.js';

const app=express()
const PORT=8080

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/api/vinos', vinosRouter);
app.use('/api/carts', cartsRouter);

app.get("/", (req, res)=>{
    res.setHeader("Content-Type", "text/plain")
    res.status(200).send("ok")
})    


app.listen(PORT, () => {
    console.log(`Server en linea en puerto http://localhost:${PORT}`)
})
