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
    if (!response.ok) {
      console.log(response.status, response.statusText);
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
      sessionStorage.setItem("logged", JSON.stringify(true));
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
  login();
});
