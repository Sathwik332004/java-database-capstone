# User Stories – Smart Clinic Management System

This document includes user stories for all three primary roles in the system: **Admin**, **Patient**, and **Doctor**.

---

## 👨‍💼 Admin User Stories

---

### Title:
_As an admin, I want to log into the portal with my username and password, so that I can manage the platform securely._

**Acceptance Criteria:**
1. Admin can access the login page.
2. Admin must provide valid credentials.
3. System redirects to dashboard on success.

**Priority:** High  
**Story Points:** 2  
**Notes:**  
- Show error for invalid credentials  
- Use JWT for authentication  

---

### Title:
_As an admin, I want to log out of the portal, so that I can ensure the system remains protected from unauthorized access._

**Acceptance Criteria:**
1. Admin can click logout.
2. Session/token is cleared.
3. Redirect to login screen.

**Priority:** High  
**Story Points:** 1  
**Notes:**  
- Show logout confirmation  

---

### Title:
_As an admin, I want to add doctors to the portal, so that new healthcare providers can access the system._

**Acceptance Criteria:**
1. Admin can enter doctor info.
2. Record is created in MySQL.
3. Doctor appears in management list.

**Priority:** High  
**Story Points:** 3  
**Notes:**  
- Validate email and fields  
- Assign doctor role automatically  

---

### Title:
_As an admin, I want to delete a doctor’s profile from the portal, so that I can remove inactive or incorrect accounts._

**Acceptance Criteria:**
1. Admin selects a doctor to delete.
2. Confirmation dialog appears.
3. Doctor is removed from DB.

**Priority:** Medium  
**Story Points:** 2  
**Notes:**  
- Prevent accidental deletions  
- Handle cascading constraints  

---

### Title:
_As an admin, I want to run a stored procedure in the MySQL CLI to get appointment stats, so that I can track usage._

**Acceptance Criteria:**
1. Procedure returns monthly counts.
2. Admin executes via CLI or backend.
3. Output shows summary stats.

**Priority:** Medium  
**Story Points:** 2  
**Notes:**  
- Optional: expose result in dashboard  

---

## 🧑‍💻 Patient User Stories

---

### Title:
_As a patient, I want to view a list of doctors without logging in, so that I can explore available options before registering._

**Acceptance Criteria:**
1. Public doctor list is visible.
2. Displays name, specialty, availability.
3. Booking hidden until login.

**Priority:** High  
**Story Points:** 2  
**Notes:**  
- Cache public doctor data  

---

### Title:
_As a patient, I want to sign up using my email and password, so that I can book appointments._

**Acceptance Criteria:**
1. Registration form with validations.
2. On success, redirect to login.
3. Account saved in database.

**Priority:** High  
**Story Points:** 2  
**Notes:**  
- Use BCrypt for password encryption  

---

### Title:
_As a patient, I want to log into the portal, so that I can manage my bookings._

**Acceptance Criteria:**
1. Patient logs in with email/password.
2. JWT token issued on success.
3. Redirected to dashboard.

**Priority:** High  
**Story Points:** 2  
**Notes:**  
- Use role-based redirection  

---

### Title:
_As a patient, I want to log out of the portal, so that I can secure my account._

**Acceptance Criteria:**
1. Logout button clears JWT.
2. Redirect to homepage.
3. Session ends securely.

**Priority:** Medium  
**Story Points:** 1  
**Notes:**  
- Show logout message  

---

### Title:
_As a patient, I want to book an hour-long appointment, so that I can consult with a doctor._

**Acceptance Criteria:**
1. Patient must be logged in.
2. Booking form captures date, time, doctor.
3. 60-minute slot is reserved.

**Priority:** High  
**Story Points:** 3  
**Notes:**  
- Prevent double booking  

---

### Title:
_As a patient, I want to view my upcoming appointments, so that I can prepare accordingly._

**Acceptance Criteria:**
1. List of future appointments shown.
2. Includes doctor name, time, date.
3. Sorted by closest date.

**Priority:** Medium  
**Story Points:** 2  
**Notes:**  
- Pagination for more than 5 results  

---

## 🩺 Doctor User Stories

---

### Title:
_As a doctor, I want to log into the portal, so that I can manage my appointments._

**Acceptance Criteria:**
1. Login form accepts credentials.
2. JWT token is issued.
3. Redirect to doctor dashboard.

**Priority:** High  
**Story Points:** 2  
**Notes:**  
- Secure with role-based auth  

---

### Title:
_As a doctor, I want to log out of the portal, so that I can protect my personal and patient data._

**Acceptance Criteria:**
1. Logout button clears token.
2. Redirect to login screen.
3. Session ends.

**Priority:** Medium  
**Story Points:** 1  
**Notes:**  
- Optional: invalidate token server-side  

---

### Title:
_As a doctor, I want to view my appointment calendar, so that I can stay organized._

**Acceptance Criteria:**
1. Calendar UI shows upcoming bookings.
2. Appointments grouped by date.
3. Can click to view patient details.

**Priority:** High  
**Story Points:** 3  
**Notes:**  
- Show today's appointments first  

---

### Title:
_As a doctor, I want to mark my unavailability, so that patients only see available slots._

**Acceptance Criteria:**
1. Doctor can mark unavailable time blocks.
2. These times hidden from patient UI.
3. Can update or delete blocks.

**Priority:** High  
**Story Points:** 3  
**Notes:**  
- Prevent overlaps with existing bookings  

---

### Title:
_As a doctor, I want to update my profile, so that patients have up-to-date contact and specialization info._

**Acceptance Criteria:**
1. Editable profile page available.
2. Fields include specialization, phone, etc.
3. Info is saved and shown in public view.

**Priority:** Medium  
**Story Points:** 2  
**Notes:**  
- Email/username non-editable  

---

### Title:
_As a doctor, I want to view patient details for upcoming appointments, so that I can be prepared._

**Acceptance Criteria:**
1. List shows name, reason, history.
2. History shown upon click or modal.
3. Info fetched securely.

**Priority:** High  
**Story Points:** 3  
**Notes:**  
- Only show data for doctor’s patients  

---

