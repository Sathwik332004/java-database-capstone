/*
  Import the openModal function to handle showing login popups/modals
  Import the base API URL from the config file
  Define constants for the admin and doctor login API endpoints using the base URL

  Use the window.onload event to ensure DOM elements are available after page load
  Inside this function:
    - Select the "adminLogin" and "doctorLogin" buttons using getElementById
    - If the admin login button exists:
        - Add a click event listener that calls openModal('adminLogin') to show the admin login modal
    - If the doctor login button exists:
        - Add a click event listener that calls openModal('doctorLogin') to show the doctor login modal


  Define a function named adminLoginHandler on the global window object
  This function will be triggered when the admin submits their login credentials

  Step 1: Get the entered username and password from the input fields
  Step 2: Create an admin object with these credentials

  Step 3: Use fetch() to send a POST request to the ADMIN_API endpoint
    - Set method to POST
    - Add headers with 'Content-Type: application/json'
    - Convert the admin object to JSON and send in the body

  Step 4: If the response is successful:
    - Parse the JSON response to get the token
    - Store the token in localStorage
    - Call selectRole('admin') to proceed with admin-specific behavior

  Step 5: If login fails or credentials are invalid:
    - Show an alert with an error message

  Step 6: Wrap everything in a try-catch to handle network or server errors
    - Show a generic error message if something goes wrong


  Define a function named doctorLoginHandler on the global window object
  This function will be triggered when a doctor submits their login credentials

  Step 1: Get the entered email and password from the input fields
  Step 2: Create a doctor object with these credentials

  Step 3: Use fetch() to send a POST request to the DOCTOR_API endpoint
    - Include headers and request body similar to admin login

  Step 4: If login is successful:
    - Parse the JSON response to get the token
    - Store the token in localStorage
    - Call selectRole('doctor') to proceed with doctor-specific behavior

  Step 5: If login fails:
    - Show an alert for invalid credentials

  Step 6: Wrap in a try-catch block to handle errors gracefully
    - Log the error to the console
    - Show a generic error message
*/

// index.js
// Handles admin/doctor login wiring and submit handlers per project spec.
// - tries to import openModal and BASE_API_URL with fallbacks
// - defines ADMIN_API and DOCTOR_API
// - wires buttons to open modals on load
// - exposes window.adminLoginHandler and window.doctorLoginHandler

