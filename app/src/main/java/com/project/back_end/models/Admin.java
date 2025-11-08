package com.project.back_end.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents system administrators with privileges to manage
 * the backend portal of the Clinic Management System.
 */
@Entity
@Table(name = "admins")
public class Admin {

    // 1. Primary key: auto-incremented id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 2. Username: cannot be null, unique
    @NotNull(message = "username cannot be null")
    @Column(nullable = false, unique = true)
    private String username;

    // 3. Password: cannot be null, write-only for JSON
    @NotNull(message = "password cannot be null")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    // 4. No-args constructor (required by JPA)
    public Admin() {}

    // 5. Parameterized constructor for convenience
    public Admin(Long id, String username, String password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }

    // 6. Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
