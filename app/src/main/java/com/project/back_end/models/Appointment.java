package com.project.back_end.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Duration;

/**
 * Represents an appointment between a doctor and a patient.
 */
@Entity
@Table(name = "appointments")
public class Appointment {

    // Primary key: auto-incremented id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many appointments can belong to one doctor
    @NotNull(message = "Doctor is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    // Many appointments can belong to one patient
    @NotNull(message = "Patient is required")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    // Date & time of the appointment — must be in the future when creating
    @NotNull(message = "Appointment time is required")
    @Future(message = "Appointment time must be in the future")
    @Column(name = "appointment_time", nullable = false)
    private LocalDateTime appointmentTime;

    // 0 = Scheduled, 1 = Completed
    @NotNull(message = "Status is required")
    @Min(value = 0, message = "Invalid status")
    @Max(value = 1, message = "Invalid status")
    @Column(nullable = false)
    private Integer status = 0;

    // No-arg constructor required by JPA
    public Appointment() {}

    // Parameterized constructor for convenience
    public Appointment(Long id, Doctor doctor, Patient patient, LocalDateTime appointmentTime, Integer status) {
        this.id = id;
        this.doctor = doctor;
        this.patient = patient;
        this.appointmentTime = appointmentTime;
        this.status = status;
    }

    // ---------- Getters and Setters ----------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalDateTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    // ---------- Helper methods (transient — not persisted) ----------

    /**
     * Returns the estimated end time of the appointment.
     * Default policy: appointment duration is 1 hour.
     *
     * Marked @Transient so it is not persisted to the DB.
     */
    @Transient
    public LocalDateTime getEndTime() {
        if (this.appointmentTime == null) return null;
        return this.appointmentTime.plusHours(1);
    }

    /**
     * Returns only the date portion of the appointmentTime.
     */
    @Transient
    public LocalDate getAppointmentDate() {
        if (this.appointmentTime == null) return null;
        return this.appointmentTime.toLocalDate();
    }

    /**
     * Returns only the time portion of the appointmentTime.
     */
    @Transient
    public LocalTime getAppointmentTimeOnly() {
        if (this.appointmentTime == null) return null;
        return this.appointmentTime.toLocalTime();
    }

    // Optional: convenience method to get duration in minutes (hard-coded 60 here)
    @Transient
    public long getDurationMinutes() {
        // If you later add a duration field, you can update this method accordingly.
        return Duration.between(this.appointmentTime, getEndTime()).toMinutes();
    }
}
