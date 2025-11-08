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
// ES module for Admin dashboard interactions (load, filter, add, delete doctors)

import { createDoctorCard } from '/js/components/doctorCard.js';

// Try to import service helpers if available; otherwise we'll use fallbacks
let getDoctorsSvc = null;
let filterDoctorsSvc = null;
let saveDoctorSvc = null;
let openModalFn = null;

(async function tryImports() {
  try {
    const svc = await import('/js/services/doctorServices.js').catch(() => null);
    if (svc) {
      if (typeof svc.getDoctors === 'function') getDoctorsSvc = svc.getDoctors;
      if (typeof svc.filterDoctors === 'function') filterDoctorsSvc = svc.filterDoctors;
      if (typeof svc.saveDoctor === 'function') saveDoctorSvc = svc.saveDoctor;
    }
  } catch (e) {
    console.warn('doctorServices import failed', e);
  }

  try {
    const modal = await import('/js/components/modal.js').catch(() => null);
    if (modal && typeof modal.openModal === 'function') openModalFn = modal.openModal;
  } catch (e) {
    // ignore
  }

  // fallback to globals if module imports not present
  if (!openModalFn && typeof window.openModal === 'function') openModalFn = window.openModal;
})();

// Helper DOM selectors (deferred lookup inside DOMContentLoaded)
const selectors = {
  contentId: 'content',
  searchId: 'searchBar',
  specialtyId: 'specialtyFilter',
  timeSortId: 'timeSort',
  addBtnId: 'openAddDoctor',
  submitAddBtnId: 'submitAddDoctor',
  cancelAddBtnId: 'cancelAddDoctor',
  modalId: 'modal',
  modalBackdropId: 'modalBackdrop',
  closeModalId: 'closeModal',
  addFormId: 'addDoctorForm',
  addFeedbackId: 'addDoctorFeedback',
  emptyStateId: 'emptyState'
};

// Basic fallback API base
const API_BASE = (window.BASE_API_URL && window.BASE_API_URL.replace(/\/+$/, '')) || '/api';
const FALLBACK_DOCTORS_ENDPOINT = `${API_BASE}/admin/doctors`;

// ------ Utility helpers ------
const $ = (id) => document.getElementById(id);
const safeText = (v) => (v === null || v === undefined) ? '' : String(v).trim();

function showAlert(msg) {
  if (typeof window.showToast === 'function') window.showToast(msg);
  else alert(msg);
}

function tokenOrAlert() {
  const token = localStorage.getItem('token');
  if (!token) {
    showAlert('Authentication required. Please log in as admin.');
  }
  return token;
}

// ------ Service fallbacks (if service functions not provided) ------
async function fallbackGetDoctors() {
  const token = localStorage.getItem('token');
  const headers = token ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
  const resp = await fetch(FALLBACK_DOCTORS_ENDPOINT, { method: 'GET', headers });
  if (!resp.ok) throw new Error(`Failed to fetch doctors (${resp.status})`);
  const data = await resp.json();
  // Accept either array or { content: [...] } shape
  return Array.isArray(data) ? data : (data.content || []);
}

async function fallbackFilterDoctors(name, time, specialty) {
  // simple server-side filter attempt: build query params
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (time) params.append('time', time);
  if (specialty) params.append('specialty', specialty);
  const url = `${FALLBACK_DOCTORS_ENDPOINT}?${params.toString()}`;
  const token = localStorage.getItem('token');
  const headers = token ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } : { 'Accept': 'application/json' };
  const resp = await fetch(url, { method: 'GET', headers });
  if (!resp.ok) throw new Error(`Filter request failed (${resp.status})`);
  const data = await resp.json();
  return Array.isArray(data) ? data : (data.content || []);
}

async function fallbackSaveDoctor(doctorObj, token) {
  if (!token) throw new Error('Missing token');
  const resp = await fetch(FALLBACK_DOCTORS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(doctorObj)
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(()=>null);
    throw new Error(`Save failed: ${resp.status} ${txt || ''}`);
  }
  return await resp.json();
}

