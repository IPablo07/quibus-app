/**
 * auth.js
 * Valida los formularios de pages/login.html y pages/registro.html.
 *
 * Antes estas dos pantallas no cargaban ningun script: el formulario no
 * comprobaba nada y el mensaje "Ingresa un correo valido" estaba escrito en el
 * HTML, asi que se veia siempre, incluso con el campo vacio.
 *
 * Ahora los mensajes empiezan ocultos y solo aparecen al validar. Cada campo
 * apunta con aria-describedby a su propio parrafo, que lleva role="alert" para
 * que el lector de pantalla lo anuncie en cuanto se rellena.
 */

/**
 * Traduce el motivo del fallo a un mensaje en español.
 * Se apoya en la validacion nativa del navegador (ValidityState) en vez de
 * reimplementarla: el HTML ya declara required, type="email" y minlength.
 */
function mensajeDeError(campo) {
  const v = campo.validity;
  const etiqueta = campo.labels && campo.labels[0]
    ? campo.labels[0].textContent.replace("*", "").trim().toLowerCase()
    : "este campo";

  if (v.valueMissing) return `Completa el campo ${etiqueta}.`;
  if (v.typeMismatch && campo.type === "email") {
    return "Escribe un correo con el formato nombre@ejemplo.com.";
  }
  if (v.tooShort) {
    return `La contraseña necesita al menos ${campo.minLength} caracteres.`;
  }
  return "Revisa este dato.";
}

/** Pinta el error de un campo, o lo limpia si el mensaje viene vacio. */
function marcarCampo(campo, mensaje) {
  const aviso = document.getElementById(`${campo.id}-error`);

  if (mensaje) {
    campo.classList.add("input-error");
    campo.setAttribute("aria-invalid", "true");
    if (aviso) {
      aviso.textContent = mensaje;
      aviso.hidden = false;
    }
  } else {
    campo.classList.remove("input-error");
    campo.removeAttribute("aria-invalid");
    if (aviso) {
      aviso.textContent = "";
      aviso.hidden = true;
    }
  }
}

/**
 * Valida un campo y devuelve true si esta correcto.
 * `confirmar` es el unico caso que la validacion nativa no cubre: hay que
 * compararlo con la contraseña a mano.
 */
function validarCampo(campo, form) {
  let mensaje = "";

  if (!campo.checkValidity()) {
    mensaje = mensajeDeError(campo);
  } else if (campo.id === "confirmar") {
    const password = form.querySelector("#password");
    if (password && campo.value !== password.value) {
      mensaje = "Las dos contraseñas no coinciden.";
    }
  }

  marcarCampo(campo, mensaje);
  return mensaje === "";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-card form");
  if (!form) return;

  const campos = Array.from(form.querySelectorAll("input"));

  // Al enviar se validan todos, para que el usuario vea de una vez todo lo que
  // le falta en vez de descubrir los errores de uno en uno.
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const invalidos = campos.filter((campo) => !validarCampo(campo, form));

    if (invalidos.length > 0) {
      // El foco va al primer campo con problema: sin esto, quien navega con
      // teclado o lector de pantalla no sabria donde esta el error.
      invalidos[0].focus();
      return;
    }

    // Prototipo sin backend: aqui iria el POST contra el servidor.
    // Guardar datos del usuario registrado
    const nombre = form.querySelector("#nombre")?.value;
    const apellido = form.querySelector("#apellido")?.value;
    const email = form.querySelector("#email")?.value;

    if (nombre && apellido && email) {
      localStorage.setItem("usuarioActual", JSON.stringify({
        nombre: nombre,
        apellido: apellido,
        email: email
      }));
    }
    window.location.href = "../index.html";
  });

  campos.forEach((campo) => {
    // Mientras se escribe solo se limpia un error ya visible; no se marca uno
    // nuevo, porque avisar de "correo invalido" a la primera letra es hostil.
    campo.addEventListener("input", () => {
      if (campo.classList.contains("input-error")) validarCampo(campo, form);
    });

    // Al salir del campo si se valida, siempre que el usuario haya escrito algo.
    campo.addEventListener("blur", () => {
      if (campo.value !== "") validarCampo(campo, form);
    });
  });
});
