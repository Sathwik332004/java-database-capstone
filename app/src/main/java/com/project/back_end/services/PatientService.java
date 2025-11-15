
package com.project.back_end.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.project.back_end.DTO.AppointmentDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Patient;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.PatientRepository;

import jakarta.transaction.Transactional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final TokenService tokenService;

    public PatientService(PatientRepository patientRepository, AppointmentRepository appointmentRepository,
            TokenService tokenService) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }

    public int createPatient(Patient patient) {
        try {
            patientRepository.save(patient);
            return 1;
        } catch (Exception e) {
            System.out.println("Error: " + e);
            return 0;
        }

    }

    @Transactional
    public ResponseEntity<Map<String, Object>> getPatientAppointment(Long id, String token) {
        Map<String, Object> map = new HashMap<>();

        try {
            List<Appointment> appointments = appointmentRepository.findByPatientId(id);

            // Convert appointments to DTOs
            List<AppointmentDTO> appointmentDTOs = appointments.stream()
                    .map(app -> new AppointmentDTO(
                            app.getId(),
                            app.getDoctor().getId(), // Only doctor ID
                            app.getDoctor().getName(),
                            app.getPatient().getId(),
                            app.getPatient().getName(),
                            app.getPatient().getEmail(),
                            app.getPatient().getPhone(),
                            app.getPatient().getAddress(),
                            app.getAppointmentTime(),
                            app.getStatus()))
                    .collect(Collectors.toList());

            map.put("appointments", appointmentDTOs);
            return ResponseEntity.status(HttpStatus.OK).body(map);
        } catch (Exception e) {
            System.out.println("Error: " + e);
            map.put("error", "Internal Server Error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map);
        }
    }

    public ResponseEntity<Map<String, Object>> filterByCondition(String condition, Long id) {
        Map<String, Object> map = new HashMap<>();
        List<Appointment> appointments;
        if (condition.equals("past")) {
            appointments = appointmentRepository.findByPatient_IdAndStatusOrderByAppointmentTimeAsc(id, 1);

        } else if (condition.equals("future")) {
            appointments = appointmentRepository.findByPatient_IdAndStatusOrderByAppointmentTimeAsc(id, 0);

        } else {
            map.put("error", "Invalid filter");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map);

        }
        List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(app -> new AppointmentDTO(
                        app.getId(),
                        app.getDoctor().getId(), // Only doctor ID
                        app.getDoctor().getName(),
                        app.getPatient().getId(),
                        app.getPatient().getName(),
                        app.getPatient().getEmail(),
                        app.getPatient().getPhone(),
                        app.getPatient().getAddress(),
                        app.getAppointmentTime(),
                        app.getStatus()))
                .collect(Collectors.toList());

        map.put("appointments", appointmentDTOs);
        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    public ResponseEntity<Map<String, Object>> filterByDoctor(String name, Long patientId) {
        Map<String, Object> map = new HashMap<>();

        System.out.println("Startingur query");
        List<Appointment> appointments = appointmentRepository.filterByDoctorNameAndPatientId(name,
                patientId);

        System.out.println(name);
        System.out.println(patientId);
        System.out.println("HI");
        System.out.println(appointments.size());
        for (Appointment appointment : appointments) {
            System.out.println("" + appointment.getDoctor().getName());
        }

        List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(app -> new AppointmentDTO(
                        app.getId(),
                        app.getDoctor().getId(), // Only doctor ID
                        app.getDoctor().getName(),
                        app.getPatient().getId(),
                        app.getPatient().getName(),
                        app.getPatient().getEmail(),
                        app.getPatient().getPhone(),
                        app.getPatient().getAddress(),
                        app.getAppointmentTime(),
                        app.getStatus()))
                .collect(Collectors.toList());

        map.put("appointments", appointmentDTOs);
        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    public ResponseEntity<Map<String, Object>> filterByDoctorAndCondition(String condition, String name,
            long patientId) {

        Map<String, Object> map = new HashMap<>();
        List<Appointment> appointments;
        if (condition.equals("past")) {
            appointments = appointmentRepository.filterByDoctorNameAndPatientIdAndStatus(name, patientId, 1);

        } else if (condition.equals("future")) {
            appointments = appointmentRepository.filterByDoctorNameAndPatientIdAndStatus(name, patientId, 0);

        } else {
            map.put("error", "Invalid filter");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map);

        }
        List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(app -> new AppointmentDTO(
                        app.getId(),
                        app.getDoctor().getId(), // Only doctor ID
                        app.getDoctor().getName(),
                        app.getPatient().getId(),
                        app.getPatient().getName(),
                        app.getPatient().getEmail(),
                        app.getPatient().getPhone(),
                        app.getPatient().getAddress(),
                        app.getAppointmentTime(),
                        app.getStatus()))
                .collect(Collectors.toList());

        map.put("appointments", appointmentDTOs);
        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    public ResponseEntity<Map<String,Object>> getPatientDetails(String token)
    {
        Map<String, Object> map = new HashMap<>();
        String email=tokenService.extractEmail(token);
        Patient patient=patientRepository.findByEmail(email);
        map.put("patient",patient);
        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

}