// pick service methods with fallbacks
const getDoctors = async () => (typeof getDoctorsSvc === 'function' ? getDoctorsSvc() : fallbackGetDoctors());
const filterDoctors = async (name, time, specialty) => (typeof filterDoctorsSvc === 'function' ? filterDoctorsSvc(name, time, specialty) : fallbackFilterDoctors(name, time, specialty));
const saveDoctor = async (doctorObj, token) => (typeof saveDoctorSvc === 'function' ? saveDoctorSvc(doctorObj, token) : fallbackSaveDoctor(doctorObj, token));

// ------ DOM operation functions ------

/**
 * renderDoctorCards
 * Clear content area and render list of doctor cards
 */
function renderDoctorCards(doctors = []) {
  const content = $(selectors.contentId);
  if (!content) return;
  content.innerHTML = '';

  if (!doctors || doctors.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No doctors found with the given filters.';
    content.appendChild(empty);
    return;
  }

  doctors.forEach(doc => {
    // create card element (use imported createDoctorCard if available)
    let cardEl = null;
    try {
      if (typeof createDoctorCard === 'function') {
        cardEl = createDoctorCard(doc, {
          onView: (d) => { window.location.href = `/admin/doctors/${d.id}`; },
          onDelete: async (d) => { /* optional extra pre-delete logic */ },
          onDeleted: (d) => { /* optional post-delete callback */ }
        });
      }
    } catch (err) {
      console.warn('createDoctorCard error', err);
    }

    // fallback simple card if creation failed
    if (!cardEl) {
      const fallback = document.createElement('div');
      fallback.className = 'doctor-card sc-card';
      fallback.innerHTML = `<div><strong>${safeText(doc.fullName||doc.name||'Unknown')}</strong><div>${safeText(doc.specialization||doc.specialty||'General')}</div></div>`;
      cardEl = fallback;
    }

    content.appendChild(cardEl);
  });
}

/**
 * loadDoctorCards
 * Fetch all doctors and display them
 */
export async function loadDoctorCards() {
  const content = $(selectors.contentId);
  if (!content) return;
  content.innerHTML = '<div class="empty-state">Loading doctors…</div>';

  try {
    const doctors = await getDoctors();
    renderDoctorCards(doctors);
  } catch (err) {
    console.error('loadDoctorCards error', err);
    content.innerHTML = `<div class="empty-state">Failed to load doctors: ${err.message || err}</div>`;
  }
}

/**
 * filterDoctorsOnChange
 * Read filters and request filtered list from service
 */
export async function filterDoctorsOnChange() {
  const nameVal = safeText($(selectors.searchId) ? $(selectors.searchId).value : '');
  const timeVal = safeText($(selectors.timeSortId) ? $(selectors.timeSortId).value : '');
  const specialtyVal = safeText($(selectors.specialtyId) ? $(selectors.specialtyId).value : '');

  // normalize empty strings to null
  const name = nameVal === '' ? null : nameVal;
  const time = timeVal === '' ? null : timeVal;
  const specialty = specialtyVal === '' ? null : specialtyVal;

  try {
    const doctors = await filterDoctors(name, time, specialty);
    if (!doctors || doctors.length === 0) {
      const content = $(selectors.contentId);
      if (content) {
        content.innerHTML = '<div class="empty-state">No doctors found with the given filters.</div>';
      }
      return;
    }
    renderDoctorCards(doctors);
  } catch (err) {
    console.error('filterDoctorsOnChange error', err);
    showAlert(`Error filtering doctors: ${err.message || err}`);
  }
}

/**
 * adminAddDoctor
 * Collect form data from modal and add a new doctor
 */
