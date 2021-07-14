// lo estuve usando para probar y ver que traía de la base de datos, más adelante lo "descopypasteo"

function showError(err) {
  console.log("------- ERRROOOOOOOOOOOOORRRRRR -------");
  console.log(err);
}

const listPublications = (publication)=> {
  console.log("Lista de productos:");

  const allPublications = publication.map((item) => {
    return {
      content: item.contenido,
      date: item.date,
      author:item.author,
    };
  });

  allPublications.forEach((item) => console.log(item));
}

const showPublication = (publication)=> {
  console.log("Producto:");
  console.log(publication);
}

module.exports = {
  showError,
  listPublications,
  showPublication,
}