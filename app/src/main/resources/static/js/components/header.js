
// header.js
function renderHeader() {
  const headerDiv = document.getElementById("header");

  if (window.location.pathname.endsWith("/")) {
    localStorage.removeItem("userRole");
    localStorage.removeItem("token")
    headerDiv.innerHTML = `
      <header class="header">
        <a href="/" class="logo-link" style="text-decoration: none;>
          <div class="logo-section">
            <img src="../assets/images/logo/logo.png" alt="HealTrack Logo" class="logo-img">
            <span class="logo-title">HealTrack</span>
          </div>
        </a>
      </header>`;
    return;
  }

  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("token")
  let headerContent = `<header class="header">
      <a href="/" class="logo-link" style="text-decoration: none;>
          <div class="logo-section">
            <img src="../assets/images/logo/logo.png" alt="HealTrack Logo" class="logo-img">
            <span class="logo-title">HealTrack</span>
          </div>
        </a>
      <nav>`;


  if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
    localStorage.removeItem("userRole");
    alert("Session expired or invalid login. Please log in again.");
    window.location.href = "/"; // or a specific login page
    return;
  }
  else if (role === "admin") {
    headerContent += `
      <button id="addDocBtn" class="adminBtn" onclick="openModal('addDoctor')">Add Doctor</button>
      <a href="#" onclick="logout()">Logout</a>`;
  } else if (role === "doctor") {
    headerContent += `
      <button class="adminBtn"  onclick="selectRole('doctor')">Home</button>
      <a href="#" onclick="logout()">Logout</a>`;
  } else if (role === "patient") {
    headerContent += `
      <button id="patientLogin" class="adminBtn">Login</button>
      <button id="patientSignup" class="adminBtn">Sign Up</button>
      `
  } else if (role === "loggedPatient") {
    headerContent += `
      <button id="home" class="adminBtn" onclick="window.location.href='/pages/loggedPatientDashboard.html'">Home</button>
      <button id="patientAppointments" class="adminBtn" onclick="window.location.href='/pages/patientAppointments.html'">Appointments</button>
      <a href="#" onclick="logoutPatient()">Logout</a>`;
  }

  headerContent += `</nav></header>`;

  headerDiv.innerHTML = headerContent;

  attachHeaderButtonListeners()

}

// This function attaches listeners to the dynamically created buttons
function attachHeaderButtonListeners() {
  const doctorBtn = document.getElementById("doctorBtn");
  if (doctorBtn) {
    doctorBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      openModal("doctorLogin");
    });
  }

  const adminBtn = document.getElementById("adminBtn");
  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      openModal("adminLogin");
    });
  }
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  window.location.href = "/";
}

function logoutPatient() {
  localStorage.removeItem("token");
  localStorage.setItem("userRole", "patient");
  window.location.href = "/pages/patientDashboard.html";
}

renderHeader();
