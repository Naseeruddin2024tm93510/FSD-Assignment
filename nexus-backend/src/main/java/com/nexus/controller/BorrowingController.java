package com.nexus.controller;

import com.nexus.model.*;
import com.nexus.repository.BorrowRequestRepository;
import com.nexus.repository.EquipmentRepository;
import com.nexus.repository.UserRepository;
import com.nexus.repository.ApprovalStepRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/borrow")
public class BorrowingController {
    private static final Logger logger = LoggerFactory.getLogger(BorrowingController.class);

    @Autowired
    private BorrowRequestRepository borrowRequestRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApprovalStepRepository approvalStepRepository;

    @PostMapping("/request/{equipmentId}")
    public ResponseEntity<?> requestEquipment(@PathVariable @SuppressWarnings("null") Long equipmentId, @RequestBody BorrowRequest requestDetails) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).get();
        
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (equipment.getAvailableQuantity() <= 0) {
            logger.warn("Equipment request failed: {} (ID: {}) is not available", equipment.getName(), equipmentId);
            return ResponseEntity.badRequest().body("Error: Equipment not available");
        }

        BorrowRequest borrowRequest = BorrowRequest.builder()
                .user(user)
                .equipment(equipment)
                .requestDate(LocalDateTime.now())
                .returnDate(requestDetails.getReturnDate())
                .status(RequestStatus.PENDING)
                .remarks(requestDetails.getRemarks())
                .designatedStaffApprover(requestDetails.getDesignatedStaffApprover())
                .build();

        @SuppressWarnings("null")
        BorrowRequest savedRequest = borrowRequestRepository.save(borrowRequest);

        logger.info("Borrow request created by {} for {} (ID: {})", username, equipment.getName(), equipmentId);
        return ResponseEntity.ok(savedRequest);
    }

    @PutMapping("/cancel/{requestId}")
    public ResponseEntity<?> cancelRequest(@PathVariable @SuppressWarnings("null") Long requestId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).body("Error: You can only cancel your own requests");
        }

        if (request.getStatus() == RequestStatus.APPROVED) {
            Equipment equipment = request.getEquipment();
            equipment.setAvailableQuantity(equipment.getAvailableQuantity() + 1);
            equipmentRepository.save(equipment);
        }

        request.setStatus(RequestStatus.CANCELLED);
        logger.info("Request ID: {} cancelled by user {}", requestId, username);
        return ResponseEntity.ok(borrowRequestRepository.save(request));
    }

    @GetMapping("/my-requests")
    public List<BorrowRequest> getMyRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).get();
        return borrowRequestRepository.findByUser(user);
    }

    @GetMapping("/all-requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'STAFF')")
    public List<BorrowRequest> getAllRequests() {
        return borrowRequestRepository.findAll();
    }

    @PutMapping("/approve/{requestId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'STAFF')")
    public ResponseEntity<?> approveRequest(@PathVariable @SuppressWarnings("null") Long requestId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).get();

        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            return ResponseEntity.badRequest().body("Error: Only pending requests can be approved");
        }

        List<ApprovalStep> steps = approvalStepRepository.findByEquipmentOrderBySequenceOrderAsc(request.getEquipment());
        Role requiredRole;

        if (steps.isEmpty()) {
            // Default Role-Based Hierarchy
            if (request.getUser().getRole() == Role.STUDENT) {
                // Student -> Step 1: STAFF, Step 2: LAB_ADMIN
                requiredRole = (request.getCurrentStep() == 1) ? Role.STAFF : Role.LAB_ADMIN;
            } else {
                // Staff/Admin -> Step 1: LAB_ADMIN
                requiredRole = Role.LAB_ADMIN;
            }
        } else {
            // Custom Configured Hierarchy
            ApprovalStep currentStepRule = steps.stream()
                    .filter(s -> s.getSequenceOrder() == request.getCurrentStep())
                    .findFirst()
                    .orElse(null);
            
            if (currentStepRule == null) {
                finalizeApproval(request);
                return ResponseEntity.ok(borrowRequestRepository.save(request));
            }
            requiredRole = currentStepRule.getRequiredRole();
        }

        // Check Authorization
        if (!currentUser.getRole().equals(requiredRole) && !currentUser.getRole().equals(Role.ADMIN)) {
            logger.warn("Unauthorized approval attempt for Request ID: {} by user {} (Required Role: {})", requestId, username, requiredRole);
            return ResponseEntity.status(403).body("Error: You are not authorized for this approval step (Required: " + requiredRole + ")");
        }

        // Specific logic for STAFF level: check if it's the designated approver
        if (requiredRole == Role.STAFF && request.getDesignatedStaffApprover() != null) {
            if (request.getDesignatedStaffApprover() == null || !request.getDesignatedStaffApprover().getUsername().equals(currentUser.getUsername())) {
                logger.warn("Unauthorized STAFF approval attempt for Request ID: {} by {}. Designated approver is {}", requestId, username, request.getDesignatedStaffApprover().getUsername());
                return ResponseEntity.status(403).body("Error: This request is specifically assigned to a different teacher for Level 1 approval.");
            }
        }

        // Audit Log
        request.setApprovedBy(currentUser.getUsername());
        request.setApproverRole(currentUser.getRole().name());
        request.setApprovedAt(LocalDateTime.now());

        // Determine if this is the final step
        boolean isFinalStep = false;
        if (steps.isEmpty()) {
            if (request.getUser().getRole() == Role.STUDENT) {
                isFinalStep = (request.getCurrentStep() >= 2);
            } else {
                isFinalStep = (request.getCurrentStep() >= 1);
            }
        } else {
            isFinalStep = (request.getCurrentStep() >= steps.size());
        }

        if (isFinalStep) {
            if (request.getStatus() != RequestStatus.APPROVED) {
                if (request.getEquipment().getAvailableQuantity() <= 0) {
                    return ResponseEntity.badRequest().body("Error: Equipment no longer available for final approval");
                }
                finalizeApproval(request);
            } else {
                // Already approved (was an extension), just set status to APPROVED again to clear extension flags if any
                request.setStatus(RequestStatus.APPROVED);
                request.setExtensionRequested(false);
            }
        } else {
            request.setCurrentStep(request.getCurrentStep() + 1);
            logger.info("Request ID: {} approved at Step {} by {}", requestId, request.getCurrentStep() - 1, username);
        }

        return ResponseEntity.ok(borrowRequestRepository.save(request));
    }

    private void finalizeApproval(BorrowRequest request) {
        Equipment equipment = request.getEquipment();
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() - 1);
        equipmentRepository.save(equipment);
        request.setStatus(RequestStatus.APPROVED);
    }

    @PutMapping("/reject/{requestId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'STAFF')")
    public ResponseEntity<?> rejectRequest(@PathVariable @SuppressWarnings("null") Long requestId, @RequestBody BorrowRequest rejectionDetails) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(RequestStatus.REJECTED);
        request.setRejectionRemarks(rejectionDetails.getRejectionRemarks());
        logger.info("Request ID: {} rejected by {}", requestId, SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(borrowRequestRepository.save(request));
    }

    @PutMapping("/return/{requestId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LAB_ADMIN', 'STAFF')")
    public ResponseEntity<?> returnEquipment(@PathVariable @SuppressWarnings("null") Long requestId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != RequestStatus.APPROVED) {
            return ResponseEntity.badRequest().body("Error: Only approved requests can be returned");
        }

        Equipment equipment = request.getEquipment();
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() + 1);
        equipmentRepository.save(equipment);

        request.setStatus(RequestStatus.RETURNED);
        request.setActualReturnDate(LocalDateTime.now());
        logger.info("Request ID: {} marked as RETURNED by {}", requestId, SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(borrowRequestRepository.save(request));
    }

    @PutMapping("/extend/{requestId}")
    public ResponseEntity<?> extendRequest(@PathVariable @SuppressWarnings("null") Long requestId, @RequestBody BorrowRequest extensionDetails) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).body("Error: You can only extend your own requests");
        }

        if (request.getStatus() != RequestStatus.APPROVED) {
            return ResponseEntity.badRequest().body("Error: You can only request an extension for approved and active requests");
        }

        request.setExtensionRequested(true);
        request.setExtendedReturnDate(extensionDetails.getExtendedReturnDate());
        request.setRemarks(request.getRemarks() + " [EXTENSION REQUESTED]");
        
        // Push the request back into the approval pipeline
        request.setStatus(RequestStatus.PENDING);
        request.setCurrentStep(1); // Reset to level 1 approval
        request.setApprovedBy(null);
        request.setApproverRole(null);
        request.setApprovedAt(null);

        return ResponseEntity.ok(borrowRequestRepository.save(request));
    }
}
