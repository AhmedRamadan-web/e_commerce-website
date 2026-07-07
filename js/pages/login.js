const loginForm = document.querySelector(".login-form");
const registerForm = document.querySelector(".register-form");
const forgotForm = document.querySelector(".forgot-form");
const resetForm = document.querySelector(".reset-form");

const switchToRegister = document.querySelector(".switch-to-register");
const switchToLogin = document.querySelector(".switch-to-login");

const forgotPasswordLink = document.querySelector(".forgot-password");
const backToLoginLink = document.querySelector(".back-to-login");
const backToLoginLink2 = document.querySelector(".back-to-login-2");

function hideAll() {
  [loginForm, registerForm, forgotForm, resetForm].forEach(f => {
    f.classList.add("hidden");
    f.classList.remove("flex");
    f.style.display = "";
  });
}

function showForm(form) {
  hideAll();
  form.classList.remove("hidden");
}

function showRegister() {
  showForm(registerForm);
}

function showLogin() {
  showForm(loginForm);
}

function showForgot() {
  showForm(forgotForm);
}

function showReset() {
  showForm(resetForm);
}

//====== switch ========
switchToRegister.addEventListener("click", function (e) {
  e.preventDefault();
  showRegister();
});

switchToLogin.addEventListener("click", function (e) {
  e.preventDefault();
  showLogin();
});

forgotPasswordLink.addEventListener("click", function (e) {
  e.preventDefault();
  showForgot();
});

backToLoginLink.addEventListener("click", function (e) {
  e.preventDefault();
  showLogin();
});

backToLoginLink2.addEventListener("click", function (e) {
  e.preventDefault();
  showLogin();
});

//validate password
function isValidPassword(password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

//====== register ========
registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (!username || !email || !password) {
    alert("Please fill in all fields");
    return;
  }

  if (!isValidPassword(password)) {
    alert(
      "Password must be at least 8 characters and contain letters and numbers",
    );
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "[]");

  if (users.some((user) => user.email === email)) {
    alert("Email already exists");
    return;
  }

  const newId = crypto.randomUUID();

  const newUser = {
    id: newId,
    username,
    email,
    password,
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registration successful");
  showLogin();
  registerForm.reset();
});

//====== login ==========
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    alert(`Welcome ${user.username}`);
    localStorage.setItem("userId", user.id);
    localStorage.setItem("userEmail", user.email);
    window.location.href = "/index.html";
  } else {
    alert("Invalid email or password");
  }
});

//====== forgot submit ==========
forgotForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("forgotEmail").value.trim();

  if (!email) {
    alert("Please enter your email");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email);

  if (!user) {
    alert("This email is not registered");
    return;
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000);

  localStorage.setItem("resetCode", resetCode);
  localStorage.setItem("resetEmail", email);

  alert(`Reset code sent successfully. (Demo Code: ${resetCode})`);

  forgotForm.reset();
  showReset();
});

//====== reset password submit ==========
resetForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const code = document.getElementById("resetCode").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document
    .getElementById("confirmPassword")
    .value.trim();

  const savedCode = localStorage.getItem("resetCode");
  const savedEmail = localStorage.getItem("resetEmail");

  if (!code || !newPassword || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (code !== savedCode) {
    alert("Invalid reset code");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  if (!isValidPassword(newPassword)) {
    alert(
      "Password must be at least 8 characters and contain letters and numbers",
    );
    return;
  }

  let users = JSON.parse(localStorage.getItem("users") || "[]");

  const userIndex = users.findIndex((u) => u.email === savedEmail);

  if (userIndex === -1) {
    alert("User not found");
    return;
  }

  users[userIndex].password = newPassword;

  localStorage.setItem("users", JSON.stringify(users));

  localStorage.removeItem("resetCode");
  localStorage.removeItem("resetEmail");

  alert("Password updated successfully!");
  resetForm.reset();
  showLogin();
});
