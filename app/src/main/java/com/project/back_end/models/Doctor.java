package com.project.back_end.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.List;

/**
 * Doctor entity representing healthcare providers.
 */
@Entity
@Table(name = "doctors")
public class Doctor {

    // Primary key: auto-incremented id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Doctor's full name (required, 3–100 characters)
    @NotNull(message = "name cannot be null")
    @Size(min = 3, max = 100, message = "name must be between 3 and 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    // Medical specialty (required, 3–50 characters)
    @NotNull(message = "specialty cannot be null")
    @Size(min = 3, max = 50, message = "specialty must be between 3 and 50 characters")
    @Column(name = "specialty", nullable = false, length = 50)
    private String specialty;

    // Email (required, valid format)
    @NotNull(message = "email cannot be null")
    @Email(message = "email must be a valid email address")
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    // Password (required, at least 6 chars, write-only in JSON)
    @NotNull(message = "password cannot be null")
    @Size(min = 6, message = "password must be at least 6 characters")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", nullable = false)
    private String password;

    // Phone number (required, exactly 10 digits)
    @NotNull(message = "phone cannot be null")
    @Pattern(regexp = "\\d{10}", message = "Phone number must be exactly 10 digits")
    @Column(name = "phone", nullable = false, length = 10)
    private String phone;

    // Available time slots (stored as an element collection)
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "doctor_available_times", joinColumns = @JoinColumn(name = "doctor_id"))
    @Column(name = "time_slot", length = 50)
    private List<@Size(min = 1, max = 50, message = "time slot must be non-empty and <=50 chars") String> availableTimes = new ArrayList<>();

    // No-arg constructor required by JPA
    public Doctor() {}

    // Convenience constructor
    public Doctor(Long id, String name, String specialty, String email, String password, String phone, List<String> availableTimes) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
        this.email = email;
        this.password = password;
        this.phone = phone;
        if (availableTimes != null) this.availableTimes = availableTimes;
    }

    // ---------- Getters and Setters ----------

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // Note: password is write-only in JSON; do not expose it in serialization
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public List<String> getAvailableTimes() {
        return availableTimes;
    }

    public void setAvailableTimes(List<String> availableTimes) {
        this.availableTimes = availableTimes;
    }

    // Convenience helper to add a single timeslot
    public void addAvailableTime(String timeslot) {
        if (this.availableTimes == null) this.availableTimes = new ArrayList<>();
        this.availableTimes.add(timeslot);
    }

    // Convenience helper to remove a timeslot
    public void removeAvailableTime(String timeslot) {
        if (this.availableTimes != null) this.availableTimes.remove(timeslot);
    }
}
