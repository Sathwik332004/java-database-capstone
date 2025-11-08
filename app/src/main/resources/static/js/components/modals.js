// modals.js
export function openModal(type) {
  let modalContent = '';
  if (type === 'addDoctor') {
    modalContent = `
         <h2>Add Doctor</h2>
         <input type="text" id="doctorName" placeholder="Doctor Name" class="input-field">
         <select id="specialization" class="input-field select-dropdown">
             <option value="">Specialization</option>
                        <option value="cardiologist">Cardiologist</option>
                        <option value="dermatologist">Dermatologist</option>
                        <option value="neurologist">Neurologist</option>
                        <option value="pediatrician">Pediatrician</option>
                        <option value="orthopedic">Orthopedic</option>
                        <option value="gynecologist">Gynecologist</option>
                        <option value="psychiatrist">Psychiatrist</option>
                        <option value="dentist">Dentist</option>
                        <option value="ophthalmologist">Ophthalmologist</option>
                        <option value="ent">ENT Specialist</option>
                        <option value="urologist">Urologist</option>
                        <option value="oncologist">Oncologist</option>
                        <option value="gastroenterologist">Gastroenterologist</option>
                        <option value="general">General Physician</option>

        </select>
        <input type="email" id="doctorEmail" placeholder="Email" class="input-field">
        <input type="password" id="doctorPassword" placeholder="Password" class="input-field">
        <input type="text" id="doctorPhone" placeholder="Mobile No." class="input-field">
        <div class="availability-container">
        <label class="availabilityLabel">Select Availability:</label>
          <div class="checkbox-group">
              <label><input type="checkbox" name="availability" value="09:00-10:00"> 9:00 AM - 10:00 AM</label>
              <label><input type="checkbox" name="availability" value="10:00-11:00"> 10:00 AM - 11:00 AM</label>
              <label><input type="checkbox" name="availability" value="11:00-12:00"> 11:00 AM - 12:00 PM</label>
              <label><input type="checkbox" name="availability" value="12:00-13:00"> 12:00 PM - 1:00 PM</label>
          </div>
        </div>
        <button class="dashboard-btn" id="saveDoctorBtn">Save</button>
      `;
  } else if (type === 'patientLogin') {
    modalContent = `
        <h2>Patient Login</h2>
        <input type="text" id="email" placeholder="Email" class="input-field">
        <input type="password" id="password" placeholder="Password" class="input-field">
        <button class="dashboard-btn" id="loginBtn">Login</button>
      `;
  }
  else if (type === "patientSignup") {
    modalContent = `
      <h2>Patient Signup</h2>
      <input type="text" id="name" placeholder="Name" class="input-field">
      <input type="email" id="email" placeholder="Email" class="input-field">
      <input type="password" id="password" placeholder="Password" class="input-field">
      <input type="text" id="phone" placeholder="Phone" class="input-field">
      <input type="text" id="address" placeholder="Address" class="input-field">
      <button class="dashboard-btn" id="signupBtn">Signup</button>
    `;

  } else if (type === 'adminLogin') {
    modalContent = `
        <h2>Admin Login</h2>
        <input type="text" id="username" name="username" placeholder="Username" class="input-field">
        <input type="password" id="password" name="password" placeholder="Password" class="input-field">
        <button class="dashboard-btn" id="adminLoginBtn" >Login</button>
      `;
  } else if (type === 'doctorLogin') {
    modalContent = `
        <h2>Doctor Login</h2>
        <input type="text" id="email" placeholder="Email" class="input-field">
        <input type="password" id="password" placeholder="Password" class="input-field">
        <button class="dashboard-btn" id="doctorLoginBtn" >Login</button>
      `;
  }

  document.getElementById('modal-body').innerHTML = modalContent;
  document.getElementById('modal').style.display = 'block';

  document.getElementById('closeModal').onclick = () => {
    document.getElementById('modal').style.display = 'none';
  };

  if (type === "patientSignup") {
    document.getElementById("signupBtn").addEventListener("click", signupPatient);
  }

  if (type === "patientLogin") {
    document.getElementById("loginBtn").addEventListener("click", loginPatient);
  }

  if (type === 'addDoctor') {
    document.getElementById('saveDoctorBtn').addEventListener('click', adminAddDoctor);
  }

  if (type === 'adminLogin') {
    document.getElementById('adminLoginBtn').addEventListener('click', adminLoginHandler);
  }

  if (type === 'doctorLogin') {
    document.getElementById('doctorLoginBtn').addEventListener('click', doctorLoginHandler);
  }
}
// modals.js
// Simple booking modal (bottom pop-up) and helper to open/close it.
// Usage:
// import { openBookingModal, closeBookingModal } from '/js/components/modals.js';
// openBookingModal({ doctor, onConfirm: (payload)=>{...} });

