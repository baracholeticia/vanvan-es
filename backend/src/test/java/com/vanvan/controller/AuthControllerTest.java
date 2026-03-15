package com.vanvan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vanvan.config.security.JwtFilter;
import com.vanvan.config.security.JwtService;
import com.vanvan.model.Passenger;
import com.vanvan.repository.UserRepository;
import com.vanvan.service.UserService;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AuthController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtFilter.class
        )
)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private AuthenticationManager authenticationManager;
    @MockitoBean private UserService userService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserRepository userRepository;
    @MockitoBean private Validator validator;
    @MockitoBean private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void register_success_returns201() throws Exception {
        String body = """
                {
                  "name": "Allice Amorim",
                  "email": "allice@email.com",
                  "password": "senha123",
                  "cpf": "52998224725",
                  "phone": "81988888888",
                  "role": "passenger",
                  "birthDate": "01/01/2000"
                }
                """;

        Passenger passenger = new Passenger("Allice Amorim", "52998224725", "81988888888",
                "allice@email.com", "senha123", LocalDate.of(2000, 1, 1));

        when(userService.register(any())).thenReturn(passenger);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(csrf()))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser
    void login_success_returns200() throws Exception {
        String body = """
                {"email": "allice@email.com", "password": "senha123"}
                """;

        Passenger passenger = new Passenger("Allice", "52998224725", "81988888888",
                "allice@email.com", "senha123", LocalDate.of(2000, 1, 1));

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(passenger);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(jwtService.generateToken("allice@email.com")).thenReturn("mocked-jwt-token");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void login_badCredentials_returns401() throws Exception {
        String body = """
                {"email": "wrong@email.com", "password": "errada"}
                """;

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }
}