export async function adminAddDoctor() {
  // elements from modal form
  const fullNameEl = $('docFullName');
  const emailEl = $('docEmail');
  const phoneEl = $('docPhone');
  const specialtyEl = $('docSpecialty');
  const experienceEl = $('docExperience');
  const timesEl = $('docAvailableTimes'); // optional additional input; fallback parse from docSpecialty if none

  if (!fullNameEl || !emailEl || !phoneEl || !specialtyEl || !experienceEl) {
    showAlert('Add Doctor form is not found / not properly configured.');
    return;
  }

  const fullName = safeText(fullNameEl.value);
  const email = safeText(emailEl.value);
  const phone = safeText(phoneEl.value);
  const specialty = safeText(specialtyEl.value);
  const experienceYears = Number(safeText(experienceEl.value)) || 0;
  let availableTimes = [];

  if (timesEl && timesEl.value) {
    // expecting comma-separated times like "09:00-10:00, 10:00-11:00"
    availableTimes = timesEl.value.split(',').map(s => s.trim()).filter(Boolean);
  }

  // token check
  const token = tokenOrAlert();
  if (!token) return;

  const doctorObj = {
    fullName,
    email,
    phone,
    specialization: specialty,
    experienceYears,
    availableTimes
  };

  try {
    // UI feedback element (if exists)
    const feedback = $(selectors.addFeedbackId);
    if (feedback) feedback.textContent = 'Saving doctor…';

    const created = await saveDoctor(doctorObj, token);
    // success
    if (feedback) feedback.textContent = 'Doctor created successfully.';
    // close modal if modal helper exists
    if (typeof openModalFn === 'function') {
      // if modal module openModal toggles, we attempt to close by calling closeModal if exposed
      if (typeof window.closeModal === 'function') window.closeModal();
    } else {
      // generic hide modal
      const modal = $(selectors.modalId);
      if (modal) modal.setAttribute('aria-hidden', 'true');
    }

    // reload doctors
    await loadDoctorCards();

  } catch (err) {
    console.error('adminAddDoctor error', err);
    const feedback = $(selectors.addFeedbackId);
    if (feedback) feedback.textContent = `Failed to create doctor: ${err.message || err}`;
    else showAlert(`Failed to create doctor: ${err.message || err}`);
  }
}

// Attach event listeners when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // wire Add Doctor button to open modal via openModal('addDoctor')
  const addBtn = $(selectors.addBtnId);
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof openModalFn === 'function') openModalFn('addDoctor');
      else if (typeof window.openModal === 'function') window.openModal('addDoctor');
      else {
        // fallback: show local modal element
        const modal = $(selectors.modalId);
        if (modal) modal.setAttribute('aria-hidden', 'false');
      }
    });
  }

  // wire submit button inside modal (if exists)
  const submitBtn = $(selectors.submitAddBtnId);
  if (submitBtn) submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    adminAddDoctor();
  });

  // wire cancel / close
  const cancelBtn = $(selectors.cancelAddBtnId);
  if (cancelBtn) cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const modal = $(selectors.modalId);
    if (modal) modal.setAttribute('aria-hidden', 'true');
  });
  const closeBtn = $(selectors.closeModalId);
  if (closeBtn) closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const modal = $(selectors.modalId);
    if (modal) modal.setAttribute('aria-hidden', 'true');
  });
  const backdrop = $(selectors.modalBackdropId);
  if (backdrop) backdrop.addEventListener('click', () => {
    const modal = $(selectors.modalId);
    if (modal) modal.setAttribute('aria-hidden', 'true');
  });

  // initial load of doctors
  loadDoctorCards();

  // attach search & filter listeners
  const searchEl = $(selectors.searchId);
  const specialtyEl = $(selectors.specialtyId);
  const timeSortEl = $(selectors.timeSortId);

  if (searchEl) searchEl.addEventListener('input', debounce(() => filterDoctorsOnChange(), 220));
  if (specialtyEl) specialtyEl.addEventListener('change', () => filterDoctorsOnChange());
  if (timeSortEl) timeSortEl.addEventListener('change', () => filterDoctorsOnChange());
});

// debounce utility
function debounce(fn, wait = 200) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