let modalEl = null;

function createModalDom() {
  if (modalEl) return modalEl;

  modalEl = document.createElement('div');
  modalEl.className = 'modalApp';
  modalEl.setAttribute('aria-hidden', 'true');
  modalEl.innerHTML = `
    <div class="handle" aria-hidden="true"></div>
    <div class="modal-body">
      <div style="text-align:center">
        <h3 id="mDoctorName" style="margin:0 0 6px 0"></h3>
        <div id="mDoctorSpec" style="color:#6b7178;margin-bottom:4px"></div>
      </div>

      <label style="text-align:center;font-weight:700;color:#333">Select Slot</label>
      <select id="mSlotSelect" style="display:block"></select>

      <label style="font-weight:700">Your Notes (optional)</label>
      <textarea id="mPatientNotes" placeholder="Symptoms / notes..."></textarea>

      <button class="confirm-btn" id="mConfirmBtn">Confirm Booking</button>
    </div>
  `;
  document.body.appendChild(modalEl);

  // click outside to close (touch friendly)
  document.addEventListener('click', (e) => {
    if (!modalEl) return;
    if (!modalEl.classList.contains('active')) return;
    // if click is outside modalEl and not on book button, close
    if (!modalEl.contains(e.target) && !e.target.closest('.book-btn')) {
      closeBookingModal();
    }
  });

  return modalEl;
}

export function openBookingModal({ doctor = {}, onConfirm = null } = {}) {
  const dom = createModalDom();
  dom.setAttribute('aria-hidden', 'false');
  dom.classList.add('active');

  // populate
  const name = document.getElementById('mDoctorName');
  const spec = document.getElementById('mDoctorSpec');
  const slotSelect = document.getElementById('mSlotSelect');
  const notes = document.getElementById('mPatientNotes');
  const confirmBtn = document.getElementById('mConfirmBtn');

  name.textContent = doctor.fullName || doctor.name || 'Doctor';
  spec.textContent = doctor.specialization || doctor.specialty || '';

  // fill slots
  slotSelect.innerHTML = '';
  const slots = Array.isArray(doctor.availableTimes) ? doctor.availableTimes : (doctor.available_times || doctor.slots || []);
  if (!slots || slots.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No available slots';
    slotSelect.appendChild(opt);
    slotSelect.disabled = true;
    confirmBtn.disabled = true;
  } else {
    slotSelect.disabled = false;
    confirmBtn.disabled = false;
    slots.forEach(s => {
      const o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      slotSelect.appendChild(o);
    });
  }

  // attach confirm handler
  function handler() {
    const selectedSlot = slotSelect.value;
    const noteText = notes.value.trim();
    // small UI ripple effect
    createRipple(window.innerWidth/2, window.innerHeight/2);
    // call provided onConfirm
    if (typeof onConfirm === 'function') {
      onConfirm({ doctor, slot: selectedSlot, notes: noteText });
    }
    closeBookingModal();
  }

  confirmBtn.onclick = handler;
}

export function closeBookingModal() {
  if (!modalEl) return;
  modalEl.classList.remove('active');
  modalEl.setAttribute('aria-hidden', 'true');
  // clear fields
  const notes = document.getElementById('mPatientNotes');
  if (notes) notes.value = '';
  const slotSelect = document.getElementById('mSlotSelect');
  if (slotSelect) slotSelect.innerHTML = '';
}

/* ripple helper */
function createRipple(x,y) {
  const r = document.createElement('div');
  r.className = 'ripple';
  r.style.left = `${x}px`;
  r.style.top = `${y}px`;
  document.body.appendChild(r);
  setTimeout(()=> r.remove(), 700);
}

// export default convenience
export default { openBookingModal, closeBookingModal };

