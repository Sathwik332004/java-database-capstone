/*
Import the overlay function for booking appointments from loggedPatient.js

  Import the deleteDoctor API function to remove doctors (admin role) from docotrServices.js

  Import function to fetch patient details (used during booking) from patientServices.js

  Function to create and return a DOM element for a single doctor card
    Create the main container for the doctor card
    Retrieve the current user role from localStorage
    Create a div to hold doctor information
    Create and set the doctor’s name
    Create and set the doctor's specialization
    Create and set the doctor's email
    Create and list available appointment times
    Append all info elements to the doctor info container
    Create a container for card action buttons
    === ADMIN ROLE ACTIONS ===
      Create a delete button
      Add click handler for delete button
     Get the admin token from localStorage
        Call API to delete the doctor
        Show result and remove card if successful
      Add delete button to actions container
   
    === PATIENT (NOT LOGGED-IN) ROLE ACTIONS ===
      Create a book now button
      Alert patient to log in before booking
      Add button to actions container
  
    === LOGGED-IN PATIENT ROLE ACTIONS === 
      Create a book now button
      Handle booking logic for logged-in patient   
        Redirect if token not available
        Fetch patient data with token
        Show booking overlay UI with doctor and patient info
      Add button to actions container
   
  Append doctor info and action buttons to the car
  Return the complete doctor card element
*/

// doctorCard.js
// This module exports a reusable function that creates a doctor card element
// used in both Admin and Patient dashboards.
// The content and actions depend on the user's role stored in localStorage.

import { deleteDoctor } from "../services/doctorServices.js";
import { getPatientData } from "../services/patientServices.js";
import { openModal } from "./modals.js"; // For booking overlay/modal

// Named export
export function createDoctorCard(doctor) {
  // Create the main card container
  const card = document.createElement("div");
  card.classList.add("doctor-card");

  // Get user role from localStorage
  const role = localStorage.getItem("userRole");

  // === Doctor Info Section ===
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("doctor-info");

  // Doctor Name
  const name = document.createElement("h3");
  name.textContent = doctor.name || "Unknown Doctor";

  // Doctor Specialty
  const specialization = document.createElement("p");
  specialization.textContent = `Specialty: ${doctor.specialty || "General"}`;

  // Doctor Email
  const email = document.createElement("p");
  email.textContent = `Email: ${doctor.email || "N/A"}`;

  // Availability
  const availability = document.createElement("p");
  if (Array.isArray(doctor.availableTimes) && doctor.availableTimes.length > 0) {
    availability.textContent = `Available: ${doctor.availableTimes.join(", ")}`;
  } else {
    availability.textContent = "Available: Not specified";
  }

  // Append info to infoDiv
  infoDiv.appendChild(name);
  infoDiv.appendChild(specialization);
  infoDiv.appendChild(email);
  infoDiv.appendChild(availability);

  // === Actions Section ===
  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("card-actions");

  // ADMIN ROLE: can delete doctor
  if (role === "admin") {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Delete";
    removeBtn.classList.add("adminBtn");

    removeBtn.addEventListener("click", async () => {
      const confirmDelete = confirm(
        `Are you sure you want to delete Dr. ${doctor.name}?`
      );
      if (!confirmDelete) return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("No authorization token found. Please log in again.");
        return;
      }

      try {
        const response = await deleteDoctor(doctor.id, token);
        if (response.success) {
          alert(`✅ Doctor ${doctor.name} deleted successfully.`);
          card.remove(); // remove card from UI
        } else {
          alert(`❌ Failed to delete: ${response.message || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error deleting doctor:", error);
        alert("❌ Error occurred while deleting doctor.");
      }
    });

    actionsDiv.appendChild(removeBtn);
  }

  // PATIENT ROLE (not logged in): show Book Now alert
  else if (role === "patient") {
    const bookNow = document.createElement("button");
    bookNow.textContent = "Book Now";
    bookNow.classList.add("book-btn");
    bookNow.addEventListener("click", () => {
      alert("⚠️ Please log in first to book an appointment.");
    });
    actionsDiv.appendChild(bookNow);
  }

  // LOGGED-IN PATIENT ROLE: allow booking
  else if (role === "loggedPatient") {
    const bookNow = document.createElement("button");
    bookNow.textContent = "Book Now";
    bookNow.classList.add("book-btn");

    bookNow.addEventListener("click", async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("userRole");
        window.location.href = "/";
        return;
      }

      try {
        // Fetch patient details
        const patientData = await getPatientData(token);
        if (!patientData) {
          alert("⚠️ Could not fetch patient details. Please try again.");
          return;
        }

        // Open booking overlay/modal with patient & doctor info
        openModal("bookAppointment", { doctor, patient: patientData });
      } catch (error) {
        console.error("Error fetching patient data or opening booking:", error);
        alert("❌ Error loading booking interface. Please try again.");
      }
    });

    actionsDiv.appendChild(bookNow);
  }

  // Default fallback (no role or unknown)
  else {
    const info = document.createElement("p");
    info.textContent = "Role not recognized. Please log in.";
    info.style.color = "gray";
    actionsDiv.appendChild(info);
  }

  // === Assemble the card ===
  card.appendChild(infoDiv);
  card.appendChild(actionsDiv);

  return card;
}


