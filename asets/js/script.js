/* ----------------------------------------------------------
   1. DATOS Y VARIABLES GLOBALES
-----------------------------------------------------------*/

let carrito = JSON.parse(localStorage.getItem("carritoEcommerce")) || [];

const contenedorProductosNuevaColeccion = document.querySelector("#contenedor-productos-nueva-coleccion");
const listaCarrito = document.querySelector("#lista-carrito");
const totalCarritoElement = document.querySelector("#total-carrito");
const contadorCarritoElement = document.querySelector("#contador-carrito");
const botonFinalizarCompra = document.querySelector(".boton-finalizar-compra")
let productosNuevaColeccion = [];


/* ----------------------------------------------------------
   2. FUNCIONES AUXILIARES
-----------------------------------------------------------*/

const formatarPrecio = (centavos) => {
    return (centavos / 100).toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS"
    });
};

const salvarCarrito = () => {
    localStorage.setItem("carritoEcommerce", JSON.stringify(carrito));
};


/* ----------------------------------------------------------
   3. RENDERIZAR PRODUCTOS
-----------------------------------------------------------*/

async function renderizarProductosNuevaColeccion() {
    contenedorProductosNuevaColeccion.innerHTML = "";

    try {
        const response = await fetch("./asets/productos/nueva_coleccion.json");
        productosNuevaColeccion = await response.json();

        productosNuevaColeccion.forEach(producto => {
            const cardProductoNuevaColeccion = document.createElement("div");
            cardProductoNuevaColeccion.classList.add("col-3", "card", "border", "border-0", "mb-4");
            cardProductoNuevaColeccion.id = `prod-${producto.id}`;

            const botonesTalle = producto.talle
                .map(t => `<button class="talle-btn btn btn-outline-dark">${t}</button>`)
                .join("");

            cardProductoNuevaColeccion.innerHTML = `
            <div class="imagen-rapper position-relative">
                <img src="${producto.imagen}" class="imagen-tarjeta card-img-top img-fluid" alt="${producto.nombre}">
                <div class="btn-group btn-group-sm position-absolute bottom-0 start-50 translate-middle p-2 botones-talle">
                    ${botonesTalle}
                </div>
            </div>

            <div class="card-body">
                <h6 class="card-title">${producto.nombre}</h6>
                <p class="card-text">${formatarPrecio(producto.precio)}</p>
            </div>

            <div class="d-flex justify-content-start p-2 pt-0 m-0">
                <button class="btn btn-dark btn-sm agregar-carrito" disabled>
                    Añadir al Carrito
                </button>
            </div>
        `;

            contenedorProductosNuevaColeccion.appendChild(cardProductoNuevaColeccion);
        });


    } catch (error) {
        console.error("Error", error);
    };
};

/* ----------------------------------------------------------
   4. EVENTOS SOBRE PRODUCTOS
-----------------------------------------------------------*/

contenedorProductosNuevaColeccion.addEventListener("click", (e) => {
    const btn = e.target;
    const card = btn.closest(".card");
    if (!card) return;

    const id = Number(card.id.replace("prod-", ""));
    const producto = productosNuevaColeccion.find(p => p.id === id);

    if (btn.classList.contains("talle-btn")) {
        card.querySelectorAll(".talle-btn")
            .forEach(b => b.classList.remove("active", "btn-dark"));

        btn.classList.add("active", "btn-dark");

        const btnAgregar = card.querySelector(".agregar-carrito");
        btnAgregar.disabled = false;
        btnAgregar._talleSeleccionado = btn.textContent;
    }

    if (btn.classList.contains("agregar-carrito") && !btn.disabled) {
        const talle = btn._talleSeleccionado;

        if (!producto || !talle) return;

        adicionarAlCarrito(producto, talle);

        btn.disabled = true;
        card.querySelectorAll(".talle-btn")
            .forEach(b => b.classList.remove("active", "btn-dark"));
    }
});



/* ----------------------------------------------------------
   5. LÓGICA DEL CARRITO
-----------------------------------------------------------*/

function actualizarContadorCarrito() {
    const total = carrito.reduce((s, i) => s + i.quantidade, 0);
    contadorCarritoElement.textContent = total;
}

function adicionarAlCarrito(producto, talle) {
    const idUnico = `${producto.id}-${talle}`;
    const existente = carrito.find(i => i.idUnico === idUnico);

    if (existente) {
        existente.quantidade++;
    } else {
        carrito.push({
            idUnico,
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            talle,
            quantidade: 1
        });
    }

    Toastify({
        text: `${producto.nombre} - Talle ${talle}`,
        duration: 1500,
        newWindow: true,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "oklch(78.517% 0.13477 307.239)",
        },
    }).showToast();
    salvarCarrito();
    actualizarContadorCarrito();
    renderizarCarrito();
}

