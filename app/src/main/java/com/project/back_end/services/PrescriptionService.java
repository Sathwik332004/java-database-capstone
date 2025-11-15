
package com.project.back_end.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.project.back_end.models.Prescription;
import com.project.back_end.repo.PrescriptionRepository;

@Service
public class PrescriptionService {
    
    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository)
    {
        this.prescriptionRepository=prescriptionRepository;
    }

    public ResponseEntity<Map<String, String>> savePrescription(Prescription prescription)
    {
        Map<String, String> map=new HashMap<>();
        try{
            List<Prescription> result=prescriptionRepository.findByAppointmentId(prescription.getAppointmentId());
            if(result.isEmpty())
            {
                prescriptionRepository.save(prescription);
                map.put("message","Prescription saved");
                return ResponseEntity.status(HttpStatus.CREATED).body(map); 
            }
            map.put("message","prescription already exists");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(map); 
            
        }
        catch(Exception e)
        {
            System.out.println("Error: "+e);
            map.put("message","Internal Server Error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map); 
        }
    } 

    public ResponseEntity<Map<String, Object>> getPrescription(Long appointmentId)
    {
        Map<String, Object> map=new HashMap<>();

        try{
            
            map.put("prescription",prescriptionRepository.findByAppointmentId(appointmentId));
            return ResponseEntity.status(HttpStatus.OK).body(map); 
        }
        catch(Exception e)
        {
            System.out.println("Error: "+e);
            map.put("error","Internal Server Error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(map); 
        }
    }
}
