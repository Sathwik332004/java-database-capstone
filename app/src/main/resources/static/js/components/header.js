/*
  Step-by-Step Explanation of Header Section Rendering

  This code dynamically renders the header section of the page based on the user's role, session status, and available actions (such as login, logout, or role-switching).

  1. Define the `renderHeader` Function

     * The `renderHeader` function is responsible for rendering the entire header based on the user's session, role, and whether they are logged in.

  2. Select the Header Div

     * The `headerDiv` variable retrieves the HTML element with the ID `header`, where the header content will be inserted.
       ```javascript
       const headerDiv = document.getElementById("header");
       ```

  3. Check if the Current Page is the Root Page

     * The `window.location.pathname` is checked to see if the current page is the root (`/`). If true, the user's session data (role) is removed from `localStorage`, and the header is rendered without any user-specific elements (just the logo and site title).
       ```javascript
       if (window.location.pathname.endsWith("/")) {
         localStorage.removeItem("userRole");
         headerDiv.innerHTML = `
           <header class="header">
             <div class="logo-section">
               <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
               <span class="logo-title">Hospital CMS</span>
             </div>
           </header>`;
         return;
       }
       ```

  4. Retrieve the User's Role and Token from LocalStorage

     * The `role` (user role like admin, patient, doctor) and `token` (authentication token) are retrieved from `localStorage` to determine the user's current session.
       ```javascript
       const role = localStorage.getItem("userRole");
       const token = localStorage.getItem("token");
       ```

  5. Initialize Header Content

     * The `headerContent` variable is initialized with basic header HTML (logo section), to which additional elements will be added based on the user's role.
       ```javascript
       let headerContent = `<header class="header">
         <div class="logo-section">
           <img src="../assets/images/logo/logo.png" alt="Hospital CRM Logo" class="logo-img">
           <span class="logo-title">Hospital CMS</span>
         </div>
         <nav>`;
       ```

  6. Handle Session Expiry or Invalid Login

     * If a user with a role like `loggedPatient`, `admin`, or `doctor` does not have a valid `token`, the session is considered expired or invalid. The user is logged out, and a message is shown.
       ```javascript
       if ((role === "loggedPatient" || role === "admin" || role === "doctor") && !token) {
         localStorage.removeItem("userRole");
         alert("Session expired or invalid login. Please log in again.");
         window.location.href = "/";   or a specific login page
         return;
       }
       ```

  7. Add Role-Specific Header Content

     * Depending on the user's role, different actions or buttons are rendered in the header:
       - **Admin**: Can add a doctor and log out.
       - **Doctor**: Has a home button and log out.
       - **Patient**: Shows login and signup buttons.
       - **LoggedPatient**: Has home, appointments, and logout options.
       ```javascript
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
           <button id="patientSignup" class="adminBtn">Sign Up</button>`;
       } else if (role === "loggedPatient") {
         headerContent += `
           <button id="home" class="adminBtn" onclick="window.location.href='/pages/loggedPatientDashboard.html'">Home</button>
           <button id="patientAppointments" class="adminBtn" onclick="window.location.href='/pages/patientAppointments.html'">Appointments</button>
           <a href="#" onclick="logoutPatient()">Logout</a>`;
       }
       ```



  9. Close the Header Section



  10. Render the Header Content

     * Insert the dynamically generated `headerContent` into the `headerDiv` element.
       ```javascript
       headerDiv.innerHTML = headerContent;
       ```

  11. Attach Event Listeners to Header Buttons

     * Call `attachHeaderButtonListeners` to add event listeners to any dynamically created buttons in the header (e.g., login, logout, home).
       ```javascript
       attachHeaderButtonListeners();
       ```


  ### Helper Functions

  13. **attachHeaderButtonListeners**: Adds event listeners to login buttons for "Doctor" and "Admin" roles. If clicked, it opens the respective login modal.

  14. **logout**: Removes user session data and redirects the user to the root page.

  15. **logoutPatient**: Removes the patient's session token and redirects to the patient dashboard.

  16. **Render the Header**: Finally, the `renderHeader()` function is called to initialize the header rendering process when the page loads.
*/


// header.js
// Renders a role-aware header for admin / doctor / patient / loggedPatient.
// - Clears session on homepage
// - Validates token for logged roles
// - Injects role-specific controls and attaches listeners
// - Exposes renderHeader, logout, logoutPatient globally

