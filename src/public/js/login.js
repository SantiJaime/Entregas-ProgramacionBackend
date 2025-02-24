const form = document.getElementById("loginForm");

const login = async () => {
  try {
    const user = {
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value.trim(),
    };

    const response = await fetch("/api/sessions/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(user),
    });

    const data = await response.json();

    if (data.redirect) {
      Swal.fire({
        icon: "success",
        title: "Sesión iniciada correctamente",
        text: "Redirigiendo...",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
      sessionStorage.setItem("cartId", JSON.stringify(data.cartId));
      setTimeout(() => {
        location.href = data.redirect;
      }, 2000);
    }
  } catch (error) {
    console.log(error)
    Swal.fire({
      icon: "error",
      title: "Error al iniciar sesión",
      text: error.message,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
    });
  }
};

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  login();
});
