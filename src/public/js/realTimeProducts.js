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

const fetchProducts = async () => {
  try {
    const responseProducts = await fetch("/api/products/no-render");
    if (!responseProducts.ok) {
      const errorData = await responseProducts.json();
      throw errorData;
    }
    const dataProducts = await responseProducts.json();
    products = [...dataProducts.docs];
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Hubo un problema al obtener los productos",
      text: error.message,
    });
  }
};
const fetchCarts = async () => {
  try {
    const responseCarts = await fetch("/api/carts/no-render");
    if (!responseCarts.ok) {
      const errorData = await responseCarts.json();
      throw errorData;
    }
    const dataCarts = await responseCarts.json();
    carts = [...dataCarts.allCarts];
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Hubo un problema al obtener los carritos.",
      text: error.message,
    });
  }
};
fetchProducts();
fetchCarts();
const deleteProduct = (id) => {
  fetch(`/api/products/${id}`, {
    method: "DELETE",
  })
    .then(async (response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw errorData;
        });
      }
      return response.json();
    })
    .then((data) => {
      Swal.fire({
        icon: "success",
        title: data.msg,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Hubo un problema al eliminar el producto.",
        text: error.message,
      });
    });
};

const addProductToCart = (idProd) => {
  Swal.fire({
    title: "Seleccione en qué carrito agregará el producto",
    html: `
      <select id="cartSelect">
        ${carts
          .map(
            (cart) => `<option value="${cart._id}">Carrito ${cart._id}</option>`
          )
          .join("")}
      </select>
    `,
    showCancelButton: true,
    confirmButtonText: "Agregar al carrito",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      const idCart = document.getElementById("cartSelect").value;
      try {
        const response = await fetch(
          `/api/carts/${idCart}/products/${idProd}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId: idProd, quantity: 1 }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al agregar al carrito");
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
        Swal.showValidationMessage(`Error: ${error.message}`);
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  });
};

const form = document.getElementById("createProductForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let newProduct = {
    title: document.getElementById("product-title").value.trim(),
    description: document.getElementById("product-description").value.trim(),
    price: Number(document.getElementById("product-price").value),
    thumbnail: document.getElementById("product-thumbnail").value.trim(),
    code: document.getElementById("product-code").value.trim(),
    stock: Number(document.getElementById("product-stock").value),
    category: document.getElementById("product-category").value,
    status: Boolean(document.getElementById("product-status").value),
  };

  fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newProduct),
  })
    .then(async (response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw errorData;
        });
      }
      return response.json();
    })
    .then((data) => {
      Swal.fire({
        icon: "success",
        title: "Producto creado correctamente",
        text: `El producto "${data.newProduct.title}" ha sido creado.`,
        position: "top-end",
        toast: true,
        timer: 3000,
        showConfirmButton: false,
      });

      form.reset();
    })
    .catch((error) => {
      if (Array.isArray(error)) {
        const errorList = error.map((err) => `<li>${err}</li>`).join("");

        Swal.fire({
          icon: "error",
          title: "Errores al crear el producto",
          html: `<ul>${errorList}</ul>`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Hubo un problema al crear el producto.",
          text: error.message,
        });
      }
    });
});

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

socket.on("productCreated", async (product) => {
  Swal.fire({
    icon: "success",
    title: "Nuevo producto",
    text: `Se ha creado el producto ${product.title} exitosamente.`,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
  });
  products = await updateFetchProducts();

  const productsGrid = document.getElementById("productsGrid");

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
});
