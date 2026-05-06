package com.nexus.controller;

import com.nexus.model.ApprovalStep;
import com.nexus.model.Equipment;
import com.nexus.model.User;
import com.nexus.repository.ApprovalStepRepository;
import com.nexus.repository.EquipmentRepository;
import com.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN')")
public class AdminController {

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

    @PutMapping("/users/approve/{userId}")
    public ResponseEntity<?> approveUser(@PathVariable @SuppressWarnings("null") Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    user.setEnabled(true);
                    userRepository.save(user);
                    return ResponseEntity.ok("User approved successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/hierarchy/{equipmentId}")
    public ResponseEntity<?> setupHierarchy(@PathVariable @SuppressWarnings("null") Long equipmentId, @RequestBody List<ApprovalStep> steps) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        // Clear existing steps
        List<ApprovalStep> existing = approvalStepRepository.findByEquipmentOrderBySequenceOrderAsc(equipment);
        @SuppressWarnings("null")
        Iterable<? extends ApprovalStep> stepsToDelete = existing;
        approvalStepRepository.deleteAll(stepsToDelete);

        // Save new steps
        for (int i = 0; i < steps.size(); i++) {
            steps.get(i).setEquipment(equipment);
            steps.get(i).setSequenceOrder(i + 1);
        }
        
        return ResponseEntity.ok(approvalStepRepository.saveAll(steps));
    }

}
