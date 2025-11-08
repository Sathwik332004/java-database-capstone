package com.project.back_end.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

/**
 * Patient entity representing users who book appointments and receive treatment.
 */
@Entity
@Table(name = "patients")
public class Patient {

    // Primary key: auto-incremented id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Patient's full name (required, 3–100 characters)
    @NotNull(message = "name cannot be null")
    @Size(min = 3, max = 100, message = "name must be between 3 and 100 characters")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    // Email (required, valid format)
    @NotNull(message = "email cannot be null")
    @Email(message = "email must be a valid email address")
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    // Password (required, at least 6 chars) — hidden from JSON responses
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

    // Address (required, max 255 characters)
    @NotNull(message = "address cannot be null")
    @Size(max = 255, message = "address must be at most 255 characters")
    @Column(name = "address", nullable = false, length = 255)
    private String address;

    // Optional: track when the patient record was created
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    // No-arg constructor required by JPA
    public Patient() {}

    // Convenience constructor
    public Patient(Long id, String name, String email, String password, String phone, String address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.address = address;
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = Instant.now();
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // password is write-only in JSON; avoid exposing it in responses
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
