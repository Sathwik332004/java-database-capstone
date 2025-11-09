/*
  Import the base API URL from the config file
  Define a constant DOCTOR_API to hold the full endpoint for doctor-related actions


  Function: getDoctors
  Purpose: Fetch the list of all doctors from the API

   Use fetch() to send a GET request to the DOCTOR_API endpoint
   Convert the response to JSON
   Return the 'doctors' array from the response
   If there's an error (e.g., network issue), log it and return an empty array


  Function: deleteDoctor
  Purpose: Delete a specific doctor using their ID and an authentication token

   Use fetch() with the DELETE method
    - The URL includes the doctor ID and token as path parameters
   Convert the response to JSON
   Return an object with:
    - success: true if deletion was successful
    - message: message from the server
   If an error occurs, log it and return a default failure response


  Function: saveDoctor
  Purpose: Save (create) a new doctor using a POST request

   Use fetch() with the POST method
    - URL includes the token in the path
    - Set headers to specify JSON content type
    - Convert the doctor object to JSON in the request body

   Parse the JSON response and return:
    - success: whether the request succeeded
    - message: from the server

   Catch and log errors
    - Return a failure response if an error occurs


  Function: filterDoctors
  Purpose: Fetch doctors based on filtering criteria (name, time, and specialty)

   Use fetch() with the GET method
    - Include the name, time, and specialty as URL path parameters
   Check if the response is OK
    - If yes, parse and return the doctor data
    - If no, log the error and return an object with an empty 'doctors' array

   Catch any other errors, alert the user, and return a default empty result
*/

// doctorServices.js
// Service layer for doctor-related API calls
// Location: app/src/main/resources/static/js/services/doctorServices.js

// Import base URL from central config (as requested)
import { API_BASE_URL } from "../config/config.js";

// Base endpoint for doctor-related routes
const DOCTOR_API = API_BASE_URL.replace(/\/+$/, "") + "/doctor";

/**
 * Helper: build full URL for a doctor sub-path
 * @param {string} path (e.g. '/list' or '/{id}')
 */
function buildUrl(path = "") {
  if (!path) return DOCTOR_API;
  if (path.startsWith("/")) path = path.slice(1);
  return `${DOCTOR_API}/${path}`;
}

/**
 * getDoctors()
 * Fetch all doctors from the backend.
 * Returns: Array of doctor objects (or [] on error)
 */
export async function getDoctors() {
  try {
    const res = await fetch(buildUrl(""), {
      method: "GET",
      headers: { "Accept": "application/json" },
      credentials: "same-origin"
    });

    if (!res.ok) {
      console.warn("getDoctors: non-OK response", res.status);
      return [];
    }

    const data = await res.json();
    // Backend might return an array or a wrapper like { content: [...] }
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    if (data && Array.isArray(data.doctors)) return data.doctors;
    // Unknown shape: return empty array safely
    return [];
  } catch (error) {
    console.error("getDoctors error:", error);
    return [];
  }
}

/**
 * deleteDoctor(id, token)
 * Deletes a doctor by id. Admin only.
 * Returns: { success: boolean, message: string, data?: any }
 */
export async function deleteDoctor(id, token = null) {
  try {
    if (!id) return { success: false, message: "Missing doctor id" };

    const url = buildUrl(encodeURIComponent(id));
    const headers = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers,
      credentials: "same-origin"
    });

    // try to parse response body if present
    let body = null;
    try { body = await res.json(); } catch (e) { body = null; }

    if (!res.ok) {
      const msg = (body && (body.message || JSON.stringify(body))) || `Delete failed (${res.status})`;
      return { success: false, message: msg, data: body };
    }

    return { success: true, message: (body && (body.message || "Deleted")) || "Deleted", data: body };
  } catch (error) {
    console.error("deleteDoctor error:", error);
    return { success: false, message: error.message || "Delete failed" };
  }
}

/**
 * saveDoctor(doctorObj, token)
 * Creates a new doctor record (admin-only).
 * doctorObj should contain the necessary doctor fields.
 * Returns: { success: boolean, message: string, data?: any }
 */
export async function saveDoctor(doctorObj = {}, token = null) {
  try {
    if (!doctorObj || typeof doctorObj !== "object") {
      return { success: false, message: "Invalid doctor data" };
    }

    const url = buildUrl("");
    const headers = { "Accept": "application/json", "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(doctorObj),
      credentials: "same-origin"
    });

    let body = null;
    try { body = await res.json(); } catch (e) { body = null; }

    if (!res.ok) {
      const msg = (body && (body.message || JSON.stringify(body))) || `Save failed (${res.status})`;
      return { success: false, message: msg, data: body };
    }

    return { success: true, message: (body && (body.message || "Saved")) || "Saved", data: body };
  } catch (error) {
    console.error("saveDoctor error:", error);
    return { success: false, message: error.message || "Save failed" };
  }
}

/**
 * filterDoctors(name, time, specialty)
 * Retrieve doctors matching filters.
 * - name: string or null
 * - time: string (e.g., "AM" or "PM") or null
 * - specialty: string or null
 *
 * Returns: Array of matching doctors (or [] if none / on error)
 */
export async function filterDoctors(name = null, time = null, specialty = null) {
  try {
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (time) params.append("time", time);
    if (specialty) params.append("specialty", specialty);

    const query = params.toString();
    const url = query ? `${buildUrl("")}?${query}` : buildUrl("");

    const res = await fetch(url, {
      method: "GET",
      headers: { "Accept": "application/json" },
      credentials: "same-origin"
    });

    if (!res.ok) {
      console.warn("filterDoctors: non-OK response", res.status);
      return [];
    }

    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    if (data && Array.isArray(data.doctors)) return data.doctors;
    // If response shape is { doctors: [...] } return that. Otherwise return empty array.
    return [];
  } catch (error) {
    console.error("filterDoctors error:", error);
    return [];
  }
}

// Default export (optional)
export default {
  getDoctors,
  deleteDoctor,
  saveDoctor,
  filterDoctors
};

