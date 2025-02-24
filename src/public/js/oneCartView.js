const socket = io();
const cartContainer = document.getElementById("cart-container");

const checkout = async (idCart) => {
  try {
    const response = await fetch(`/api/carts/${idCart}/purchase`, {
      method: "POST",
      credentials: "include",
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
      timer: 4000,
    });

    cartContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h1>Carrito ${data.cart._id}</h1>
        <div>
          <button class="btn" onclick="checkout('${data.cart._id}')">Finalizar compra</button>
          <button class="btn-red" onclick="emptyCart('${data.cart._id}')">Vaciar carrito</button>
        </div>
    </div>
    <hr />
    <h2>Productos del carrito</h2>
    <h3>No hay productos en el carrito</h3>
    `;
  } catch (error) {
    if (
      error.errors &&
      Array.isArray(error.errors) &&
      error.errors.length > 0
    ) {
      Swal.fire({
        icon: "warning",
        title:
          "No se pudo finalizar la compra, se han borrado de tu carrito los siguientes productos por falta de stock:",
        html: `<ul>
              ${error.errors.map((err) => `<li>${err}</li>`).join("")}
          </ul>`,
      }).then(() => location.reload());
    } else {
      Swal.fire({
        icon: "error",
        title: "Hubo un problema al finalizar la compra",
        text: error.msg || "Error desconocido",
      });
    }
  }
};

const emptyCart = (idCart) => {
  Swal.fire({
    title: "¿Estás seguro de vaciar tu carrito?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, vaciar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/carts/${idCart}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }
        await response.json();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Hubo un problema al vaciar el carrito",
          text: error.msg,
        });
      }
    }
  });
};

socket.on("deleteCart", async (cart) => {
  Swal.fire({
    icon: "success",
    title: `Carrito con ID ${cart._id} vaciado correctamente`,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
  });

  cartContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center">
      <h1>Carrito ${cart._id}</h1>
        <div>
          <button class="btn" onclick="checkout(${cart._id})">Finalizar compra</button>
          <button class="btn-red" onclick="emptyCart(${cart._id})">Vaciar carrito</button>
        </div>
    </div>
    <hr />
    <h2>Productos del carrito</h2>
    <h3>No hay productos en el carrito</h3>
    `;
});
