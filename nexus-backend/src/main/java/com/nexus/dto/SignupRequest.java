package com.nexus.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String role; // STUDENT, STAFF, ADMIN
}
