package com.example.backendstore.entity.controller;

import com.example.backendstore.entity.User;
import com.example.backendstore.entity.repository.UserRepository;
import com.example.backendstore.entity.service.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/register")
    public String getRegister() {
        return "Please use POST request to /api/auth/register with JSON body: {\"username\": \"testuser\", \"password\": \"password123\"}";
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Користувач із таким ім'ям уже існує");
        }

        // Шифруємо пароль і зберігаємо користувача
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        // Автоматично автентифікуємо користувача після реєстрації
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );
            String jwt = jwtUtil.generateToken(user.getUsername());
            return ResponseEntity.ok(jwt); // Повертаємо JWT-токен
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Помилка при автентифікації після реєстрації: " + e.getMessage());
        }
    }

    @GetMapping("/login")
    public String getLogin() {
        return "Please use POST request to /api/auth/login with JSON body: {\"username\": \"testuser\", \"password\": \"password123\"}";
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            String jwt = jwtUtil.generateToken(loginRequest.getUsername());
            return ResponseEntity.ok(jwt);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Неправильне ім'я користувача або пароль");
        }
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}