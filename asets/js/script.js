/* ----------------------------------------------------------
   1. DATOS Y VARIABLES GLOBALES
-----------------------------------------------------------*/

let carrito = JSON.parse(localStorage.getItem("carritoEcommerce")) || [];

const contenedorProductosNuevaColeccion = document.querySelector("#contenedor-productos-nueva-coleccion");
const contenedorProductosKids = document.querySelector("#contenedor-productos-kids")
const listaCarrito = document.querySelector("#lista-carrito");
const totalCarritoElement = document.querySelector("#total-carrito");
const contadorCarritoElement = document.querySelector("#contador-carrito");


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
        const response = await fetch("../asets/productos/nueva_coleccion.json");
        const productosNuevaColeccion = await response.json();

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


    } catch(error){

    };
};

async function renderizarProductosKids() {
    contenedorProductosKids.innerHTML = "";

    try {
        const response = await fetch("../asets/productos/kids.json");
        const productosKids = await response.json();

        productosKids.forEach(producto => {
            const cardProductoKids = document.createElement("div");
            cardProductoKids.classList.add("col-3", "card", "border", "border-0", "mb-4");
            cardProductoKids.id = `prod-${producto.id}`;

            const botonesTalle = producto.talle
            .map(t => `<button class="talle-btn btn btn-outline-dark">${t}</button>`)
            .join("");

            cardProductoKids.innerHTML = `
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

        contenedorProductosKids.appendChild(cardProductoKids);
        });


    } catch(error){

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
    const producto = productosNuevos.find(p => p.id === id);

    /* --- Selección de talle --- */
    if (btn.classList.contains("talle-btn")) {
        const allButtons = card.querySelectorAll(".talle-btn");
        allButtons.forEach(b => b.classList.remove("active", "btn-dark"));

        btn.classList.add("active", "btn-dark");

        const btnAgregar = card.querySelector(".agregar-carrito");
        btnAgregar.disabled = false;
        btnAgregar._talleSeleccionado = btn.textContent;   //
    }

    /* --- Añadir al carrito --- */
    if (btn.classList.contains("agregar-carrito") && !btn.disabled) {
        const talle = btn._talleSeleccionado;

        adicionarAoCarrinho(producto, talle);

        btn.disabled = true;
        card.querySelectorAll(".talle-btn").forEach(b => b.classList.remove("active", "btn-dark"));
    }
});


/* ----------------------------------------------------------
   5. LÓGICA DEL CARRITO
-----------------------------------------------------------*/

function actualizarContadorCarrinho() {
    const total = carrito.reduce((s, i) => s + i.quantidade, 0);
    contadorCarrinhoElement.textContent = total;
}

function adicionarAoCarrinho(producto, talle) {
    const idUnico = `${producto.id}-${talle}`;
    const existente = carrito.find(i => i.idUnico === idUnico);

    if (existente) {
        existente.quantidade++;
    } else {
        carrito.push({
            idUnico,
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.preco,
            imagen: producto.imagen,
            talle,
            quantidade: 1
        });
    }

    salvarCarrinho();
    actualizarContadorCarrinho();
    renderizarCarrinho();
}

function modificarQuantidade(idUnico, acao) {
    const item = carrito.find(i => i.idUnico === idUnico);
    if (!item) return;

    if (acao === "aumentar") item.quantidade++;
    if (acao === "diminuir") item.quantidade--;

    if (item.quantidade <= 0) {
        removerItem(idUnico);
    } else {
        salvarCarrinho();
        actualizarContadorCarrinho();
        renderizarCarrinho();
    }
}

function removerItem(idUnico) {
    carrito = carrito.filter(i => i.idUnico !== idUnico);
    salvarCarrinho();
    actualizarContadorCarrinho();
    renderizarCarrinho();
}


/* ----------------------------------------------------------
   6. EVENTO DEL OFFCANVAS
-----------------------------------------------------------*/

listaCarrito.addEventListener("click", (e) => {
    const btn = e.target;

    if (btn.classList.contains("btn-aumentar")) {
        modificarQuantidade(btn.dataset.idunico, "aumentar");
    }

    if (btn.classList.contains("btn-diminuir")) {
        modificarQuantidade(btn.dataset.idunico, "diminuir");
    }

    if (btn.classList.contains("btn-remover")) {
        removerItem(btn.dataset.idunico);
    }
});


/* ----------------------------------------------------------
   7. RENDERIZAR CARRITO
-----------------------------------------------------------*/

function renderizarCarrito() {
    listaCarrito.innerHTML = "";
    let subtotal = 0;

    if (carrito.length === 0) {
        listaCarrinho.innerHTML = `<p class="text-center p-3 text-muted">Tu carrito está vacío.</p>`;
        totalCarrinhoElement.textContent = formatarPreco(0);
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
                    <div class="text-muted small">${formatarPreco(item.precio)}</div>

                    <div class="btn-group btn-group-sm mt-1">
                        <button class="btn btn-outline-dark btn-diminuir" data-idunico="${item.idUnico}">-</button>
                        <button class="btn btn-dark disabled">${item.quantidade}</button>
                        <button class="btn btn-outline-dark btn-aumentar" data-idunico="${item.idUnico}">+</button>
                    </div>
                </div>
            </div>

            <div class="text-end">
                <strong>${formatarPreco(totalItem)}</strong><br>
                <button class="btn btn-sm btn-remover text-danger border-0 p-0" data-idunico="${item.idUnico}">
                    Remover
                </button>
            </div>
        `;

        listaCarrinho.appendChild(div);
    });

    totalCarrinhoElement.textContent = formatarPreco(subtotal);
}


/* ----------------------------------------------------------
   8. INICIALIZACIÓN
-----------------------------------------------------------*/

renderizarProductosNuevaColeccion();
renderizarProductosKids()
renderizarCarrito();
actualizarContadorCarrito();