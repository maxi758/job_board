const inputUser = document.getElementById("input-user");
const inputPassword = document.getElementById("input-password");
const btnLogin = document.getElementById("btn-login");
const mensajeError = document.getElementById("error-login");


btnLogin.addEventListener("click", ()=> {
    
const data = {
    user: inputUser.value,
    pwd: inputPassword.value,
};

const xhr = new XMLHttpRequest();
console.log("s",xhr);
// Cuando vuelva la respuesta...
    xhr.addEventListener("load", function () {

        // Hago el parse del JSON para tener la respuesta en un objeto
        const response = JSON.parse(xhr.responseText); 
        console.log("hola");  
        // Si el status de la respuesta es 200, es que estuvo todo bien
        // y en la respuesta definí que venga una propiedad .url indicando
        // una ruta para navegar
        if (xhr.status === 200) {
        window.location.href = response.url;
        } else if(xhr.status === 400){
        // Si es otro es que hubo error y en la respuesta espero recibir un
        // atributo .error con el detalle (y lo muestro en el <p> de mensaje de error)
        console.log(xhr.status, response);
        mensajeError.textContent = response.error;
        }

    });

// Envío el request especificando el tipo de contenido como JSON
xhr.open("POST", "/login");
xhr.setRequestHeader("Content-Type", "application/json");
xhr.send(JSON.stringify(data));
/*xhr.open("POST", "/register");
xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
xhr.send(`user=${data.user}&pwd=${data.pwd}&pwrRep=${data.pwdRep}`);*/
});