/*
  This script handles the admin dashboard functionality for managing doctors:
  - Loads all doctor cards
  - Filters doctors by name, time, or specialty
  - Adds a new doctor via modal form


  Attach a click listener to the "Add Doctor" button
  When clicked, it opens a modal form using openModal('addDoctor')


  When the DOM is fully loaded:
    - Call loadDoctorCards() to fetch and display all doctors


  Function: loadDoctorCards
  Purpose: Fetch all doctors and display them as cards

    Call getDoctors() from the service layer
    Clear the current content area
    For each doctor returned:
    - Create a doctor card using createDoctorCard()
    - Append it to the content div

    Handle any fetch errors by logging them


  Attach 'input' and 'change' event listeners to the search bar and filter dropdowns
  On any input change, call filterDoctorsOnChange()


  Function: filterDoctorsOnChange
  Purpose: Filter doctors based on name, available time, and specialty

    Read values from the search bar and filters
    Normalize empty values to null
    Call filterDoctors(name, time, specialty) from the service

    If doctors are found:
    - Render them using createDoctorCard()
    If no doctors match the filter:
    - Show a message: "No doctors found with the given filters."

    Catch and display any errors with an alert


  Function: renderDoctorCards
  Purpose: A helper function to render a list of doctors passed to it

    Clear the content area
    Loop through the doctors and append each card to the content area


  Function: adminAddDoctor
  Purpose: Collect form data and add a new doctor to the system

    Collect input values from the modal form
    - Includes name, email, phone, password, specialty, and available times

    Retrieve the authentication token from localStorage
    - If no token is found, show an alert and stop execution

    Build a doctor object with the form values

    Call saveDoctor(doctor, token) from the service

    If save is successful:
    - Show a success message
    - Close the modal and reload the page

    If saving fails, show an error message
*/

// adminDashboard.js
// Path: app/src/main/resources/static/js/adminDashboard.js

import { openModal } from './components/modals.js';
import { getDoctors, filterDoctors, saveDoctor } from './services/doctorServices.js';
import { createDoctorCard } from './components/doctorCard.js';

// utility: safe query, toast + debounce
const $ = id => document.getElementById(id);
function showAlert(msg) {
  if (typeof window.showToast === 'function') return window.showToast(msg);
  return alert(msg);
}
function debounce(fn, wait = 200) {
  let t = null;
  return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}

// IDs used in templates
const IDS = {
  content: 'content',
  search: 'searchBar',
  filterTime: 'filterTime',
  filterSpecialty: 'filterSpecialty',
  addDocBtn: 'addDocBtn',           // button that opens modal
  addDoctorSubmit: 'submitAddDoctor', // button inside modal to create
  // modal form input ids
  docFullName: 'docFullName',
  docEmail: 'docEmail',
  docPhone: 'docPhone',
  docSpecialty: 'docSpecialty',
  docPassword: 'docPassword',
  docExperience: 'docExperience',
  docAvailableTimes: 'docAvailableTimes', // comma-separated
  modalId: 'modal'
};

/**
 * renderDoctorCards
 * Clears content and renders an array of doctors using createDoctorCard.
 */
function renderDoctorCards(doctors = []) {
  const content = $(IDS.content);
  if (!content) return;

  content.innerHTML = '';
  if (!Array.isArray(doctors) || doctors.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No doctors found.';
    content.appendChild(empty);
    return;
  }

  doctors.forEach(doc => {
    try {
      const card = createDoctorCard(doc);
      content.appendChild(card);
    } catch (err) {
      console.warn('createDoctorCard failed for', doc, err);
      // fallback minimal card
      const fallback = document.createElement('div');
      fallback.className = 'doctor-card';
      fallback.innerHTML = `<strong>${doc.fullName || doc.name || 'Unknown'}</strong><div>${doc.specialization || doc.specialty || ''}</div>`;
      content.appendChild(fallback);
    }
  });
}

/**
 * loadDoctorCards
 * Fetches all doctors (getDoctors) and renders them.
 */
export async function loadDoctorCards() {
  const content = $(IDS.content);
  if (content) content.innerHTML = '<div class="empty-state">Loading doctors…</div>';

  try {
    const doctors = await getDoctors();
    renderDoctorCards(doctors);
  } catch (err) {
    console.error('loadDoctorCards error', err);
    if (content) content.innerHTML = `<div class="empty-state">Failed to load doctors: ${err?.message || err}</div>`;
  }
}

/**
 * filterDoctorsOnChange
 * Read UI filters and call filterDoctors() service.
 */
