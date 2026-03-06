package com.vanvan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vanvan.dto.*;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.vanvan.config.security.JwtService;
import com.vanvan.service.UserService;
import com.vanvan.model.Driver;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolation;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
@Validated
public class AuthController {

    private AuthenticationManager authenticationManager;

    private final UserService userService;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody RegisterDTO data) {
        var user = userService.register(data);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UserResponseDTO.from(user));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(@RequestBody LoginRequestDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());

        var auth = this.authenticationManager.authenticate(usernamePassword);

        var user = (UserDetails) auth.getPrincipal();

        //adicionado devido a warning
        assert user != null;

        String token = jwtService.generateToken(user.getUsername());

        return ResponseEntity.ok(new TokenResponseDTO(token));

    }

    /**
     * Endpoint para registro de motorista com veículo.
     * Recebe os dados do motorista como JSON e os arquivos do veículo como multipart.
     */
    @PostMapping(value = "/register-driver", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DriverWithVehicleResponseDTO> registerDriverWithVehicle(
            @RequestPart("driver") String driverJson,
            @RequestPart("vehicleDocument") MultipartFile vehicleDocument,
            @RequestPart(value = "vehiclePhoto", required = false) MultipartFile vehiclePhoto
    ) throws IOException {

        // Deserializar o JSON do motorista
        DriverRegisterRequestDTO driverData = objectMapper.readValue(driverJson, DriverRegisterRequestDTO.class);

        // Validar manualmente o DTO usando o Validator
        Set<ConstraintViolation<DriverRegisterRequestDTO>> violations = validator.validate(driverData);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            throw new IllegalArgumentException("Erro de validação: " + errorMessage);
        }

        // Registrar o motorista e o veículo atomicamente via UserService
        DriverWithVehicleResponseDTO result = userService.registerDriverWithVehicle(
                driverData,
                driverData.getVehicleModelName(),
                driverData.getVehicleLicensePlate(),
                vehicleDocument,
                vehiclePhoto
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(result);
    }

}