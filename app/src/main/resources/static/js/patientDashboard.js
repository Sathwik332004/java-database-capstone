/*
// patientDashboard.js
import { getDoctors } from './services/doctorServices.js';
import { openModal } from './components/modals.js';
import { createDoctorCard } from './components/doctorCard.js';
import { filterDoctors } from './services/doctorServices.js';//call the same function to avoid duplication coz the functionality was same
import { patientSignup, patientLogin } from './services/patientServices.js';



document.addEventListener("DOMContentLoaded", () => {
  loadDoctorCards();
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("patientSignup");
  if (btn) {
    btn.addEventListener("click", () => openModal("patientSignup"));
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("patientLogin")
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      openModal("patientLogin")
    })
  }
})

function loadDoctorCards() {
  getDoctors()
    .then(doctors => {
      const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = "";

      doctors.forEach(doctor => {
        const card = createDoctorCard(doctor);
        contentDiv.appendChild(card);
      });
    })
    .catch(error => {
      console.error("Failed to load doctors:", error);
    });
}
// Filter Input
document.getElementById("searchBar").addEventListener("input", filterDoctorsOnChange);
document.getElementById("filterTime").addEventListener("change", filterDoctorsOnChange);
document.getElementById("filterSpecialty").addEventListener("change", filterDoctorsOnChange);



function filterDoctorsOnChange() {
  const searchBar = document.getElementById("searchBar").value.trim();
  const filterTime = document.getElementById("filterTime").value;
  const filterSpecialty = document.getElementById("filterSpecialty").value;


  const name = searchBar.length > 0 ? searchBar : null;
  const time = filterTime.length > 0 ? filterTime : null;
  const specialty = filterSpecialty.length > 0 ? filterSpecialty : null;

  filterDoctors(name, time, specialty)
    .then(response => {
      const doctors = response.doctors;
      const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = "";

      if (doctors.length > 0) {
        console.log(doctors);
        doctors.forEach(doctor => {
          const card = createDoctorCard(doctor);
          contentDiv.appendChild(card);
        });
      } else {
        contentDiv.innerHTML = "<p>No doctors found with the given filters.</p>";
        console.log("Nothing");
      }
    })
    .catch(error => {
      console.error("Failed to filter doctors:", error);
      alert("❌ An error occurred while filtering doctors.");
    });
}

window.signupPatient = async function () {
  try {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    const data = { name, email, password, phone, address };
    const { success, message } = await patientSignup(data);
    if (success) {
      alert(message);
      document.getElementById("modal").style.display = "none";
      window.location.reload();
    }
    else alert(message);
  } catch (error) {
    console.error("Signup failed:", error);
    alert("❌ An error occurred while signing up.");
  }
};

window.loginPatient = async function () {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const data = {
      email,
      password
    }
    console.log("loginPatient :: ", data)
    const response = await patientLogin(data);
    console.log("Status Code:", response.status);
    console.log("Response OK:", response.ok);
    if (response.ok) {
      const result = await response.json();
      console.log(result);
      selectRole('loggedPatient');
      localStorage.setItem('token', result.token)
      window.location.href = '/pages/loggedPatientDashboard.html';
    } else {
      alert('❌ Invalid credentials!');
    }
  }
  catch (error) {
    alert("❌ Failed to Login : ", error);
    console.log("Error :: loginPatient :: ", error)
  }


}
*/

// patientDashboard.js
// Path: src/main/resources/static/js/patientDashboard.js

// Imports (adjust paths if your project structure differs)
import { getDoctors, filterDoctors } from './services/doctorServices.js';
import { patientSignup, patientLogin } from './services/patientServices.js';
import { openModal } from './components/modals.js';
import { createDoctorCard } from './components/doctorCard.js';
import { selectRole } from './util.js'; // helper that stores role in localStorage

/* ----------------- Utilities ----------------- */
const $ = (id) => document.getElementById(id);

function debounce(fn, wait = 220) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function logErr(prefix, err) {
  console.error(prefix, err);
}

/* ----------------- Core: Load & Render Doctors ----------------- */
export async function loadDoctorCards() {
  try {
    const doctors = await getDoctors();
    const contentDiv = $('content');
    if (!contentDiv) return;

    contentDiv.innerHTML = '';

    if (!Array.isArray(doctors) || doctors.length === 0) {
      contentDiv.innerHTML = '<div class="empty-state">No doctors available.</div>';
      return;
    }

    doctors.forEach(doctor => {
      try {
        const card = createDoctorCard(doctor);
        contentDiv.appendChild(card);
      } catch (err) {
        console.warn('createDoctorCard failed for doctor', doctor, err);
      }
    });
  } catch (err) {
    logErr('Failed to load doctors:', err);
    const contentDiv = $('content');
    if (contentDiv) contentDiv.innerHTML = `<div class="empty-state">Failed to load doctors. Try again later.</div>`;
  }
}

