package com.nexus.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "borrow_requests")
public class BorrowRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    private LocalDateTime requestDate;
    private LocalDate returnDate; // Expected Return Date
    private LocalDateTime actualReturnDate;
    
    @Enumerated(EnumType.STRING)
    private RequestStatus status; // PENDING, APPROVED, REJECTED, RETURNED
    
    @Builder.Default
    private int currentStep = 1;

    private String remarks; // Purpose
    private String rejectionRemarks;

    @ManyToOne
    @JoinColumn(name = "staff_approver_id")
    private User designatedStaffApprover;

    private String approvedBy;
    private String approverRole;
    private LocalDateTime approvedAt;

    @Builder.Default
    private boolean extensionRequested = false;
    private LocalDate extendedReturnDate;
}
