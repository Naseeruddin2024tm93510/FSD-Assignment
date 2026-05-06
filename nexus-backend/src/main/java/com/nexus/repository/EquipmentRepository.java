package com.nexus.repository;

import com.nexus.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByCategory(String category);
    List<Equipment> findByNameContainingIgnoreCase(String name);
}
