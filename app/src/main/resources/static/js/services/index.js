import { openModal } from "../components/modals.js";
import { API_BASE_URL } from "../config/config.js";
const ADMIN_API =  API_BASE_URL + '/admin';
const DOCTOR_API = API_BASE_URL + '/doctor/login'
window.onload = function () {
  const adminBtn = document.getElementById('adminLogin');
  const doctorBtn = document.getElementById('doctorLogin');

  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      openModal('adminLogin');
    });
  }

  if (doctorBtn) {
    doctorBtn.addEventListener('click', () => {
      openModal('doctorLogin');
    });
  }
};

  window.adminLoginHandler = async function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    const admin = { username, password };
  
    try {
      const response = await fetch(ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admin)
      });
  
      if (response.ok) {
        const result = await response.json();
        localStorage.setItem('token', result.token )
        selectRole('admin');
      } else {
        alert('Invalid credentials!');
      }
    } catch (error) {
      alert('Something went wrong!');
    }
  };

  window.doctorLoginHandler = async function () {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const doctor = { email, password };
  
    try {
      const response = await fetch(DOCTOR_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctor)
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log(result);
        localStorage.setItem('token', result.token )
        selectRole('doctor');
      } else {
        alert('Invalid credentials!');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Something went wrong!');
    }
  };