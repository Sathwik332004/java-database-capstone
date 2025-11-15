
// js/components/doctorCard.js
import { showBookingOverlay } from "../loggedPatient.js";
import { deleteDoctor } from "../services/doctorServices.js"
import { getPatientData } from "../services/patientServices.js";

export function createDoctorCard(doctor) {
  const card = document.createElement("div");
  card.classList.add("doctor-card");
  const role = localStorage.getItem("userRole")
  // Doctor info container
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("doctor-info");

  const name = document.createElement("h3");
  name.textContent = `${doctor.name}`;

  const specialization = document.createElement("p");
  specialization.textContent = `Specialization: ${doctor.specialty}`;

  const email = document.createElement("p");
  email.textContent = `Email: ${doctor.email}`;

  const availability = document.createElement("p");
  availability.textContent = `Available: ${doctor.availableTimes.join(", ")}`;

  infoDiv.appendChild(name);
  infoDiv.appendChild(specialization);
  infoDiv.appendChild(email);
  infoDiv.appendChild(availability);

  // Card actions (button area)
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("card-actions");

  if (role === "admin") {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Delete";
  
    removeBtn.addEventListener("click", async () => {
      const confirmDelete = confirm(`Are you sure you want to delete ${doctor.name}?`);
      if (!confirmDelete) return;
  
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Admin token not found. Please log in again.");
        return;
      }
  
      const { success, message } = await deleteDoctor(doctor.id, token);
  
      if (success) {
        alert("Doctor deleted successfully");
        card.remove();
      } else {
        alert("Failed to delete doctor");
      }
    });
  
    actionsDiv.appendChild(removeBtn);
  }
  else if(role === 'patient'){
  const bookNow = document.createElement("button");
  bookNow.textContent = "Book Now";
  bookNow.addEventListener("click", () => {
    alert("Patient need to login first.")
  });
  actionsDiv.appendChild(bookNow);
  }
  else if(role === 'loggedPatient'){
    const bookNow = document.createElement("button");
    const token = localStorage.getItem("token")
    bookNow.textContent = "Book Now";
    bookNow.addEventListener("click",async (e) => {
      if(!token){
        alert("Login is required for booking appointment")
        localStorage.setItem("userRole", "patient")
        window.location.href = "/pages/patientDashboard.html"
      }
      const patientData = await getPatientData(token)
      if (!patientData) {
        alert("Failed to fetch patient details.");
        return;
      }
      showBookingOverlay(e, doctor, patientData);
    });
    actionsDiv.appendChild(bookNow);
  }
  // Assemble the card
  card.appendChild(infoDiv);
  card.appendChild(actionsDiv);

  return card;
}
