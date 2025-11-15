
package com.project.back_end.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project.back_end.DTO.Login;
import com.project.back_end.models.Doctor;
import com.project.back_end.services.DoctorService;
import com.project.back_end.services.Service;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("${api.path}"+"doctor")
public class DoctorController {

    private final DoctorService doctorService;
    private final Service service;

    @Autowired
    public DoctorController(DoctorService doctorService,Service service) {
        this.doctorService = doctorService;
        this.service = service;
    }

    @GetMapping("/availability/{user}/{doctorId}/{date}/{token}")
    public ResponseEntity<Map<String,Object>> getDoctorAvailability(@PathVariable String user,@PathVariable Long doctorId,@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date, @PathVariable String token) {
        
        Map<String, Object> map = new HashMap<>();
        ResponseEntity<Map<String,String>> tempMap= service.validateToken(token, user);
        if (!tempMap.getBody().isEmpty()) {
            map.putAll(tempMap.getBody());
            return new ResponseEntity<>(map, tempMap.getStatusCode());
        }
        map.put("message",doctorService.getDoctorAvailability(doctorId,date));
        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    @GetMapping
    public ResponseEntity<Map<String,Object>> getDoctor()
    {
        Map<String, Object> map=new HashMap<>();
        map.put("doctors",doctorService.getDoctors());
        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> saveDoctor(@RequestBody @Valid Doctor doctor, @PathVariable String token) {
        Map<String, String> response = new HashMap<>();

        ResponseEntity<Map<String,String>> tempMap= service.validateToken(token, "admin");
        if (!tempMap.getBody().isEmpty()) {
            return tempMap;
        }

        int res =doctorService.saveDoctor(doctor);
        if (res==1) {
            response.put("message", "Doctor added to db");
            return ResponseEntity.status(HttpStatus.CREATED).body(response); // 201 Created
        }
        else if(res==-1)
        {
            response.put("message", "Doctor already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response); // 409 Conflict
        }
    
        response.put("message", "Some internal error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response); // 409 Conflict      
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> doctorLogin(@RequestBody @Valid Login login)
    {
        return doctorService.validateDoctor(login);
    }


    @PutMapping("/{token}")
    public ResponseEntity<Map<String, String>> updateDoctor(@RequestBody @Valid Doctor doctor,@PathVariable String token) {
        Map<String, String> response = new HashMap<>();

        ResponseEntity<Map<String,String>> tempMap= service.validateToken(token, "admin");
        if (!tempMap.getBody().isEmpty()) {
            return tempMap;
        }
        int res =doctorService.updateDoctor(doctor);
        if (res==1) {
            response.put("message", "Doctor updated");
            return ResponseEntity.status(HttpStatus.OK).body(response); // 200 OK
        }
        else if(res==-1)
        {
            response.put("message", "Doctor not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); // 404 Not Found
        }
    
        response.put("message", "Some internal error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response); // 409 Conflict      
    }


    @DeleteMapping("/{id}/{token}")
    public ResponseEntity<Map<String, String>> deleteDoctor(@PathVariable long id,@PathVariable String token)
    {
        Map<String, String> response = new HashMap<>();
        ResponseEntity<Map<String,String>> tempMap= service.validateToken(token, "admin");
        if (!tempMap.getBody().isEmpty()) {
            return tempMap;
        }
        int res=doctorService.deleteDoctor(id);
        if (res==1) {
            response.put("message", "Doctor deleted successfull with id: "+id);
            return ResponseEntity.status(HttpStatus.CREATED).body(response); // 201 Created
        }
        else if(res==-1)
        {
            response.put("message", "Doctor not found with id: "+id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        response.put("message", "Some internal error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response); // 409 Conflict      
    }


    @GetMapping("/filter/{name}/{time}/{speciality}")
    public ResponseEntity<Map<String, Object>> filter(@PathVariable String name, @PathVariable String time, @PathVariable String speciality)
    {
        Map<String,Object> map=new HashMap<>();
        map=service.filterDoctor(name, speciality, time);
        return ResponseEntity.status(HttpStatus.OK).body(map);
    }

}
