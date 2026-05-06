package com.nexus.config;

import com.nexus.model.Equipment;
import com.nexus.model.Role;
import com.nexus.model.User;
import com.nexus.repository.EquipmentRepository;
import com.nexus.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UserRepository userRepository, 
                               EquipmentRepository equipmentRepository, 
                               PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Users
            createUserIfNotFound(userRepository, passwordEncoder, "admin", "admin123", "admin@nexus.edu", Role.ADMIN);
            
            // Seed Lab Admins (4)
            createUserIfNotFound(userRepository, passwordEncoder, "labadmin1", "labadmin123", "labadmin1@nexus.edu", Role.LAB_ADMIN);
            createUserIfNotFound(userRepository, passwordEncoder, "labadmin2", "labadmin123", "labadmin2@nexus.edu", Role.LAB_ADMIN);
            createUserIfNotFound(userRepository, passwordEncoder, "labadmin3", "labadmin123", "labadmin3@nexus.edu", Role.LAB_ADMIN);
            createUserIfNotFound(userRepository, passwordEncoder, "labadmin4", "labadmin123", "labadmin4@nexus.edu", Role.LAB_ADMIN);
            
            // Seed Staff (2)
            createUserIfNotFound(userRepository, passwordEncoder, "teacher_a", "teacher123", "teacher_a@nexus.edu", Role.STAFF);
            createUserIfNotFound(userRepository, passwordEncoder, "teacher_b", "teacher123", "teacher_b@nexus.edu", Role.STAFF);

            // Seed Students (3)
            createUserIfNotFound(userRepository, passwordEncoder, "stu1", "stu123", "stu1@nexus.edu", Role.STUDENT);
            createUserIfNotFound(userRepository, passwordEncoder, "stu2", "stu123", "stu2@nexus.edu", Role.STUDENT);
            createUserIfNotFound(userRepository, passwordEncoder, "stu3", "stu123", "stu3@nexus.edu", Role.STUDENT);

            // Seed Equipment
            if (equipmentRepository.count() == 0) {
                @SuppressWarnings("null")
                Iterable<Equipment> equipmentList = Arrays.asList(
                    Equipment.builder()
                        .name("Professional DSLR Camera")
                        .category("Tech")
                        .description("Canon EOS R5 with 24-70mm lens. High-quality photography.")
                        .totalQuantity(3).availableQuantity(3).conditionStatus("GOOD").build(),
                    Equipment.builder()
                        .name("Sports Kit - Cricket")
                        .category("Sports")
                        .description("Full cricket kit including bats, pads, and helmets.")
                        .totalQuantity(5).availableQuantity(5).conditionStatus("GOOD").build(),
                    Equipment.builder()
                        .name("Digital Oscilloscope")
                        .category("Lab")
                        .description("Rigol DS1054Z 50MHz Digital Oscilloscope.")
                        .totalQuantity(10).availableQuantity(10).conditionStatus("GOOD").build(),
                    Equipment.builder()
                        .name("Acoustic Guitar")
                        .category("Music")
                        .description("Yamaha F310 Acoustic Guitar for music sessions.")
                        .totalQuantity(4).availableQuantity(4).conditionStatus("GOOD").build(),
                    Equipment.builder()
                        .name("3D Printer")
                        .category("Tech")
                        .description("Creality Ender 3 Pro 3D Printer.")
                        .totalQuantity(2).availableQuantity(2).conditionStatus("GOOD").build(),
                    Equipment.builder()
                        .name("Arduino Uno Kit")
                        .category("Lab")
                        .description("Starter kit with breadboard and sensors.")
                        .totalQuantity(20).availableQuantity(20).conditionStatus("GOOD").build(),
                    Equipment.builder()
                        .name("Basketball")
                        .category("Sports")
                        .description("Official size indoor/outdoor basketball.")
                        .totalQuantity(8).availableQuantity(8).conditionStatus("GOOD").build(),
                    Equipment.builder()
                        .name("Microphone Stand")
                        .category("Music")
                        .description("Adjustable boom microphone stand.")
                        .totalQuantity(6).availableQuantity(6).conditionStatus("GOOD").build()
                );
                equipmentRepository.saveAll(equipmentList);
            }
        };
    }

    private void createUserIfNotFound(UserRepository repo, PasswordEncoder encoder, String username, String password, String email, Role role) {
        if (repo.findByUsername(username).isEmpty()) {
            @SuppressWarnings("null")
            User newUser = User.builder()
                    .username(username)
                    .password(encoder.encode(password))
                    .email(email)
                    .role(role)
                    .enabled(true)
                    .build();
            repo.save(newUser);
        }
    }
}
