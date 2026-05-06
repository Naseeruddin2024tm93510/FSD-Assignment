package com.nexus.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "equipment")
public class Equipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String category;
    
    private String description;
    
    private String conditionStatus; // GOOD, DAMAGED, UNDER_REPAIR
    
    private Integer totalQuantity;
    
    private Integer availableQuantity;
    
    private String imageUrl;
}
