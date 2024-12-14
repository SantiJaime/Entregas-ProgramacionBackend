const socket = io();

let carts = [];
const getCarts = async () => {
  try {
    const response = await fetch("/api/carts/no-render");

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    const data = await response.json();
    carts = [...data.allCarts];
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Hubo un problema al obtener los carritos",
      text: error.message,
    });
  }
};

getCarts();
const createNewCart = async () => {
  try {
    const response = await fetch("/api/carts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    const data = await response.json();

    Swal.fire({
      icon: "success",
      title: "Carrito creado correctamente",
      text: `El carrito "${data.newCart._id}" ha sido creado.`,
      position: "top-start",
      toast: true,
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Hubo un problema al crear el carrito",
      text: error.message,
    });
  }
};

const emptyCart = async (id) => {
  Swal.fire({
    title: "¿Estás seguro de vaciar este carrito?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#39b500",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, vaciar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/carts/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }
        const data = await response.json();

        Swal.fire({
          icon: "success",
          title: data.msg,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        })
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hubo un problema al vaciar el carrito",
          text: error.message,
        });
      }
    }
  });
};

socket.on("createCart", (newCart) => {
  carts.push(newCart);

  const cartsGrid = document.getElementById("carts-grid");
  cartsGrid.innerHTML = "";
  carts.forEach((cart) => {
    const newCartCard = document.createElement("div");
    newCartCard.classList.add("card");
    newCartCard.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">Carrito ${cart._id}</h5>
          <hr />
          <div class="divButtons">
            <a href="/api/carts/${cart._id}" class="btn">Ver productos de este carrito</a>
            <button class="btn-red" onclick="emptyCart('${cart._id}')">Vaciar carrito</button>
          </div>
        </div>
      `;
    cartsGrid.appendChild(newCartCard);
  });
});

