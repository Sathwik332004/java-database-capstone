## MySQL Database Design

This Section defines the MongoDB schema for storing **prescriptions**, which complements the MySQL relational schema used for appointments, doctors, and patients. Since prescriptions often involve unstructured and evolving data like medications, notes, and dosage schedules, MongoDB is a natural fit.

---

### Table: patients

- id: INT, Primary Key, Auto Increment  
  *→ Uniquely identifies each patient*  
- full_name: VARCHAR(100), Not Null  
  *→ Patient’s name*  
- email: VARCHAR(100), Not Null, Unique  
  *→ Unique email for login/notifications*  
- phone: VARCHAR(15), Not Null  
  *→ For appointment reminders, format validated in code*  
- gender: ENUM('Male', 'Female', 'Other'), Not Null  
  *→ To support inclusivity and structured data*  
- date_of_birth: DATE, Not Null  
  *→ Used for age calculations and medical context*  
- address: TEXT  
  *→ Optional field for patient address*  
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP  
  *→ Automatically records when the record was created*

---

### Table: doctors

- id: INT, Primary Key, Auto Increment  
  *→ Unique ID for each doctor*  
- full_name: VARCHAR(100), Not Null  
  *→ Doctor’s full name*  
- email: VARCHAR(100), Not Null, Unique  
  *→ Used for communication/login*  
- phone: VARCHAR(15), Not Null  
  *→ Doctor’s contact info, format validated via code*  
- specialization: VARCHAR(100), Not Null  
  *→ Helps patients filter doctors by type*  
- experience_years: INT  
  *→ Optional field to show doctor’s experience*  
- clinic_location: VARCHAR(150)  
  *→ Can be used for future scalability (multi-clinic)*  
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP  
  *→ Auto-capture of creation date*

---

### Table: appointments

- id: INT, Primary Key, Auto Increment  
  *→ Unique appointment ID*  
- doctor_id: INT, Foreign Key → doctors(id)  
  *→ Links appointment to a doctor*  
- patient_id: INT, Foreign Key → patients(id)  
  *→ Links appointment to a patient*  
- appointment_time: DATETIME, Not Null  
  *→ When the appointment takes place*  
- duration_minutes: INT, Default 60  
  *→ Default to 1-hour appointments*  
- reason: TEXT  
  *→ Reason for consultation (optional)*  
- status: INT, Default 0  
  *→ 0 = Scheduled, 1 = Completed, 2 = Cancelled*  
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP  
  *→ Tracks when appointment was booked*  

**Constraints:**  
- ON DELETE CASCADE for both doctor and patient  
  *→ Deletes appointment if doctor/patient is removed*  
- Doctor’s schedule overlap must be prevented by backend logic  
  *→ Schema won't block overlaps, enforce it via code*

---

### Table: payments

- id: INT, Primary Key, Auto Increment  
  *→ Unique transaction ID*  
- appointment_id: INT, Foreign Key → appointments(id), Not Null  
  *→ Each payment is tied to one appointment*  
- patient_id: INT, Foreign Key → patients(id), Not Null  
  *→ Helps retrieve payment history by patient*  
- amount: DECIMAL(10,2), Not Null  
  *→ Total amount paid (e.g., ₹1200.00)*  
- payment_method: ENUM('CARD', 'UPI', 'CASH', 'INSURANCE'), Not Null  
  *→ Supports multiple payment types*  
- status: ENUM('PAID', 'FAILED', 'PENDING'), Default 'PAID'  
  *→ Tracks payment success or failure*  
- payment_date: DATETIME, Default CURRENT_TIMESTAMP  
  *→ Timestamp of payment completion*

**Constraints:**  
- ON DELETE CASCADE for `appointment_id` and `patient_id`  
- Optional: add transaction ID, refund tracking later

---

### Table: admins

- id: INT, Primary Key, Auto Increment  
  *→ Unique admin ID*  
- username: VARCHAR(50), Not Null, Unique  
  *→ Used for login (short name preferred)*  
- email: VARCHAR(100), Not Null, Unique  
  *→ Used for admin notifications*  
- password: VARCHAR(255), Not Null  
  *→ Encrypted (BCrypt) password for login*  
- created_at: TIMESTAMP, Default CURRENT_TIMESTAMP  
  *→ Tracks admin creation*

**Notes:**  
- Only a few users have admin privileges  
- Use JWT tokens for admin sessions

---

### Table: clinic_locations (Optional)

- id: INT, Primary Key, Auto Increment  
  *→ Unique clinic location*  
- name: VARCHAR(100), Not Null  
  *→ Clinic name (e.g., SmartCare - Main Branch)*  
- address: TEXT, Not Null  
  *→ Street, city, zip*  
- city: VARCHAR(50), Not Null  
  *→ Search filter*  
- state: VARCHAR(50), Not Null  
  *→ Regional info*  
- phone: VARCHAR(15)  
  *→ Branch-specific contact info*

---

## ✅ Design Justifications

- **Normalization:** Patients, Doctors, Admins are separated due to role-based data and authentication needs.
- **Flexible Appointments:** Status + duration + timestamps allow analytics and scheduling flexibility.
- **Referential Integrity:** All relationships use foreign keys with `ON DELETE CASCADE` to avoid orphaned records.
- **Email & Phone Formats:** To be validated in code using regex and annotations (`@Email`, `@Pattern`).
- **Prescriptions:** Stored in MongoDB for flexibility — can include dynamic fields and nested arrays.
- **Unavailability:** Can be added later as a new table to prevent bookings during blocked time slots.

---


## MongoDB Schema Design – Smart Clinic Management System

This Section defines the MongoDB schema for storing **prescriptions**, which complements the MySQL relational schema used for appointments, doctors, and patients. Since prescriptions often involve unstructured and evolving data like medications, notes, and dosage schedules, MongoDB is a natural fit.

---

### 📌 Collection: prescriptions

Each document represents a **prescription issued by a doctor during an appointment**. The structure is flexible and supports nested objects, metadata, and evolving fields.

#### 🧾 Example Document

```json
{
  "_id": ObjectId("64c9b2e8fcf4d8a7a5e83099"),
  "appointment_id": 103,                       // Links to appointment in MySQL
  "patient_id": 12,                            // ID from MySQL patients table
  "doctor_id": 5,                              // ID from MySQL doctors table
  "issued_on": "2025-07-27T10:30:00Z",         // Prescription issue time (ISO 8601)
  "notes": "Patient diagnosed with mild asthma.",
  "medications": [
    {
      "name": "Salbutamol Inhaler",
      "dosage": "100mcg",
      "frequency": "2 puffs/day",
      "duration": "7 days",
      "instructions": "Use after meals"
    },
    {
      "name": "Montelukast",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "14 days"
    }
  ],
  "tags": ["asthma", "follow-up", "inhaler"],
  "follow_up_date": "2025-08-03",
  "created_by": {
    "name": "Dr. Anjali Rao",
    "specialization": "Pulmonologist"
  },
  "last_updated": "2025-07-27T10:35:00Z",
  "meta": {
    "version": 1,
    "source": "web",
    "verified": true
  }
}


