// lo estuve usando para probar y ver que traía de la base de datos, más adelante lo "descopypasteo"

function verError(err) {
  console.log("------- ERRROOOOOOOOOOOOORRRRRR -------");
  console.log(err);
}

function verProductos(productos) {
  console.log("Lista de productos:");

  const productos2 = productos.map((item) => {
    return {
     // id: item.user.toString(),
      nombre: item.contenido,
      //precio: "$" + item.precio.toFixed(2),
      //foto: item.foto,
    };
  });

  productos2.forEach((item) => console.log(item));
}

function verProducto(producto) {
  console.log("Producto:");
  console.log(producto);
}

module.exports = {
  error: verError,
  listaProductos: verProductos,
  producto: verProducto
}