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

// index.js
// Role-Based Login Handling
// Path: app/src/main/resources/static/js/services/index.js

// NOTE: adjust import path for config if your config file is at ../config/config.js
// In this project we keep config at ../config.js (one level up from services).
import { BASE_API_URL } from '../config.js';
import { openModal as openModalComponent } from '../components/modals.js';
import { selectRole } from '../util.js'; // helper that sets userRole in localStorage

// Constants for endpoints (per your instruction)
const ADMIN_API = BASE_API_URL.replace(/\/+$/, '') + '/admin';
const DOCTOR_API = BASE_API_URL.replace(/\/+$/, '') + '/doctor/login';

// Helper to safely open modal (uses imported component or window fallback)
function openModal(name) {
  try {
    if (typeof openModalComponent === 'function') {
      // If your modal component expects (name, payload) adjust accordingly
      return openModalComponent(name);
    }
  } catch (e) {
    // ignore and fall through to window fallback
  }
  if (typeof window.openModal === 'function') return window.openModal(name);
  // fallback: show #modal if exists
  const modal = document.getElementById('modal');
  if (modal) { modal.style.display = 'block'; modal.setAttribute('aria-hidden', 'false'); }
  return null;
}

// Wire UI buttons after page load
window.onload = function () {
  const adminBtn = document.getElementById('adminLogin');
  if (adminBtn) {
    adminBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('adminLogin');
    });
  }

  const doctorBtn = document.getElementById('doctorLogin');
  if (doctorBtn) {
    doctorBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('doctorLogin');
    });
  }
};

/**
 * Admin login handler exposed globally as window.adminLoginHandler
 * Expected inputs inside admin login modal:
 *  - <input id="adminUsername" />
 *  - <input id="adminPassword" />
 */
window.adminLoginHandler = async function adminLoginHandler() {
  try {
    const usernameEl = document.getElementById('adminUsername');
    const passwordEl = document.getElementById('adminPassword');

    if (!usernameEl || !passwordEl) {
      alert('Admin login inputs not found. Please ensure the modal has inputs with ids "adminUsername" and "adminPassword".');
      return;
    }

    const username = usernameEl.value?.trim();
    const password = passwordEl.value ?? '';

    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }

    const admin = { username, password };

    const resp = await fetch(`${ADMIN_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(admin)
    });

    if (!resp.ok) {
      // try to parse error message
      let errMsg = `Invalid credentials (${resp.status})`;
      try { const errJson = await resp.json(); if (errJson && errJson.message) errMsg = errJson.message; } catch (e) {}
      alert('❌ Invalid credentials!');
      console.warn('Admin login failed:', resp.status, resp.statusText);
      return;
    }

    const data = await resp.json();
    const token = data?.token || data?.accessToken || null;
    if (!token) {
      alert('Login succeeded but no token returned by server.');
      return;
    }

    // store token & role
    try { localStorage.setItem('token', token); } catch (e) { console.warn('localStorage set token failed', e); }
    if (typeof selectRole === 'function') selectRole('admin');
    else localStorage.setItem('userRole', 'admin');

    // close modal if present
    const modal = document.getElementById('modal');
    if (modal) { modal.style.display = 'none'; modal.setAttribute('aria-hidden', 'true'); }

    // redirect to admin area (adjust path if different)
    window.location.href = '/admin/dashboard';
  } catch (err) {
    console.error('adminLoginHandler error', err);
    alert('❌ An error occurred while logging in as admin. Check console for details.');
  }
};

/**
 * Doctor login handler exposed globally as window.doctorLoginHandler
 * Expected inputs inside doctor login modal:
 *  - <input id="doctorEmail" />
 *  - <input id="doctorPassword" />
 */
window.doctorLoginHandler = async function doctorLoginHandler() {
  try {
    const emailEl = document.getElementById('doctorEmail');
    const passwordEl = document.getElementById('doctorPassword');

    if (!emailEl || !passwordEl) {
      alert('Doctor login inputs not found. Please ensure the modal has inputs with ids "doctorEmail" and "doctorPassword".');
      return;
    }

    const email = emailEl.value?.trim();
    const password = passwordEl.value ?? '';

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    const doctor = { email, password };

    const resp = await fetch(DOCTOR_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(doctor)
    });

    if (!resp.ok) {
      alert('❌ Invalid credentials!');
      console.warn('Doctor login failed:', resp.status, resp.statusText);
      return;
    }

    const data = await resp.json();
    const token = data?.token || data?.accessToken || null;
    if (!token) {
      alert('Login succeeded but server did not return a token.');
      return;
    }

    // store token & role
    try { localStorage.setItem('token', token); } catch (e) { console.warn('localStorage set token failed', e); }
    if (typeof selectRole === 'function') selectRole('doctor');
    else localStorage.setItem('userRole', 'doctor');

    // close modal if present
    const modal = document.getElementById('modal');
    if (modal) { modal.style.display = 'none'; modal.setAttribute('aria-hidden', 'true'); }

    // redirect to doctor dashboard (adjust path if needed)
    window.location.href = '/doctor/dashboard';
  } catch (err) {
    console.error('doctorLoginHandler error', err);
    alert('❌ An error occurred while logging in as doctor. Check console for details.');
  }
};


