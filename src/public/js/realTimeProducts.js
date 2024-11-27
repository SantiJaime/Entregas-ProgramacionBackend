const socket = io();
let products = [];

fetch("/api/products/no-render")
  .then((response) => response.json())
  .then((data) => {
    products = [...data.products];
  })
  .catch((error) => {
    console.error("Error al obtener los productos:", error);
  });

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
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Hubo un problema al eliminar el producto.",
        text: error,
      });
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
          title: "Error",
          text: "Hubo un problema al crear el producto.",
        });
      }
    });
});

socket.on("deleteProduct", (filteredProducts) => {
  const productsGrid = document.getElementById("productsGrid");

  products = [...filteredProducts]

  productsGrid.innerHTML = "";
  products.forEach((product) => {
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
        <button class="btn" type="button">Agregar al
          carrito</button>
        <button class="btn-red" type="button" onclick="deleteProduct(${product.id})">Eliminar producto</button>
      </div>
    </div>
  `;
    productsGrid.appendChild(productCard);
  });
  Swal.fire({
    icon: "success",
    title: "Producto eliminado correctamente",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
  });
});

socket.on("productCreated", (product) => {
  Swal.fire({
    icon: "success",
    title: "Nuevo producto",
    text: `Se ha creado el producto ${product.title} exitosamente.`,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
  });
  products.push(product);
  const productsGrid = document.getElementById("productsGrid");

  productsGrid.innerHTML = "";
  products.forEach((product) => {
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
        <button class="btn" type="button">Agregar al
          carrito</button>
        <button class="btn-red" type="button" onclick="deleteProduct(${product.id})">Eliminar producto</button>
      </div>
    </div>
  `;
    productsGrid.appendChild(productCard);
  });
});
