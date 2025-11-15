
package com.project.back_end.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Admin;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AdminRepository;
import com.project.back_end.repo.DoctorRepository;
import com.project.back_end.repo.PatientRepository;

@org.springframework.stereotype.Service
public class Service {

    private final TokenService tokenService;
    private final AdminRepository adminRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorService doctorService;
    private final PatientRepository patientRepository;
    private final PatientService patientService;

    public Service(TokenService tokenService, AdminRepository adminRepository, DoctorService doctorService,
            DoctorRepository doctorRepository, PatientRepository patientRepository,PatientService patientService) {
        this.tokenService = tokenService;
        this.adminRepository = adminRepository;
        this.doctorService = doctorService;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.patientService=patientService;
    }

    public ResponseEntity<Map<String, String>> validateToken(String token, String user) {
        Map<String, String> response = new HashMap<>();
        if (!tokenService.validateToken(token, user)) {
            response.put("error", "Invalid or expired token");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    public ResponseEntity<Map<String, String>> validateAdmin(Admin receivedAdmin) {
        Map<String, String> map = new HashMap<>();
        try {
            Admin admin = adminRepository.findByUsername(receivedAdmin.getUsername());
            if (admin != null) {
                if (admin.getPassword().equals(receivedAdmin.getPassword())) {
                    map.put("token", tokenService.generateToken(admin.getUsername()));
                    return ResponseEntity.status(HttpStatus.OK).body(map);
                } else {
                    map.put("error", "Password does not match");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(map);
                }
            }
            map.put("error", "invalid email id");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(map);

        } catch (Exception e) {
            System.out.println("Error: " + e);
            map.put("error", "Internal Server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
        }
    }

    public Map<String, Object> filterDoctor(String name, String specility, String time) {
        Map<String, Object> map = new HashMap<>();
        if (!name.equals("null") && !time.equals("null") && !specility.equals("null")) {
            map = doctorService.filterDoctorsByNameSpecilityandTime(name, specility, time);
        }

        else if (!name.equals("null") && !time.equals("null")) {
            map = doctorService.filterDoctorByNameAndTime(name, time);
        } else if (!name.equals("null") && !specility.equals("null")) {
            map = doctorService.filterDoctorByNameAndSpecility(name, specility);
        } else if (!specility.equals("null") && !time.equals("null")) {
            map = doctorService.filterDoctorByTimeAndSpecility(specility, time);
        } else if (!name.equals("null")) {
            map = doctorService.findDoctorByName(name);
        } else if (!specility.equals("null")) {
            map = doctorService.filterDoctorBySpecility(specility);
        } else if (!time.equals("null")) {
            map = doctorService.filterDoctorsByTime(time);
        } else {
            map.put("doctors", doctorService.getDoctors());
        }
        return map;

    }

    public int validateAppointment(Appointment appointment) {
        Doctor doctor = appointment.getDoctor();
        Optional<Doctor> result = doctorRepository.findById(doctor.getId());
        if (result.isEmpty()) {
            return -1;
        }
        LocalDate appointmentDate = appointment.getAppointmentDate();
        LocalTime appointmentTime = appointment.getAppointmentTimeOnly();
        List<String> availableTime = doctorService.getDoctorAvailability(doctor.getId(), appointmentDate);

        for (String timeSlot : availableTime) {
            // Split the available time slot into start and end times (e.g., "9:00-10:00" ->
            // ["9:00", "10:00"])
            String[] times = timeSlot.split("-");

            // Parse the start time and end time as LocalTime
            LocalTime startTime = LocalTime.parse(times[0]);

            if (appointmentTime.equals(startTime)) {
                return 1; // The appointment time matches the start time of an available slot
            }

        }

        return 0;
    }

    public boolean validatePatient(Patient patient) {
        Patient result = patientRepository.findByEmailOrPhone(patient.getEmail(), patient.getPhone());
        if (result != null) {
            return false;
        }
        return true;
    }

    public ResponseEntity<Map<String, String>> validatePatientLogin(Login login) {
        Map<String, String> map = new HashMap<>();
        try {
            Patient result = patientRepository.findByEmail(login.getEmail());
            if (result != null) {
                if (result.getPassword().equals(login.getPassword())) {
                    map.put("token", tokenService.generateToken(login.getEmail()));
                    return ResponseEntity.status(HttpStatus.OK).body(map);
                }

                else {
                    map.put("error", "Password does not match");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(map);
                }
            }
            map.put("error", "invalid email id");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(map);

        }

        catch (Exception e) {
            System.out.println("Error: " + e);
            map.put("error", "Internal Server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
        }
    }

    public ResponseEntity<Map<String,Object>> filterPatient(String condition,String name,String token)
    {
        String extractedEmail = tokenService.extractEmail(token);
        Long patientId = patientRepository.findByEmail(extractedEmail).getId();

        if(name.equals("null") && !condition.equals("null"))
        {
            return patientService.filterByCondition(condition,patientId);
        }
        else if(condition.equals("null")&& !name.equals("null"))
        {
            return patientService.filterByDoctor(name,patientId);
        }
        else if(!condition.equals("null")&& !name.equals("null"))
        {
            return patientService.filterByDoctorAndCondition(condition,name,patientId);
        }
        else
        {
            return patientService.getPatientAppointment(patientId,token);
        }
        

    }

}
