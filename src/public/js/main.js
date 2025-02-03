document.addEventListener("DOMContentLoaded", async () => {
  const navLinks = document.getElementById("navLinks");

  const response = await fetch("/api/sessions/current", {
    method: "GET",
    credentials: "include",
  });

  const isUserLogged = response.status === 200;

  navLinks.innerHTML = isUserLogged
    ? `
        <a href="/api/products/realtimeproducts">Productos en tiempo real</a>
        <a href="/api/carts">Carritos</a>
        <a href="/api/sessions/logout">Cerrar sesión</a>
        `
    : `
        <a href="/api/products">Productos</a>
        <a href="/api/sessions/view-register">Registrarse</a>
        <a href="/api/sessions/view-login">Iniciar sesión</a>`;
});
