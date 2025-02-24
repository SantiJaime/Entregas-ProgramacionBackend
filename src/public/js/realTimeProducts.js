const socket = io();
let products = [];
let carts = [];

const updateFetchProducts = async () => {
  const url = new URL(location.href);

  const limit = url.searchParams.get("limit");
  const page = url.searchParams.get("page");

  try {
    const responseProducts = await fetch(
      `/api/products/no-render?limit=${limit ? limit : 10}&page=${
        page ? page : 1
      }`
    );
    if (!responseProducts.ok) {
      const errorData = await responseProducts.json();
      throw errorData;
    }
    const dataProducts = await responseProducts.json();
    return dataProducts.docs;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Hubo un problema al obtener los productos",
      text: error.message,
    });
  }
};

const deleteProduct = async (id) => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
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
      timer: 2000,
    });
  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: "error",
      title: "Hubo un problema al eliminar el producto",
      text: error.msg,
    });
  }
};

const addProductToCart = async (idProd) => {
  try {
    const idCart = JSON.parse(sessionStorage.getItem("cartId"));
    const response = await fetch(`/api/carts/${idCart}/products/${idProd}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: idProd, quantity: 1 }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || "Error al agregar al carrito");
    }

    const data = await response.json();

    Swal.fire({
      title: "Producto agregado correctamente",
      text: data.msg,
      icon: "success",
      showConfirmButton: false,
      timer: 3000,
      toast: true,
      position: "top-end",
    });

    return data;
  } catch (error) {
    console.log(error);
  }
};

socket.on("deleteProduct", async () => {
  const productsGrid = document.getElementById("productsGrid");

  products = await updateFetchProducts();

  productsGrid.innerHTML = "";
  for (const product of products) {
    const productCard = document.createElement("div");

    productCard.classList.add("card");
    productCard.innerHTML = `
      <img src="${product.thumbnail}" class="card-img" />
      <div class="card-body">
        <h5 class="card-title">${product.title}</h5>
        <h6 class="card-title">$${product.price}</h6>
        <hr />
        <p class="card-text">${product.description}</p>
        <div class="divButtons">
          <button class="btn" type="button" onclick="addProductToCart('${product._id}')">Agregar al carrito</button>
          <button class="btn-red" type="button" onclick="deleteProduct('${product._id}')">Eliminar producto</button>
        </div>
      </div>
    `;
    productsGrid.appendChild(productCard);
  }

  Swal.fire({
    icon: "success",
    title: "Producto eliminado correctamente",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
  });
});
