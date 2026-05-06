package com.nexus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.model.*;
import com.nexus.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class BorrowingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BorrowRequestRepository borrowRequestRepository;

    @MockBean
    private EquipmentRepository equipmentRepository;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private Equipment testEquipment;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setRole(Role.STUDENT);

        testEquipment = new Equipment();
        testEquipment.setId(1L);
        testEquipment.setName("Projector");
        testEquipment.setAvailableQuantity(5);
        testEquipment.setTotalQuantity(5);

        Mockito.when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        Mockito.when(equipmentRepository.findById(1L)).thenReturn(Optional.of(testEquipment));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testRequestEquipment_Success() throws Exception {
        BorrowRequest requestDetails = new BorrowRequest();
        requestDetails.setReturnDate(LocalDate.now().plusDays(5));
        requestDetails.setRemarks("Study project");

        @SuppressWarnings("null")
        BorrowRequest saveArg = any(BorrowRequest.class);
        Mockito.when(borrowRequestRepository.save(saveArg)).thenAnswer(i -> i.getArguments()[0]);

        @SuppressWarnings("null")
        MediaType contentType = MediaType.APPLICATION_JSON;
        @SuppressWarnings("null")
        String content = objectMapper.writeValueAsString(requestDetails);

        mockMvc.perform(post("/api/borrow/request/1")
                .contentType(contentType)
                .content(content))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.remarks").value("Study project"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testRequestEquipment_NotAvailable() throws Exception {
        testEquipment.setAvailableQuantity(0);

        BorrowRequest requestDetails = new BorrowRequest();
        requestDetails.setReturnDate(LocalDate.now().plusDays(5));

        @SuppressWarnings("null")
        MediaType contentType = MediaType.APPLICATION_JSON;
        @SuppressWarnings("null")
        String content = objectMapper.writeValueAsString(requestDetails);

        mockMvc.perform(post("/api/borrow/request/1")
                .contentType(contentType)
                .content(content))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "testuser")
    void testCancelRequest_Success() throws Exception {
        BorrowRequest request = new BorrowRequest();
        request.setId(1L);
        request.setUser(testUser);
        request.setStatus(RequestStatus.PENDING);

        Mockito.when(borrowRequestRepository.findById(1L)).thenReturn(Optional.of(request));
        @SuppressWarnings("null")
        BorrowRequest saveArg = any(BorrowRequest.class);
        Mockito.when(borrowRequestRepository.save(saveArg)).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(put("/api/borrow/cancel/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
