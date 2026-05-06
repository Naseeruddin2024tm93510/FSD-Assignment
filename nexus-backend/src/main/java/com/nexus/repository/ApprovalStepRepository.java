package com.nexus.repository;

import com.nexus.model.ApprovalStep;
import com.nexus.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, Long> {
    List<ApprovalStep> findByEquipmentOrderBySequenceOrderAsc(Equipment equipment);
}
