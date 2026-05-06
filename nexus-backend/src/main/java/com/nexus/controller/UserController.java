package com.nexus.controller;

import com.nexus.model.Role;
import com.nexus.model.User;
import com.nexus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/staff")
    public List<User> getStaffMembers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STAFF && u.isEnabled())
                .collect(Collectors.toList());
    }
}
