
package com.project.back_end.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.repo.AppointmentRepository;
import com.project.back_end.repo.DoctorRepository;

import jakarta.transaction.Transactional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    private final AppointmentRepository appointmentRepository;

    private final TokenService tokenService;

    public DoctorService(DoctorRepository doctorRepository, AppointmentRepository appointmentRepository,
            TokenService tokenService) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.tokenService = tokenService;
    }


    @Transactional
    public List<String> getDoctorAvailability(Long doctorId, LocalDate date) {
        Optional<Doctor> doctor = doctorRepository.findById(doctorId);

        if (doctor.isEmpty()) {
            return List.of("Doctor not found with ID: " + doctorId);
        }

        List<String> availableSlots = doctor.get().getAvailableTimes().stream()
                .map(Object::toString)
                .collect(Collectors.toList());

        // Convert LocalDate to LocalDateTime (start and end of the day)
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        // Fetch the appointments for this doctor on the given date
        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(doctorId,
                startOfDay, endOfDay);

        // Set of booked slots for the doctor on this date
        Set<String> bookedSlots = appointments.stream()
                .map(appt -> {
                    LocalDateTime start = appt.getAppointmentTime();
                    LocalDateTime end = start.plusHours(1); // Add 1 hour to the start time to get the end time
                    return formatSlot(start, end); // Format the slot as "HH:mm-HH:mm"
                })
                .collect(Collectors.toSet());

        // Filter out booked slots from the available slots
        return availableSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .collect(Collectors.toList());
    }

    private String formatSlot(LocalDateTime start, LocalDateTime end) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        return start.format(formatter) + "-" + end.format(formatter);
    }

    public int saveDoctor(Doctor doctor) {

        // success: 1, conflict:-1, internal error: 0
        Doctor result = doctorRepository.findByEmail(doctor.getEmail());

        if (result != null) {
            return -1;
        }
        try {
            doctorRepository.save(doctor);
            return 1;
        } catch (Exception e) {
            System.err.println("Error saving doctor: " + e.getMessage());
            return 0;
        }

    }

    public int updateDoctor(Doctor doctor) {
        // success: 1, conflict:-1, internal error: 0
        Optional<Doctor> result = doctorRepository.findById(doctor.getId());
        if (!result.isPresent()) {
            return -1;
        }
        try {
            doctorRepository.save(doctor);
            return 1;
        } catch (Exception e) {
            System.err.println("Error saving doctor: " + e.getMessage());
            return 0;
        }

    }

    @Transactional
    public List<Doctor> getDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        // Optionally touch the collection to force loading:
        doctors.forEach(doc -> doc.getAvailableTimes().size());
        return doctors;
    }

    public int deleteDoctor(long id) {
        Optional<Doctor> doctor = doctorRepository.findById(id);

        if (!doctor.isPresent()) {
            return -1;
        }
        try {
            appointmentRepository.deleteAllByDoctorId(doctor.get().getId());
            doctorRepository.delete(doctor.get());
            return 1;
        } catch (Exception e) {
            System.err.println("Error saving doctor: " + e.getMessage());
            return 0;
        }
    }

    public ResponseEntity<Map<String, String>> validateDoctor(Login login) {
        Map<String, String> map = new HashMap<>();
        try {

            Doctor doctor = doctorRepository.findByEmail(login.getEmail());
            if (doctor != null) {
                if (doctor.getPassword().equals(login.getPassword())) {
                    map.put("token", tokenService.generateToken(doctor.getEmail()));
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

    @Transactional
    public Map<String, Object> findDoctorByName(String name) {
        Map<String, Object> map = new HashMap<>();
        List<Doctor> doctorList = doctorRepository.findByNameLike(name);
        doctorList.forEach(doc -> doc.getAvailableTimes().size());
        map.put("doctors", doctorList);
        return map;
    }

    @Transactional
    public Map<String, Object> filterDoctorsByNameSpecilityandTime(String name, String specialty, String amOrPm) {
        Map<String, Object> map = new HashMap<>();

        List<Doctor> doctors = doctorRepository.findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(name, specialty);

        List<Doctor> filteredDoctors = filterDoctorByTime(doctors,amOrPm);

        map.put("doctors", filteredDoctors);
        return map;
    }

    @Transactional
    public Map<String, Object> filterDoctorByNameAndTime(String name, String amOrPm) {
        Map<String, Object> map = new HashMap<>();

        // Step 1: Fetch by name (partial match)
        List<Doctor> doctors = doctorRepository.findByNameLike(name);

        // Step 2: Filter by AM/PM
        List<Doctor> filteredDoctors = filterDoctorByTime(doctors,amOrPm);

        map.put("doctors", filteredDoctors);
        return map;
    }

    @Transactional
    public Map<String, Object> filterDoctorByNameAndSpecility(String name, String specilty) {
        Map<String, Object> map = new HashMap<>();
        List<Doctor> doctorList = doctorRepository.findByNameContainingIgnoreCaseAndSpecialtyIgnoreCase(name, specilty);
        doctorList.forEach(doc -> doc.getAvailableTimes().size());
        map.put("doctors", doctorList);
        return map;
    }

    @Transactional
    public Map<String, Object> filterDoctorByTimeAndSpecility(String specilty, String amOrPm) {
        Map<String, Object> map = new HashMap<>();
        List<Doctor> doctors = doctorRepository.findBySpecialtyIgnoreCase(specilty);
        List<Doctor> filteredDoctors = filterDoctorByTime(doctors,amOrPm);
        map.put("doctors", filteredDoctors);
        return map;

    }

    @Transactional
    public Map<String, Object> filterDoctorBySpecility(String specilty) {
        Map<String, Object> map = new HashMap<>();
        List<Doctor> doctorList = doctorRepository.findBySpecialtyIgnoreCase(specilty);
        doctorList.forEach(doc -> doc.getAvailableTimes().size());
        map.put("doctors", doctorList);
        return map;
    }

    @Transactional
    public Map<String, Object> filterDoctorsByTime(String amOrPm) {
        Map<String, Object> map = new HashMap<>();
        List<Doctor> doctors = doctorRepository.findAll();
        List<Doctor> filteredDoctors = filterDoctorByTime(doctors,amOrPm);
        map.put("doctors", filteredDoctors);
        return map;
    }


    public  List<Doctor> filterDoctorByTime(List<Doctor> doctors,String amOrPm)
    {
        return doctors.stream()
        .filter(doctor -> {
            if (amOrPm == null || amOrPm.isBlank())
                return true;

            boolean isAM = amOrPm.equalsIgnoreCase("am");
            return doctor.getAvailableTimes().stream().anyMatch(slot -> {
                try {
                    String startHourStr = slot.split("-")[0].split(":")[0]; // e.g. "09"
                    int hour = Integer.parseInt(startHourStr);
                    return isAM ? hour < 12 : hour >= 12;
                } catch (Exception e) {
                    return false; // Skip invalid time slots
                }
            });
        })
        .collect(Collectors.toList());
    }



   
}
