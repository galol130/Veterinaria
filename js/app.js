let DB;
let editando;

// Campos del formulario
const mascotaInput = document.querySelector('#mascota');
const ownerInput = document.querySelector('#owner');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');

// UI
const formulario = document.querySelector('#nueva-cita');
const contenedorCitas = document.querySelector('#citas');

// Heading
const heading = document.querySelector('#administra');

//Funciones que cargan al iniciar el programa
window.onload = () => {
    eventListeners();
    crearDB();
}

// Registrar eventos
function eventListeners() {
    mascotaInput.addEventListener('input', datosCita);
    ownerInput.addEventListener('input', datosCita);
    telefonoInput.addEventListener('input', datosCita);
    fechaInput.addEventListener('input', datosCita);
    horaInput.addEventListener('input', datosCita);
    sintomasInput.addEventListener('input', datosCita);

    formulario.addEventListener('submit', nuevaCita);
}

// Objeto con la información de la cita
const citaObj = {
    mascota: '',
    owner: '',
    telefono: '',
    fecha: '',
    hora: '',
    sintomas: ''
}

// Agrega datos al objeto de cita
function datosCita(e) {
    citaObj[e.target.name] = e.target.value;
}

//Classes
class Citas {
    constructor() {
        this.citas = [];
    }

    agregarCita(cita) {
        this.citas = [...this.citas, cita];
    }
    editarCita(citaActualizada) {
        this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita);
    }
    eliminarCita(id) {
        this.citas = this.citas.filter(cita => cita.id !== id)
    }
}

class UI {

    constructor({
        citas
    }) {
        this.textoHeading(citas);
    }

