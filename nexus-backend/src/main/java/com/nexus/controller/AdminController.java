package com.nexus.controller;

import com.nexus.model.*;
import com.nexus.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN') or hasRole('LAB_ADMIN')")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private ApprovalStepRepository approvalStepRepository;

    @GetMapping("/users/pending")
    public List<User> getPendingUsers() {
        return userRepository.findAll().stream()
                .filter(u -> !u.isEnabled())
                .collect(Collectors.toList());
    }

    @PutMapping("/users/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setEnabled(true);
        userRepository.save(user);
        logger.info("Admin approved user: {}", user.getUsername());
        return ResponseEntity.ok("User approved successfully!");
    }

    @PostMapping("/hierarchy/{equipmentId}")
    public ResponseEntity<?> setupHierarchy(@PathVariable Long equipmentId, @RequestBody List<ApprovalStep> steps) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Error: Equipment not found."));
        
        // Remove existing steps
        List<ApprovalStep> existing = approvalStepRepository.findByEquipmentOrderBySequenceOrderAsc(equipment);
        approvalStepRepository.deleteAll(existing);

        // Add new steps
        for (int i = 0; i < steps.size(); i++) {
            ApprovalStep step = steps.get(i);
            step.setEquipment(equipment);
            step.setSequenceOrder(i + 1);
            approvalStepRepository.save(step);
        }

        logger.info("Hierarchy updated for equipment: {}", equipment.getName());
        return ResponseEntity.ok("Hierarchy updated successfully!");
    }
}
