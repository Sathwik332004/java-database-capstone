/*
  Import getAllAppointments to fetch appointments from the backend
  Import createPatientRow to generate a table row for each patient appointment


  Get the table body where patient rows will be added
  Initialize selectedDate with today's date in 'YYYY-MM-DD' format
  Get the saved token from localStorage (used for authenticated API calls)
  Initialize patientName to null (used for filtering by name)


  Add an 'input' event listener to the search bar
  On each keystroke:
    - Trim and check the input value
    - If not empty, use it as the patientName for filtering
    - Else, reset patientName to "null" (as expected by backend)
    - Reload the appointments list with the updated filter


  Add a click listener to the "Today" button
  When clicked:
    - Set selectedDate to today's date
    - Update the date picker UI to match
    - Reload the appointments for today


  Add a change event listener to the date picker
  When the date changes:
    - Update selectedDate with the new value
    - Reload the appointments for that specific date


  Function: loadAppointments
  Purpose: Fetch and display appointments based on selected date and optional patient name

  Step 1: Call getAllAppointments with selectedDate, patientName, and token
  Step 2: Clear the table body content before rendering new rows

  Step 3: If no appointments are returned:
    - Display a message row: "No Appointments found for today."

  Step 4: If appointments exist:
    - Loop through each appointment and construct a 'patient' object with id, name, phone, and email
    - Call createPatientRow to generate a table row for the appointment
    - Append each row to the table body

  Step 5: Catch and handle any errors during fetch:
    - Show a message row: "Error loading appointments. Try again later."


  When the page is fully loaded (DOMContentLoaded):
    - Call renderContent() (assumes it sets up the UI layout)
    - Call loadAppointments() to display today's appointments by default
*/

// src/main/resources/static/js/doctorDashboard.js
// Doctor dashboard appointment loader per spec.

import { createPatientRow } from '/js/components/patientRows.js';

let getAllAppointmentsSvc = null;

// Try to import getAllAppointments from patientServices.js if available
(async function tryImport() {
  try {
    const mod = await import('/js/services/patientServices.js').catch(() => null);
    if (mod && typeof mod.getAllAppointments === 'function') getAllAppointmentsSvc = mod.getAllAppointments;
  } catch (e) {
    console.warn('patientServices import failed', e);
  }
})();

// Fallback HTTP call for appointments if a service isn't available
async function fallbackGetAllAppointments(date, patientName, token) {
  const base = (window.BASE_API_URL && window.BASE_API_URL.replace(/\/+$/, '')) || '/api';
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (patientName && patientName !== 'null') params.set('name', patientName);
  const url = `${base}/doctor/appointments${params.toString() ? ('?' + params.toString()) : ''}`;

  const headers = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(url, { method: 'GET', headers });
  if (!resp.ok) throw new Error(`Failed to fetch appointments: ${resp.status}`);
  const data = await resp.json();
  return Array.isArray(data) ? data : (data.content || []);
}

// choose service (prefers imported service)
const getAllAppointments = async (date, patientName, token) => {
  if (typeof getAllAppointmentsSvc === 'function') {
    return getAllAppointmentsSvc(date, patientName, token);
  }
  return fallbackGetAllAppointments(date, patientName, token);
};

// helpers
const $ = id => document.getElementById(id);
function formatTodayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function clearTableMessage(msg) {
  const tbody = $('patientTableBody');
  if (!tbody) return;
  tbody.innerHTML = `<tr class="noPatientRecord"><td colspan="6">${msg}</td></tr>`;
}

// state
let selectedDate = formatTodayYYYYMMDD();
let token = localStorage.getItem('token') || null;
let patientName = null; // when empty string, we use null for backend

// DOM elements (set during attachListeners)
let tbodyEl, searchEl, todayBtnEl, datePickerEl;

function attachListeners() {
  tbodyEl = $('patientTableBody');
  searchEl = $('searchBar');
  todayBtnEl = $('todayBtn');      // ensure your button has id="todayBtn"
  datePickerEl = $('datePicker');  // ensure your date input has id="datePicker"

  // Search input (debounced)
  if (searchEl) {
    searchEl.addEventListener('input', debounce(async (ev) => {
      const val = (ev.target.value || '').trim();
      patientName = val ? val : 'null';
      await loadAppointments();
    }, 300));
  }

  // Today button
  if (todayBtnEl) {
    todayBtnEl.addEventListener('click', async (ev) => {
      ev.preventDefault();
      selectedDate = formatTodayYYYYMMDD();
      if (datePickerEl) datePickerEl.value = selectedDate;
      await loadAppointments();
    });
  }

  // date picker change
  if (datePickerEl) {
    // initialize with today's date
    datePickerEl.value = selectedDate;
    datePickerEl.addEventListener('change', async (ev) => {
      selectedDate = ev.target.value || selectedDate;
      await loadAppointments();
    });
  }
}

// debouncer
function debounce(fn, wait = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait); };
}

/**
 * loadAppointments
 * Fetch and display appointments for selectedDate and optional patientName
 */
export async function loadAppointments() {
  const tbody = $('patientTableBody');
  if (!tbody) return;
  // show loading
  clearTableMessage('Loading appointments…');

  // refresh token (in case user logged in/out)
  token = localStorage.getItem('token') || null;

  try {
    const nameForApi = (patientName === null || patientName === '' || patientName === 'null') ? null : patientName;
    const appointments = await getAllAppointments(selectedDate, nameForApi, token);

    // clear
    tbody.innerHTML = '';

    if (!appointments || appointments.length === 0) {
      clearTableMessage('No Appointments found for the selected date.');
      return;
    }

    // For each appointment, normalize appointment -> patient fields and create a row
    for (const appt of appointments) {
      const patient = {
        id: appt.patientId ?? appt.patient?.id ?? appt.patient_id ?? appt.patient_id,
        name: appt.patientName ?? appt.patient?.name ?? appt.patient?.fullName ?? appt.patient?.full_name ?? 'Unknown',
        phone: appt.patientPhone ?? appt.patient?.phone ?? appt.patient?.contact ?? appt.phone ?? '',
        email: appt.patientEmail ?? appt.patient?.email ?? appt.patient?.contactEmail ?? '',
        nextAppointment: appt.appointmentTime ?? appt.appointment_time ?? appt.time ?? appt.date ?? ''
      };

      // create row using provided component; pass callbacks if needed
      const row = createPatientRow(patient, {
        onPrescribe: (p) => {
          // prefer modal if available on window
          if (typeof window.openModal === 'function') {
            window.openModal('prescription', { patient: p, appointment: appt });
          } else {
            // fallback navigate to prescription page
            const apptId = encodeURIComponent(appt.id ?? appt._id ?? '');
            window.location.href = `/doctor/patients/${encodeURIComponent(p.id)}/prescriptions/new?appointmentId=${apptId}`;
          }
        }
      });

      tbody.appendChild(row);
    }
  } catch (err) {
    console.error('Error loading appointments', err);
    clearTableMessage('Error loading appointments. Try again later.');
  }
}

// Render content helper (if provided elsewhere)
function tryRenderContent() {
  if (typeof window.renderContent === 'function') {
    try { window.renderContent(); } catch (e) { console.warn('renderContent failed', e); }
  }
}

// initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  attachListeners();

  // call renderContent if provided (per spec)
  tryRenderContent();

  // ensure date picker shows selectedDate
  const dp = $('datePicker');
  if (dp) dp.value = selectedDate;

  await loadAppointments();
});