(async function () {
  "use strict";

  // --- Try to import BASE_API_URL and openModal, fallback to globals/defaults ---
  let BASE_API_URL = null;
  let openModalFn = null;

  try {
    const cfg = await import('/js/config.js').catch(() => null);
    if (cfg && cfg.BASE_API_URL) BASE_API_URL = cfg.BASE_API_URL;
  } catch (e) {
    // ignore
  }

  // fallback to window or default
  if (!BASE_API_URL) BASE_API_URL = window.BASE_API_URL || 'http://localhost:8080/api';

  try {
    const modalMod = await import('/js/components/modal.js').catch(() => null);
    if (modalMod && typeof modalMod.openModal === 'function') openModalFn = modalMod.openModal;
  } catch (e) {
    // ignore
  }
  if (!openModalFn && typeof window.openModal === 'function') openModalFn = window.openModal;

  // --- Endpoints ---
  const trimSlash = (s) => s.replace(/\/+$/, '');
  const base = trimSlash(BASE_API_URL);
  const ADMIN_API = `${base}/auth/admin/login`;
  const DOCTOR_API = `${base}/auth/doctor/login`;

  // --- Helpers ---
  const $ = id => document.getElementById(id);
  const readVal = id => {
    const el = $(id);
    if (!el) return '';
    return (el.value || '').trim();
  };
  const showAlert = (msg) => {
    if (typeof window.showToast === 'function') window.showToast(msg);
    else alert(msg);
  };
  const storeToken = (token) => {
    try { localStorage.setItem('token', token); } catch (e) { console.warn('store token failed', e); }
  };
  const storeUserRole = (role) => {
    try { localStorage.setItem('userRole', role); } catch (e) { console.warn('store role failed', e); }
  };
  const closeModalIfAny = () => {
    if (typeof window.closeModal === 'function') { window.closeModal(); return; }
    const modal = $('modal');
    if (modal) modal.setAttribute('aria-hidden', 'true');
  };
  const selectRole = (role) => {
    if (typeof window.selectRole === 'function') {
      window.selectRole(role);
      return;
    }
    // fallback: store and navigate
    storeUserRole(role);
    if (role === 'admin') window.location.href = '/admin/dashboard';
    else if (role === 'doctor') window.location.href = '/doctor/dashboard';
    else window.location.href = '/';
  };

  // --- Wire buttons on window.onload ---
  window.addEventListener('load', () => {
    const adminLoginBtn = $('adminLogin');
    const doctorLoginBtn = $('doctorLogin');

    if (adminLoginBtn) {
      adminLoginBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        if (openModalFn) openModalFn('adminLogin');
        else if (typeof window.openModal === 'function') window.openModal('adminLogin');
        else window.location.href = '/auth/admin/login';
      });
    }

    if (doctorLoginBtn) {
      doctorLoginBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        if (openModalFn) openModalFn('doctorLogin');
        else if (typeof window.openModal === 'function') window.openModal('doctorLogin');
        else window.location.href = '/auth/doctor/login';
      });
    }
  });

  // --- adminLoginHandler ---
  window.adminLoginHandler = async function (evt) {
    if (evt && typeof evt.preventDefault === 'function') evt.preventDefault();
    try {
      // Step 1: read inputs (IDs expected: adminUsername or adminEmail, adminPassword)
      const username = readVal('adminUsername') || readVal('adminEmail');
      const password = readVal('adminPassword');

      // Basic validation
      if (!username || !password) {
        showAlert('Please enter both username and password.');
        return;
      }

      // Step 2: payload
      const payload = { username, password };

      // Step 3: POST
      const resp = await fetch(ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!resp.ok) {
        let err = `Login failed (status ${resp.status})`;
        try { const ej = await resp.json(); if (ej && (ej.message || ej.error)) err = ej.message || ej.error; } catch (e) {}
        showAlert(err);
        return;
      }

      // Step 4: parse token
      const data = await resp.json();
      const token = data?.token || data?.accessToken || data?.authToken;
      if (!token) { showAlert('Login succeeded but token was not returned.'); return; }

      storeToken(token);
      if (data.user) { try { localStorage.setItem('userData', JSON.stringify(data.user)); } catch (e) {} }

      closeModalIfAny();
      selectRole('admin');

    } catch (error) {
      console.error('adminLoginHandler error', error);
      showAlert('An error occurred during admin login. Please try again.');
    }
  };

  // --- doctorLoginHandler ---
  window.doctorLoginHandler = async function (evt) {
    if (evt && typeof evt.preventDefault === 'function') evt.preventDefault();
    try {
      // Step 1: read inputs (IDs expected: doctorEmail, doctorPassword)
      const email = readVal('doctorEmail') || readVal('doctorUsername');
      const password = readVal('doctorPassword');

      if (!email || !password) {
        showAlert('Please enter both email and password.');
        return;
      }

      const payload = { email, password };

      const resp = await fetch(DOCTOR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!resp.ok) {
        let err = `Login failed (status ${resp.status})`;
        try { const ej = await resp.json(); if (ej && (ej.message || ej.error)) err = ej.message || ej.error; } catch (e) {}
        showAlert(err);
        return;
      }

      const data = await resp.json();
      const token = data?.token || data?.accessToken || data?.authToken;
      if (!token) { showAlert('Login succeeded but token was not returned.'); return; }

      storeToken(token);
      if (data.user) { try { localStorage.setItem('userData', JSON.stringify(data.user)); } catch (e) {} }

      closeModalIfAny();
      selectRole('doctor');

    } catch (error) {
      console.error('doctorLoginHandler error', error);
      showAlert('An error occurred during doctor login. Please try again.');
    }
  };

})();

