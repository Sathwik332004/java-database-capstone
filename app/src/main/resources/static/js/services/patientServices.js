// patientServices.js
// Location: app/src/main/resources/static/js/services/patientServices.js
// Centralized patient-related API calls

import { API_BASE_URL } from "../config/config.js";

const PATIENT_API = API_BASE_URL.replace(/\/+$/, "") + "/patient";

/**
 * patientSignup(data)
 * - data: { name, email, password, phone, address, ... }
 * - returns: { success: boolean, message: string, data?: any }
 */
export async function patientSignup(data) {
  try {
    const res = await fetch(`${PATIENT_API}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(data),
      credentials: "same-origin"
    });

    // try parse response body
    let body = null;
    try { body = await res.json(); } catch (e) { body = null; }

    if (!res.ok) {
      const msg = (body && (body.message || JSON.stringify(body))) || `Signup failed (${res.status})`;
      return { success: false, message: msg, data: body };
    }

    return { success: true, message: (body && (body.message || "Signup successful")) || "Signup successful", data: body };
  } catch (error) {
    console.error("patientSignup error:", error);
    return { success: false, message: error?.message || "Network error" };
  }
}

/**
 * patientLogin(credentials)
 * - credentials: { email, password }
 * - NOTE: returns the raw fetch Response so existing UI code that expects response.ok & response.json() continues to work.
 * - If you'd like parsed return, use patientLoginParsed() (not provided unless requested).
 */
export async function patientLogin(credentials) {
  try {
    // keep same behaviour as your current frontend which expects a Response
    return await fetch(`${PATIENT_API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(credentials),
      credentials: "same-origin"
    });
  } catch (error) {
    console.error("patientLogin error:", error);
    // rethrow so UI code can catch if it wants, or return a rejected promise
    throw error;
  }
}

/**
 * getPatientData(token)
 * - Tries to get the logged-in patient's information.
 * - Preferred way: token provided in Authorization header and endpoint GET /patient/me
 * - Fallbacks: GET /patient/{token} (older style) if /me fails or token passed in URL by legacy APIs.
 * - returns: patient object | null
 */
export async function getPatientData(token = null) {
  try {
    // Preferred: use Authorization header and /me route
    if (token) {
      try {
        const res = await fetch(`${PATIENT_API}/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          credentials: "same-origin"
        });

        if (res.ok) {
          const body = await res.json();
          // backend may return { patient: {...} } or just patient object
          return body?.patient ?? body ?? null;
        }
        // if /me fails, fall through to legacy attempt
      } catch (err) {
        console.warn("getPatientData /me failed, trying fallback:", err);
        // continue to fallback
      }
    }

    // Fallback legacy behavior: token used in path (if that is how the backend is implemented)
    if (token) {
      try {
        const res2 = await fetch(`${PATIENT_API}/${encodeURIComponent(token)}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "same-origin"
        });
        if (res2.ok) {
          const b2 = await res2.json();
          return b2?.patient ?? b2 ?? null;
        }
      } catch (e) {
        console.warn("getPatientData fallback failed:", e);
      }
    }

    // If no token provided or everything failed, return null
    return null;
  } catch (error) {
    console.error("getPatientData error:", error);
    return null;
  }
}

/**
 * getPatientAppointments(id, token, user)
 * - id: patient id (string/number)
 * - token: optional auth token (preferred to send in Authorization header)
 * - user: "patient" or "doctor" (used by API to determine which view to return)
 * - returns: Array of appointments | null
 *
 * The function tries a modern API shape first, then attempts legacy shapes.
 */
export async function getPatientAppointments(id, token = null, user = "patient") {
  try {
    if (!id) return null;

    // Preferred endpoint: GET /patient/{id}/appointments?user=...
    const preferredUrl = `${PATIENT_API}/${encodeURIComponent(id)}/appointments?user=${encodeURIComponent(user)}`;

    try {
      const headers = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(preferredUrl, {
        method: "GET",
        headers,
        credentials: "same-origin"
      });

      if (res.ok) {
        const body = await res.json();
        // support body.appointments or body.content or direct array
        if (Array.isArray(body)) return body;
        if (Array.isArray(body.appointments)) return body.appointments;
        if (Array.isArray(body.content)) return body.content;
        // fallback: return whatever the API sent
        return body ?? null;
      }
      // else continue to fallback
    } catch (e) {
      console.warn("preferred getPatientAppointments failed, trying legacy:", e);
    }

    // Legacy endpoint from your examples: GET /patient/{id}/{user}/{token}
    try {
      if (token) {
        const legacyUrl = `${PATIENT_API}/${encodeURIComponent(id)}/${encodeURIComponent(user)}/${encodeURIComponent(token)}`;
        const res2 = await fetch(legacyUrl, {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "same-origin"
        });
        if (res2.ok) {
          const body2 = await res2.json();
          if (Array.isArray(body2)) return body2;
          if (Array.isArray(body2.appointments)) return body2.appointments;
          if (Array.isArray(body2.content)) return body2.content;
          return body2 ?? null;
        }
      }
    } catch (e2) {
      console.warn("legacy getPatientAppointments failed:", e2);
    }

    // nothing worked:
    return null;
  } catch (error) {
    console.error("getPatientAppointments error:", error);
    return null;
  }
}

/**
 * filterAppointments(condition, name, token)
 * - condition: e.g., "pending", "consulted", etc.
 * - name: patient name or search string (optional)
 * - token: authentication token (optional)
 * - returns: array of appointments or { appointments: [] } (keeps some compatibility)
 */
export async function filterAppointments(condition = "", name = "", token = null) {
  try {
    // Preferred query-style endpoint:
    const params = new URLSearchParams();
    if (condition) params.append("condition", condition);
    if (name) params.append("name", name);
    const url = `${PATIENT_API}/filter${params.toString() ? ("?" + params.toString()) : ""}`;

    const headers = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
      method: "GET",
      headers,
      credentials: "same-origin"
    });

    if (res.ok) {
      const body = await res.json();
      // try several shapes
      if (Array.isArray(body)) return body;
      if (body && Array.isArray(body.appointments)) return body.appointments;
      if (body && Array.isArray(body.content)) return body.content;
      // fallback: return object with appointments key for compatibility
      return body ?? { appointments: [] };
    }

    // Legacy path: /patient/filter/{condition}/{name}/{token}
    try {
      if (token) {
        const legacyUrl = `${PATIENT_API}/filter/${encodeURIComponent(condition || "")}/${encodeURIComponent(name || "")}/${encodeURIComponent(token)}`;
        const res2 = await fetch(legacyUrl, {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "same-origin"
        });
        if (res2.ok) {
          const b2 = await res2.json();
          if (Array.isArray(b2)) return b2;
          if (b2 && Array.isArray(b2.appointments)) return b2.appointments;
          return b2 ?? { appointments: [] };
        }
      }
    } catch (legacyErr) {
      console.warn("filterAppointments legacy call failed:", legacyErr);
    }

    // If we reach here, return empty result
    return { appointments: [] };
  } catch (error) {
    console.error("filterAppointments error:", error);
    // Show a safe return shape expected by calling code
    return { appointments: [] };
  }
}

// default export for convenience (optional)
export default {
  patientSignup,
  patientLogin,
  getPatientData,
  getPatientAppointments,
  filterAppointments
};