/* ----------------- Filtering ----------------- */
async function filterDoctorsOnChange() {
  try {
    const searchEl = $('searchBar');
    const filterTimeEl = $('filterTime');
    const filterSpecialtyEl = $('filterSpecialty');

    if (!searchEl || !filterTimeEl || !filterSpecialtyEl) return;

    const nameVal = searchEl.value.trim();
    const timeVal = filterTimeEl.value;
    const specialtyVal = filterSpecialtyEl.value;

    const name = nameVal.length > 0 ? nameVal : null;
    const time = timeVal.length > 0 ? timeVal : null;
    const specialty = specialtyVal.length > 0 ? specialtyVal : null;

    const response = await filterDoctors(name, time, specialty);

    // Normalize response: may be array or { doctors: [] } or { content: [] }
    let doctors = [];
    if (response == null) doctors = [];
    else if (Array.isArray(response)) doctors = response;
    else if (Array.isArray(response.doctors)) doctors = response.doctors;
    else if (Array.isArray(response.content)) doctors = response.content;
    else doctors = [];

    const contentDiv = $('content');
    if (!contentDiv) return;
    contentDiv.innerHTML = '';

    if (doctors.length > 0) {
      doctors.forEach(doctor => {
        try {
          const card = createDoctorCard(doctor);
          contentDiv.appendChild(card);
        } catch (err) {
          console.warn('createDoctorCard failed for doctor', doctor, err);
        }
      });
    } else {
      contentDiv.innerHTML = "<p class='empty-state'>No doctors found with the given filters.</p>";
    }
  } catch (error) {
    logErr('Failed to filter doctors:', error);
    alert("❌ An error occurred while filtering doctors.");
  }
}

/* ----------------- Signup & Login Handlers (global) ----------------- */
/**
 * signupPatient - exposed globally at window.signupPatient for modal submit
 * Expects modal inputs with ids: name, email, password, phone, address
 */
window.signupPatient = async function signupPatient() {
  try {
    const nameEl = $('name');
    const emailEl = $('email');
    const passwordEl = $('password');
    const phoneEl = $('phone');
    const addressEl = $('address');

    if (!nameEl || !emailEl || !passwordEl || !phoneEl || !addressEl) {
      alert('Signup form elements not found.');
      return;
    }

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passwordEl.value;
    const phone = phoneEl.value.trim();
    const address = addressEl.value.trim();

    if (!name || !email || !password) {
      alert('Please fill required fields: name, email and password.');
      return;
    }

    const data = { name, email, password, phone, address };
    const res = await patientSignup(data);

    if (res && res.success) {
      alert(res.message || 'Signup successful.');
      // close modal if present
      try {
        const modal = $('modal');
        if (modal) modal.style.display = 'none';
      } catch (e) {}
      await loadDoctorCards();
    } else {
      alert(res && res.message ? res.message : 'Signup failed.');
    }
  } catch (error) {
    logErr('Signup failed:', error);
    alert("❌ An error occurred while signing up.");
  }
};

/**
 * loginPatient - exposed globally at window.loginPatient for modal submit
 * Expects modal inputs with ids: email, password
 */
window.loginPatient = async function loginPatient() {
  try {
    const emailEl = $('email');
    const passwordEl = $('password');
    if (!emailEl || !passwordEl) {
      alert('Login form elements not found.');
      return;
    }

    const email = emailEl.value.trim();
    const password = passwordEl.value;

    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    const payload = { email, password };
    const response = await patientLogin(payload);

    // Support both raw fetch Response and parsed return shapes
    if (response && typeof response.ok !== 'undefined') {
      if (response.ok) {
        const result = await response.json();
        if (result && result.token) {
          localStorage.setItem('token', result.token);
          if (typeof selectRole === 'function') selectRole('loggedPatient');
          else localStorage.setItem('userRole', 'loggedPatient');
          window.location.href = '/pages/loggedPatientDashboard.html';
          return;
        } else {
          alert('Login succeeded but token missing.');
          return;
        }
      } else {
        alert('❌ Invalid credentials!');
        return;
      }
    } else {
      // non-fetch path: maybe patientLogin returns { success, token }
      if (response && response.success && response.token) {
        localStorage.setItem('token', response.token);
        if (typeof selectRole === 'function') selectRole('loggedPatient');
        else localStorage.setItem('userRole', 'loggedPatient');
        window.location.href = '/pages/loggedPatientDashboard.html';
        return;
      } else {
        alert('❌ Invalid credentials!');
        return;
      }
    }
  } catch (error) {
    logErr('Login failed:', error);
    alert("❌ Failed to Login. See console for details.");
  }
};

/* ----------------- Initialization & Event Wiring ----------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Wire signup button
  const signupBtn = $('patientSignup');
  if (signupBtn) {
    signupBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      try {
        if (typeof openModal === 'function') openModal('patientSignup');
        else {
          const modal = $('modal'); if (modal) modal.style.display = 'block';
        }
      } catch (e) { console.warn('openModal error', e); }
    });
  }

  // Wire login button
  const loginBtn = $('patientLogin');
  if (loginBtn) {
    loginBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      try {
        if (typeof openModal === 'function') openModal('patientLogin');
        else {
          const modal = $('modal'); if (modal) modal.style.display = 'block';
        }
      } catch (e) { console.warn('openModal error', e); }
    });
  }

  // Load doctors initially
  loadDoctorCards();

  // Attach filter listeners with debounce
  const searchEl = $('searchBar');
  if (searchEl) searchEl.addEventListener('input', debounce(filterDoctorsOnChange, 300));
  const timeEl = $('filterTime');
  if (timeEl) timeEl.addEventListener('change', filterDoctorsOnChange);
  const specialtyEl = $('filterSpecialty');
  if (specialtyEl) specialtyEl.addEventListener('change', filterDoctorsOnChange);
});

