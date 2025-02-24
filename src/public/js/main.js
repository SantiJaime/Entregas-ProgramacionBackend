document.addEventListener("DOMContentLoaded", async () => {
  const navLinks = document.getElementById("navLinks");

  const response = await fetch("/api/sessions/current", {
    method: "GET",
    credentials: "include",
  });

  const isLogged = response.status === 200;
  
  if (!isLogged) {
    navLinks.innerHTML = `
        <a href="/api/products">Productos</a>
         <a href="/api/sessions/view-register">Registrarse</a>
         <a href="/api/sessions/view-login">Iniciar sesión</a>
      `;
      sessionStorage.removeItem("cartId");
    return;
  }
  const res = await response.json();

  if (res.user.role === "admin") {
    navLinks.innerHTML = `
        <a href="/api/products/realtimeproducts">Productos en tiempo real</a>
        <a href="/api/products/render-create-products">Crear producto</a>
        <a href="/api/sessions/logout">Cerrar sesión</a>
      `;
  } else if (res.user.role === "user") {
    const cartId = sessionStorage.getItem("cartId");

    const parsedCartId = cartId ? JSON.parse(cartId) : "";
    navLinks.innerHTML = `
        <a href="/api/products/realtimeproducts">Productos en tiempo real</a>
        <a href="/api/carts/${parsedCartId}">Ver carrito</a>
        <a href="/api/sessions/logout">Cerrar sesión</a>
      `;
  }
});