export async function filterDoctorsOnChange() {
  const name = ($(IDS.search) && $(IDS.search).value.trim()) || null;
  const time = ($(IDS.filterTime) && $(IDS.filterTime).value) || null;
  const specialty = ($(IDS.filterSpecialty) && $(IDS.filterSpecialty).value) || null;

  try {
    const result = await filterDoctors(name, time, specialty);
    // service may return array or object { doctors: [] } — normalize
    let doctors = [];
    if (!result) doctors = [];
    else if (Array.isArray(result)) doctors = result;
    else if (Array.isArray(result.doctors)) doctors = result.doctors;
    else if (Array.isArray(result.content)) doctors = result.content;
    else doctors = [];

    renderDoctorCards(doctors);
  } catch (err) {
    console.error('filterDoctorsOnChange error', err);
    showAlert('❌ Error filtering doctors. See console for details.');
  }
}

/**
 * adminAddDoctor
 * Collects modal form input values, validates, and calls saveDoctor()
 */
export async function adminAddDoctor() {
  try {
    const fullName = $(IDS.docFullName) ? $(IDS.docFullName).value.trim() : '';
    const email = $(IDS.docEmail) ? $(IDS.docEmail).value.trim() : '';
    const phone = $(IDS.docPhone) ? $(IDS.docPhone).value.trim() : '';
    const specialty = $(IDS.docSpecialty) ? $(IDS.docSpecialty).value.trim() : '';
    const password = $(IDS.docPassword) ? $(IDS.docPassword).value : '';
    const experienceYears = $(IDS.docExperience) ? Number($(IDS.docExperience).value) || 0 : 0;
    const availableTimesRaw = $(IDS.docAvailableTimes) ? $(IDS.docAvailableTimes).value : '';
    const availableTimes = availableTimesRaw ? availableTimesRaw.split(',').map(s=>s.trim()).filter(Boolean) : [];

    if (!fullName || !email || !phone || !specialty || !password) {
      showAlert('Please fill required fields: name, email, phone, specialty and password.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showAlert('Authentication required — please log in as admin.');
      return;
    }

    const doctorObj = {
      fullName,
      email,
      phone,
      specialization: specialty,
      password,
      experienceYears,
      availableTimes
    };

    // Optional UI feedback
    const submitBtn = $(IDS.addDoctorSubmit);
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    const res = await saveDoctor(doctorObj, token);
    // saveDoctor returns { success, message } or response body depending on implementation
    // accept multiple shapes
    let ok = false, message = '';
    if (res && typeof res === 'object') {
      if (typeof res.success !== 'undefined') { ok = !!res.success; message = res.message || ''; }
      else if (res.id || res._id || res.data) { ok = true; message = 'Doctor saved.'; }
      else ok = true;
    } else {
      ok = true;
    }

    if (ok) {
      showAlert('✅ Doctor added successfully.');
      // close modal
      if (typeof openModal === 'function') {
        // if your modal exposes close function on window, call it; otherwise hide #modal
        if (typeof window.closeModal === 'function') window.closeModal();
        else {
          const modal = $(IDS.modalId);
          if (modal) modal.setAttribute('aria-hidden','true');
        }
      }
      // reload list
      await loadDoctorCards();
    } else {
      showAlert(`❌ Failed to add doctor. ${message || ''}`);
    }
  } catch (err) {
    console.error('adminAddDoctor error', err);
    showAlert(`❌ Error creating doctor: ${err?.message || err}`);
  } finally {
    const submitBtn = $(IDS.addDoctorSubmit);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Doctor';
    }
  }
}

// Expose adminAddDoctor to global scope so modal's submit can call it if wired inline
window.adminAddDoctor = adminAddDoctor;

// Attach DOM listeners
document.addEventListener('DOMContentLoaded', () => {
  // open add doctor modal
  const addBtn = $(IDS.addDocBtn);
  if (addBtn) addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (typeof openModal === 'function') openModal('addDoctor');
    else {
      const modal = $(IDS.modalId);
      if (modal) modal.setAttribute('aria-hidden','false');
    }
  });

  // submit button inside modal (if exists)
  const submitBtn = $(IDS.addDoctorSubmit);
  if (submitBtn) submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adminAddDoctor();
  });

  // search and filters
  const searchEl = $(IDS.search);
  if (searchEl) searchEl.addEventListener('input', debounce(filterDoctorsOnChange, 260));
  const timeEl = $(IDS.filterTime);
  if (timeEl) timeEl.addEventListener('change', filterDoctorsOnChange);
  const specialtyEl = $(IDS.filterSpecialty);
  if (specialtyEl) specialtyEl.addEventListener('change', filterDoctorsOnChange);

  // initial load
  loadDoctorCards();
});


