/*
 package com.project.back_end.mvc;

public class DashboardController {

// 1. Set Up the MVC Controller Class:
//    - Annotate the class with `@Controller` to indicate that it serves as an MVC controller returning view names (not JSON).
//    - This class handles routing to admin and doctor dashboard pages based on token validation.


// 2. Autowire the Shared Service:
//    - Inject the common `Service` class, which provides the token validation logic used to authorize access to dashboards.


// 3. Define the `adminDashboard` Method:
//    - Handles HTTP GET requests to `/adminDashboard/{token}`.
//    - Accepts an admin's token as a path variable.
//    - Validates the token using the shared service for the `"admin"` role.
//    - If the token is valid (i.e., no errors returned), forwards the user to the `"admin/adminDashboard"` view.
//    - If invalid, redirects to the root URL, likely the login or home page.


// 4. Define the `doctorDashboard` Method:
//    - Handles HTTP GET requests to `/doctorDashboard/{token}`.
//    - Accepts a doctor's token as a path variable.
//    - Validates the token using the shared service for the `"doctor"` role.
//    - If the token is valid, forwards the user to the `"doctor/doctorDashboard"` view.
//    - If the token is invalid, redirects to the root URL.

}
 */

 package com.project.back_end.mvc;

import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.project.back_end.services.TokenService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * DashboardController
 *
 * - Serves Thymeleaf dashboard views for admin and doctor.
 * - Validates tokens using an injected TokenValidationService before returning views.
 *
 * Notes:
 * - The tokenValidationService bean must expose a method with signature:
 *     Map<String, Object> validateToken(String token, String role)
 *   which returns an empty map when validation succeeds, or a non-empty map when validation fails.
 * - If you use a different method name / return type, adapt the calls below accordingly.
 */
@Controller
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    private final TokenService tokenValidationService;

    /**
     * Constructor injection (preferred over field injection).
     * Ensure that a bean named/typed TokenValidationService exists in the application context.
     */
    @Autowired
    public DashboardController(TokenService tokenValidationService) {
        this.tokenValidationService = tokenValidationService;
    }

    /**
     * Admin dashboard route.
     * Example: GET /adminDashboard/{token}
     *
     * If token is valid for role "admin" -> return view "admin/adminDashboard".
     * Otherwise redirect to the root (login/home).
     */
    @GetMapping("/adminDashboard/{token}")
    public String adminDashboard(@PathVariable("token") String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                logger.warn("Empty admin token provided - redirecting to root");
                return "redirect:/";
            }

            Map<String, Object> validationResult = tokenValidationService.validateToken(token, "admin");
            // Empty map indicates success per your spec
            if (validationResult == null || validationResult.isEmpty()) {
                // Token valid --> show admin dashboard Thymeleaf template
                return "admin/adminDashboard";
            } else {
                logger.info("Admin token validation failed: {}", validationResult);
                return "redirect:/";
            }
        } catch (Exception ex) {
            logger.error("Error validating admin token", ex);
            return "redirect:/";
        }
    }

    /**
     * Doctor dashboard route.
     * Example: GET /doctorDashboard/{token}
     *
     * If token is valid for role "doctor" -> return view "doctor/doctorDashboard".
     * Otherwise redirect to the root (login/home).
     */
    @GetMapping("/doctorDashboard/{token}")
    public String doctorDashboard(@PathVariable("token") String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                logger.warn("Empty doctor token provided - redirecting to root");
                return "redirect:/";
            }

            Map<String, Object> validationResult = tokenValidationService.validateToken(token, "doctor");
            if (validationResult == null || validationResult.isEmpty()) {
                return "doctor/doctorDashboard";
            } else {
                logger.info("Doctor token validation failed: {}", validationResult);
                return "redirect:/";
            }
        } catch (Exception ex) {
            logger.error("Error validating doctor token", ex);
            return "redirect:/";
        }
    }
}