(function () {
  'use strict';

  // Safe localStorage access helpers
  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, val); return true; } catch (e) { return false; }
  }
  function lsRemove(key) {
    try { localStorage.removeItem(key); return true; } catch (e) { return false; }
  }

  // Try to call openModal if available, fallback to window.openModal or simple navigation
  function openModalSafe(name) {
    try {
      if (typeof window.openModal === 'function') return window.openModal(name);
      // If a module exported openModal on window earlier, it will be used above
      // fallback: attempt to show #modal region (basic fallback)
      const modal = document.getElementById('modal');
      if (modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'block';
      } else {
        // fallback navigation to dedicated pages
        if (name === 'adminLogin' || name === 'doctorLogin') window.location.href = `/auth/${name.replace('Login','').toLowerCase()}/login`;
        if (name === 'patientLogin' || name === 'patientSignup') window.location.href = `/auth/patient/${name === 'patientLogin' ? 'login' : 'register'}`;
        if (name === 'addDoctor') window.location.href = '/admin/doctors/new';
      }
    } catch (e) {
      console.warn('openModalSafe failed', e);
    }
  }

  // Render header according to role and token
  function renderHeader() {
    const headerDiv = document.getElementById('header');
    if (!headerDiv) return;

    // If on root page => clear userRole & token (do not show role-based header)
    const pathname = window.location.pathname || '/';
    if (pathname === '/' || pathname === '/index.html' || pathname.endsWith('/')) {
      lsRemove('userRole');
      lsRemove('token');
      headerDiv.innerHTML = `
        <header class="header site-header">
          <div class="logo-section" id="logoSection">
            <img src="../assets/images/logo/logo.png" alt="Hospital CMS Logo" class="logo-img" />
            <span class="logo-title">Hospital CMS</span>
          </div>
        </header>
      `;
      return;
    }

    const role = (lsGet('userRole') || '').toString();
    const token = lsGet('token');

    // If role indicates a logged in user but token missing => expire session & redirect to root
    if ((role === 'loggedPatient' || role === 'admin' || role === 'doctor') && !token) {
      lsRemove('userRole');
      alert('Session expired or invalid login. Please log in again.');
      window.location.href = '/';
      return;
    }

    // Build header content
    let headerContent = `
      <header class="header site-header">
        <div class="logo-section" id="logoSection">
          <img src="../assets/images/logo/logo.png" alt="Hospital CMS Logo" class="logo-img" />
          <span class="logo-title">Hospital CMS</span>
        </div>
        <nav class="header-nav">
    `;

    // Role-specific controls
    if (role === 'admin') {
      headerContent += `
        <button id="addDocBtn" class="adminBtn header-btn" type="button">Add Doctor</button>
        <a href="#" id="adminLogout" class="header-link">Logout</a>
      `;
    } else if (role === 'doctor') {
      headerContent += `
        <button id="doctorHomeBtn" class="adminBtn header-btn" type="button">Home</button>
        <a href="#" id="doctorLogout" class="header-link">Logout</a>
      `;
    } else if (role === 'patient') {
      headerContent += `
        <button id="patientLogin" class="adminBtn header-btn" type="button">Login</button>
        <button id="patientSignup" class="adminBtn header-btn" type="button">Sign Up</button>
      `;
    } else if (role === 'loggedPatient') {
      headerContent += `
        <button id="patientHome" class="adminBtn header-btn" type="button">Home</button>
        <button id="patientAppointments" class="adminBtn header-btn" type="button">Appointments</button>
        <a href="#" id="patientLogout" class="header-link">Logout</a>
      `;
    } else {
      // fallback for unknown / no role
      headerContent += `
        <a href="/auth/login" class="header-link">Login</a>
        <a href="/auth/register" class="header-link">Register</a>
      `;
    }

    headerContent += `
        </nav>
      </header>
    `;

    headerDiv.innerHTML = headerContent;

    // attach listeners for dynamically created elements
    attachHeaderButtonListeners();
  }

  function attachHeaderButtonListeners() {
    const $ = id => document.getElementById(id);

    // Add Doctor (admin)
    const addDocBtn = $('addDocBtn');
    if (addDocBtn) {
      addDocBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModalSafe('addDoctor');
      });
    }

    // Admin logout
    const adminLogout = $('adminLogout');
    if (adminLogout) adminLogout.addEventListener('click', (e) => { e.preventDefault(); logout(); });

    // Doctor home & logout
    const doctorHomeBtn = $('doctorHomeBtn');
    if (doctorHomeBtn) doctorHomeBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.href = '/doctor/dashboard'; });
    const doctorLogout = $('doctorLogout');
    if (doctorLogout) doctorLogout.addEventListener('click', (e) => { e.preventDefault(); logout(); });

    // Patient (not logged) login/signup
    const patientLogin = $('patientLogin');
    if (patientLogin) patientLogin.addEventListener('click', (e) => {
      e.preventDefault();
      openModalSafe('patientLogin');
    });
    const patientSignup = $('patientSignup');
    if (patientSignup) patientSignup.addEventListener('click', (e) => {
      e.preventDefault();
      openModalSafe('patientSignup');
    });

    // Logged patient: home, appointments, logoutPatient
    const patientHome = $('patientHome');
    if (patientHome) patientHome.addEventListener('click', (e) => { e.preventDefault(); window.location.href = '/pages/loggedPatientDashboard.html'; });
    const patientAppointments = $('patientAppointments');
    if (patientAppointments) patientAppointments.addEventListener('click', (e) => { e.preventDefault(); window.location.href = '/pages/patientAppointments.html'; });
    const patientLogout = $('patientLogout');
    if (patientLogout) patientLogout.addEventListener('click', (e) => { e.preventDefault(); logoutPatient(); });

    // Logo click alt-key helper to clear role (developer utility)
    const logoSection = document.getElementById('logoSection');
    if (logoSection) {
      logoSection.addEventListener('click', (e) => {
        if (e.altKey) {
          lsRemove('userRole');
          lsRemove('token');
          alert('Cleared userRole and token from localStorage (dev shortcut).');
        } else {
          // normal click navigates to home
          window.location.href = '/';
        }
      });
    }
  }

  // Logout for admin/doctor/general
  function logout() {
    lsRemove('token');
    lsRemove('userRole');
    // remove other possible session keys
    lsRemove('userData');
    lsRemove('refreshToken');
    window.location.href = '/';
  }

  // Patient-specific logout: set role back to 'patient' so header shows login/signup
  function logoutPatient() {
    lsRemove('token');
    try {
      lsSet('userRole', 'patient');
    } catch (e) { lsRemove('userRole'); }
    // redirect to patient landing or root
    window.location.href = '/';
  }

  // expose globally
  window.renderHeader = renderHeader;
  window.logout = logout;
  window.logoutPatient = logoutPatient;
  window.attachHeaderButtonListeners = attachHeaderButtonListeners;

  // Auto-render on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHeader);
  } else {
    renderHeader();
  }
})();




   
