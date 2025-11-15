
package com.project.back_end.DTO;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentDTO {

    private Long id;
    
    // Simplified Doctor fields
    private Long doctorId;

    private String doctorName;

    // Simplified Patient fields
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String patientAddress;

    private LocalDateTime appointmentTime;
    private int status;

    // Custom getters for the date and time
    private LocalDate appointmentDate;
    private LocalTime appointmentTimeOnly;
    private LocalDateTime endTime;

    // Constructor
    public AppointmentDTO(Long id, Long doctorId,String doctorName, Long patientId, String patientName,
                          String patientEmail, String patientPhone, String patientAddress,
                          LocalDateTime appointmentTime, int status) {
        this.id = id;
        this.doctorId = doctorId;
        this.doctorName=doctorName;
        this.patientId = patientId;
        this.patientName = patientName;
        this.patientEmail = patientEmail;
        this.patientPhone = patientPhone;
        this.patientAddress = patientAddress;
        this.appointmentTime = appointmentTime;
        this.status = status;
        
        
        // Calculate custom fields
        this.appointmentDate = appointmentTime != null ? appointmentTime.toLocalDate() : null;
        this.appointmentTimeOnly = appointmentTime != null ? appointmentTime.toLocalTime() : null;
        this.endTime = appointmentTime != null ? appointmentTime.plusHours(1) : null;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public Long getPatientId() {
        return patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public String getPatientEmail() {
        return patientEmail;
    }

    public String getPatientPhone() {
        return patientPhone;
    }

    public String getPatientAddress() {
        return patientAddress;
    }

    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public int getStatus() {
        return status;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public LocalTime getAppointmentTimeOnly() {
        return appointmentTimeOnly;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }
}
