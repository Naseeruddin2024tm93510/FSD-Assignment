package com.nexus.controller;

import com.nexus.model.*;
import com.nexus.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class InventoryReversalTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BorrowRequestRepository borrowRequestRepository;

    @MockBean
    private EquipmentRepository equipmentRepository;

    @MockBean
    private UserRepository userRepository;

    private User adminUser;
    private Equipment testEquipment;
    private BorrowRequest testRequest;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setRole(Role.ADMIN);

        testEquipment = new Equipment();
        testEquipment.setId(1L);
        testEquipment.setName("Camera");
        testEquipment.setAvailableQuantity(4);
        testEquipment.setTotalQuantity(5);

        testRequest = new BorrowRequest();
        testRequest.setId(1L);
        testRequest.setEquipment(testEquipment);
        testRequest.setStatus(RequestStatus.APPROVED);

        Mockito.when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        Mockito.when(borrowRequestRepository.findById(1L)).thenReturn(Optional.of(testRequest));
        Mockito.when(equipmentRepository.findById(1L)).thenReturn(Optional.of(testEquipment));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testReturnEquipment_IncrementsInventory() throws Exception {
        @SuppressWarnings("null")
        BorrowRequest saveArgBody = any(BorrowRequest.class);
        Mockito.when(borrowRequestRepository.save(saveArgBody)).thenAnswer(i -> i.getArguments()[0]);
        
        @SuppressWarnings("null")
        Equipment saveArgEq = any(Equipment.class);
        Mockito.when(equipmentRepository.save(saveArgEq)).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(put("/api/borrow/return/1"))
                .andExpect(status().isOk());

        ArgumentCaptor<Equipment> equipmentCaptor = ArgumentCaptor.forClass(Equipment.class);
        Mockito.verify(equipmentRepository).save(equipmentCaptor.capture());
        
        // Initial was 4, after return it should be 5
        assertEquals(5, equipmentCaptor.getValue().getAvailableQuantity());
    }
}
