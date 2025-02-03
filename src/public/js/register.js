const form = document.getElementById("registerForm");

const register = async () => {
  try {
    const newUser = {
      first_name: document.getElementById("first_name").value.trim(),
      last_name: document.getElementById("last_name").value.trim(),
      email: document.getElementById("email").value.trim(),
      age: Number(document.getElementById("age").value),
      password: document.getElementById("password").value.trim(),
    };

    const response = await fetch("/api/sessions/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newUser),
    });
    if (response.status === 400) {
      throw new Error("El correo ya se encuentra registrado");
    }

    const data = await response.json();

    if (data.redirect) {
      Swal.fire({
        icon: "success",
        title: data.msg,
        text: "Redirigiendo...",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
      setTimeout(() => {
        location.href = data.redirect;
      }, 2000);
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al registrar usuario",
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
  register();
});
