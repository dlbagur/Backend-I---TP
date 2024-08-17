Los datos ingresados corresponden a una Vinería, se clasifican por tipo de vino ("tintos", "blancos", "rosados" y "espumantes), 4 productos por categoría, numerados (id) del 1 al 16.

Se puede utilizar:
    localhost:8080/api/vinos
    localhost:8080/api/vinos?limit=5
    localhost:8080/api/vinos?skip=10
    localhost:8080/api/vinos?limit=3&skip=10
    localhost:8080/api/vinos/tintos
    localhost:8080/api/vinos/blancos
    localhost:8080/api/vinos/rosados
    localhost:8080/api/vinos/espumantes

post localhost:8080/api/carts
get localhost:8080/api/carts/n
put localhost:8080/api/carts/x/vino/y

Para Post pueden utilizar la siguiente info, o usarla de modelo:
{"code":"Alamos Malbec", "category":"Tintos","title":"Catena Zapata", "description":"excelente vino tinto", "price":5000, "stock":1}

