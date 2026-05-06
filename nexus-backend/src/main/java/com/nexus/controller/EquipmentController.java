package com.nexus.controller;

import com.nexus.model.Equipment;
import com.nexus.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private com.nexus.repository.ApprovalStepRepository approvalStepRepository;

    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    @GetMapping("/{id}/hierarchy")
    public List<com.nexus.model.ApprovalStep> getHierarchy(@PathVariable @SuppressWarnings("null") Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        return approvalStepRepository.findByEquipmentOrderBySequenceOrderAsc(equipment);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable @SuppressWarnings("null") Long id) {
        return equipmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN')")
    public Equipment createEquipment(@RequestBody Equipment equipment) {
        @SuppressWarnings("null")
        Equipment savedEquipment = equipmentRepository.save(equipment);
        return savedEquipment;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN')")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable @SuppressWarnings("null") Long id, @RequestBody Equipment equipmentDetails) {
        return equipmentRepository.findById(id)
                .map(equipment -> {
                    equipment.setName(equipmentDetails.getName());
                    equipment.setCategory(equipmentDetails.getCategory());
                    equipment.setDescription(equipmentDetails.getDescription());
                    equipment.setConditionStatus(equipmentDetails.getConditionStatus());
                    equipment.setTotalQuantity(equipmentDetails.getTotalQuantity());
                    equipment.setAvailableQuantity(equipmentDetails.getAvailableQuantity());
                    equipment.setImageUrl(equipmentDetails.getImageUrl());
                    return ResponseEntity.ok(equipmentRepository.save(equipment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN')")
    public ResponseEntity<?> deleteEquipment(@PathVariable @SuppressWarnings("null") Long id) {
        return equipmentRepository.findById(id)
                .map(equipment -> {
                    @SuppressWarnings("null")
                    Equipment eqToDelete = equipment;
                    equipmentRepository.delete(eqToDelete);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Equipment> searchEquipment(@RequestParam String name) {
        return equipmentRepository.findByNameContainingIgnoreCase(name);
    }
}
