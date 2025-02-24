const socket = io();
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
});