    imprimirAlerta(mensaje, tipo) {
        // Crear el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12', 'py-1', 'message');

        // Agregar clase en base al tipo de error
        if (tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        // Mensaje de error
        divMensaje.textContent = mensaje;

        // Agregar al DOM
        document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'));

        // Quitar la alerta después de 4 segundos
        setTimeout(() => {
            divMensaje.remove();
        }, 4000);
    }

    imprimirCitas() {
        this.limpiarHTML();
        this.textoHeading(citas);

        // Leer el contenido de la base de datos
        const objectStore = DB.transaction('citas').objectStore('citas');

        const fnTextoHeading = this.textoHeading;

        const total = objectStore.count();
        total.onsuccess = function () {
            fnTextoHeading(total.result)
        }

        objectStore.openCursor().onsuccess = function (e) {

            const cursor = e.target.result;

            if (cursor) {
                const {
                    mascota,
                    owner,
                    telefono,
                    fecha,
                    hora,
                    sintomas,
                    id
                } = cursor.value;

                const divCita = document.createElement('div');
                divCita.classList.add('cita', 'p-3');
                divCita.dataset.id = id;

                // SCRIPTING DE LOS ELEMENTOS...
                const mascotaParrafo = document.createElement('h2');
                mascotaParrafo.classList.add('card-title', 'font-weight-bolder');
                mascotaParrafo.innerHTML = `${mascota}`;

                const ownerParrafo = document.createElement('p');
                ownerParrafo.innerHTML = `<span class="font-weight-bolder">Propietario: </span> ${owner}`;

                const telefonoParrafo = document.createElement('p');
                telefonoParrafo.innerHTML = `<span class="font-weight-bolder">Teléfono: </span> ${telefono}`;

                const fechaParrafo = document.createElement('p');
                fechaParrafo.innerHTML = `<span class="font-weight-bolder">Fecha: </span> ${fecha}`;

                const horaParrafo = document.createElement('p');
                horaParrafo.innerHTML = `<span class="font-weight-bolder">Hora: </span> ${hora}`;

                const sintomasParrafo = document.createElement('p');
                sintomasParrafo.innerHTML = `<span class="font-weight-bolder">Síntomas: </span> ${sintomas}`;

                // Agregar un botón de eliminar...
                const btnEliminar = document.createElement('button');
                btnEliminar.onclick = () => eliminarCita(id); // añade la opción de eliminar
                btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
                btnEliminar.innerHTML = 'Eliminar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'

                // Añade un botón de editar...
                const btnEditar = document.createElement('button');
                const cita = cursor.value;
                btnEditar.onclick = () => cargarEdicion(cita);

                btnEditar.classList.add('btn', 'btn-info');
                btnEditar.innerHTML = 'Editar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>'

                // Agregar al HTML
                divCita.appendChild(mascotaParrafo);
                divCita.appendChild(ownerParrafo);
                divCita.appendChild(telefonoParrafo);
                divCita.appendChild(fechaParrafo);
                divCita.appendChild(horaParrafo);
                divCita.appendChild(sintomasParrafo);
                divCita.appendChild(btnEliminar)
                divCita.appendChild(btnEditar)

                contenedorCitas.appendChild(divCita);

                // Ve al siguiente elemento
                cursor.continue();

            }
        }
    }
    textoHeading(resultado) {
        if(resultado > 0 ) {
            heading.textContent = `Log de Citas (Edita o remueve)`
        } else {
            heading.textContent = 'No hay Citas, comienza creando una'
        }
    }
    limpiarHTML() {
        while (contenedorCitas.firstChild) {
            contenedorCitas.removeChild(contenedorCitas.firstChild)
        }
    }
}

const administrarCitas = new Citas();
const ui = new UI(administrarCitas);

// Valida y agrega una nueva cita a la clase de citas
function nuevaCita(e) {
    e.preventDefault();

    // Extraer la información del objeto de cita (Destructuring)
    const {
        mascota,
        owner,
        telefono,
        fecha,
        hora,
        sintomas
    } = citaObj;

    // validar
    if (mascota === '' || owner === '' || telefono === '' || fecha === '' || hora === '' || sintomas === '') {
        ui.imprimirAlerta('Todos los campos son obligatorios', 'error');

        return;
    }

    if (editando) {

        // Pasar el objeto de la cita a edición
        administrarCitas.editarCita({
            ...citaObj
        })

        //Editar en IndexedDB
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');

        objectStore.put(citaObj);

        transaction.oncomplete = () => {
            ui.imprimirAlerta('Guardado Correctamente');

            // regresar el texto del botón a su estado original
            formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita';

            // Quitar modo edición
            editando = false;
        }

        transaction.onerror = () => {
            console.log('Hubo un error');
        }

    } else {
        // generar un id único
        citaObj.id = Date.now();

        // Creando una nueva cita.
        administrarCitas.agregarCita({
            ...citaObj
        });

        // Insertar Registro en IndexedDB
        const transaction = DB.transaction(['citas'], 'readwrite');

        // Habilitar el objectstore
        const objectStore = transaction.objectStore('citas');

        // Insertar en la BD
        objectStore.add(citaObj);

        transaction.oncomplete = function () {
            console.log('Cita Agregada');

            // Mostrar mensaje de que todo esta bien...
            ui.imprimirAlerta('Se agregó correctamente')
        }

    }



    // Reiniciar el objeto para la validación
    reiniciarObjeto();

    // Reiniciar el formulario
    formulario.reset();

    // Mostrar el HTML de las citas
    ui.imprimirCitas(administrarCitas);

}


function reiniciarObjeto() {
    citaObj.mascota = '';
    citaObj.owner = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}


function eliminarCita(id) {
    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');

    objectStore.delete(id);

    transaction.oncomplete = () => {
        console.log(`Cita ${id} eliminada...`);
        ui.imprimirCitas();
    }

    transaction.onerror = () => {
        console.log('Hubo un error');
    }
}

// Carga los datos y el modo edición
function cargarEdicion(cita) {
    const {
        mascota,
        owner,
        telefono,
        fecha,
        hora,
        sintomas,
        id
    } = cita;

    // Llenar los inputs
    mascotaInput.value = mascota;
    ownerInput.value = owner;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    // Llenar el objeto
    citaObj.mascota = mascota;
    citaObj.owner = owner;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha;
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;


    // Cambiar el texto del botón
    formulario.querySelector('button[type="submit"]').textContent = 'Guardar cambios';

    editando = true;

}

function crearDB() {
    //crear la BBDD versión 1.0 en IndexedDB
    const crearDB = window.indexedDB.open('cita', 1);

    crearDB.onerror = () => console.log('Hubo un error al intentar crear la BBDD');

    crearDB.onsuccess = function () {
        console.log('BBDD creada con éxito');
        DB = crearDB.result;

        ui.imprimirCitas();
    }

    //Definir el esquema de la BBDD
    crearDB.onupgradeneeded = function (e) {
        const db = e.target.result;

        const objectStore = db.createObjectStore('citas', {
            keyPath: 'id',
            autoIncrement: true
        });

        //Defnir las columnas
        objectStore.createIndex('mascota', 'mascota', {
            unique: false
        });
        objectStore.createIndex('owner', 'owner', {
            unique: false
        });
        objectStore.createIndex('telefono', 'telefono', {
            unique: false
        });
        objectStore.createIndex('fecha', 'fecha', {
            unique: false
        });
        objectStore.createIndex('hora', 'hora', {
            unique: false
        });
        objectStore.createIndex('sitnomas', 'sitnomas', {
            unique: false
        });
        objectStore.createIndex('id', 'id', {
            unique: true
        });

        console.log('BBDD creada con columnas y lista');
    }

}