function modificarCantidade(idUnico, accion) {
    const item = carrito.find(i => i.idUnico === idUnico);
    if (!item) return;

    if (accion === "aumentar") item.quantidade++;
    if (accion === "reducir") item.quantidade--;

    if (item.quantidade <= 0) {
        removerItem(idUnico);
    } else {
        salvarCarrito();
        actualizarContadorCarrito();
        renderizarCarrito();
    }
}

function removerItem(idUnico) {
    carrito = carrito.filter(i => i.idUnico !== idUnico);
    const item = carrito.find(i => i.idUnico === idUnico);

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: "btn btn-danger",
            cancelButton: "btn btn-success"
        },
        buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
        text: `Remover de tu compra?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Remover",
        cancelButtonText: "Cancelar",
        reverseButtons: false
    }).then((result) => {
        if (result.isConfirmed) {
            swalWithBootstrapButtons.fire({
                title: "Removido!",
                text: "Tu item fue removido",
                icon: "success"
            });
            salvarCarrito();
            actualizarContadorCarrito();
            renderizarCarrito();
        }
    });

}

function vaciarCarrito() {
    carrito = [];
    salvarCarrito();
    renderizarCarrito();
    actualizarContadorCarrito();
}


/* ----------------------------------------------------------
   6. EVENTO DEL CARRITO DE COMPRAS
-----------------------------------------------------------*/

listaCarrito.addEventListener("click", (e) => {
    const btn = e.target;

    if (btn.classList.contains("btn-aumentar")) {
        modificarCantidade(btn.dataset.idunico, "aumentar");
    }

    if (btn.classList.contains("btn-reducir")) {
        modificarCantidade(btn.dataset.idunico, "reducir");
    }

    if (btn.classList.contains("btn-remover")) {
        removerItem(btn.dataset.idunico);
    }
});

botonFinalizarCompra.addEventListener("click", () => {

    if (carrito.length === 0) {
        Swal.fire({
            title: "Carrito vacío",
            text: "Agrega productos antes de finalizar la compra",
            icon: "warning",
            confirmButtonText: "OK",
            confirmButtonColor: "oklch(78.517% 0.13477 307.239)"
        });
        return;
    }

    Swal.fire({
        title: "¿Deseas finalizar la compra?",
        icon: "question",
        confirmButtonText: "Finalizar compra",
        confirmButtonColor: "oklch(78.517% 0.13477 307.239)",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        showClass: {
            popup: `
                animate__animated
                animate__fadeInUp
                animate__faster
            `
        },
        hideClass: {
            popup: `
                animate__animated
                animate__fadeOutDown
                animate__faster
            `
        }
    }).then((result) => {
        if (result.isConfirmed) {
            vaciarCarrito();

            Swal.fire({
                title: "¡Compra realizada!",
                text: "Gracias por tu compra",
                icon: "success",
                confirmButtonText: "Choque los Cinco 🖐️",
                confirmButtonColor: "oklch(78.517% 0.13477 307.239)",
                showCancelButton: false
            });
        }
    });

});


/* ----------------------------------------------------------
   7. RENDERIZAR CARRITO
-----------------------------------------------------------*/

function renderizarCarrito() {
    listaCarrito.innerHTML = "";
    let subtotal = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = `<p class="text-center p-3 text-muted">Tu carrito está vacío.</p>`;
        totalCarritoElement.textContent = formatarPrecio(0);
        return;
    }

    carrito.forEach(item => {
        const totalItem = item.precio * item.quantidade;
        subtotal += totalItem;

        const div = document.createElement("div");
        div.classList.add("d-flex", "justify-content-between", "align-items-center", "py-2", "border-bottom");

        div.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${item.imagen}" class="img-thumbnail me-2" style="width:60px;height:60px;object-fit:cover;">
                <div>
                    <strong>${item.nombre} (${item.talle})</strong>
                    <div class="text-muted small">${formatarPrecio(item.precio)}</div>

                    <div class="btn-group btn-group-sm mt-1">
                        <button class="btn btn-outline-dark btn-reducir" data-idunico="${item.idUnico}">-</button>
                        <button class="btn btn-dark disabled">${item.quantidade}</button>
                        <button class="btn btn-outline-dark btn-aumentar" data-idunico="${item.idUnico}">+</button>
                    </div>
                </div>
            </div>

            <div class="text-end">
                <strong>${formatarPrecio(totalItem)}</strong><br>
                <button class="btn btn-sm btn-remover text-danger border-0 p-0" data-idunico="${item.idUnico}">
                    Remover
                </button>
            </div>
        `;

        listaCarrito.appendChild(div);
    });

    totalCarritoElement.textContent = formatarPrecio(subtotal);
}


/* ----------------------------------------------------------
   8. INICIALIZACIÓN
-----------------------------------------------------------*/

renderizarProductosNuevaColeccion();
renderizarCarrito();
actualizarContadorCarrito();