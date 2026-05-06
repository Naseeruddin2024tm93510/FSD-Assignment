package com.nexus.controller;

import com.nexus.dto.JwtResponse;
import com.nexus.dto.LoginRequest;
import com.nexus.dto.SignupRequest;
import com.nexus.model.Role;
import com.nexus.model.User;
import com.nexus.repository.UserRepository;
import com.nexus.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername()).get();

            return ResponseEntity.ok(new JwtResponse(jwt, 
                                     userDetails.getUsername(), 
                                     user.getEmail(), 
                                     user.getRole().name()));
        } catch (org.springframework.security.authentication.DisabledException e) {
            return ResponseEntity.status(403).body("Error: Account is pending admin approval.");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Error: Invalid username or password.");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByUsername(signUpRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(Role.valueOf(signUpRequest.getRole().toUpperCase()))
                .build();

        @SuppressWarnings("null")
        User savedUser = user;
        userRepository.save(savedUser);

        return ResponseEntity.ok("User registered successfully!");
    }
}
