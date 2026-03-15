package com.vanvan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vanvan.dto.*;
import com.vanvan.enums.RegistrationStatus;
import com.vanvan.exception.GlobalExceptionHandler;
import com.vanvan.model.Passenger;
import com.vanvan.model.Pricing;
import com.vanvan.service.AdminService;
import com.vanvan.service.PricingService;
import com.vanvan.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.core.MethodParameter;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// 1. Apenas declara o WebMvcTest limpo
@WebMvcTest(controllers = AdminController.class)
// 2. Desativa a execução dos filtros de segurança no MockMvc
@AutoConfigureMockMvc(addFilters = false) 
@Import(GlobalExceptionHandler.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private PricingService pricingService;

    @MockitoBean
    private VehicleService vehicleService;

    private static final UserDetails userDetailsMock = mock(UserDetails.class);

    @TestConfiguration
    static class WebConfig implements WebMvcConfigurer {
        @Override
        public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
            resolvers.add(new HandlerMethodArgumentResolver() {
                @Override
                public boolean supportsParameter(MethodParameter parameter) {
                    return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
                }

                @Override
                public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                              NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                    return userDetailsMock;
                }
            });
        }
    }

    @BeforeEach
    void setUp() {
        reset(userDetailsMock);
    }

    @Test
    @DisplayName("Cobre listAllVehicles - Status 200")
    void listAllVehiclesSuccess() throws Exception {
        mockMvc.perform(get("/api/admin/vehicles"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Cobre catch de deleteClient - Status 400")
    void deleteClientError() throws Exception {
        UUID id = UUID.randomUUID();
        doThrow(new IllegalArgumentException("Erro de negócio"))
                .when(adminService).deleteClient(id);
        mockMvc.perform(delete("/api/admin/clients/{id}", id))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Cobre deleteDriver - Status 204")
    void deleteDriverSuccess() throws Exception {
        UUID id = UUID.randomUUID();
        mockMvc.perform(delete("/api/admin/drivers/{id}", id))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Deve listar motoristas - Status 200")
    void listDrivers_returns200() throws Exception {
        when(adminService.listDrivers(any(), any())).thenReturn(new PageImpl<>(List.of()));
        mockMvc.perform(get("/api/admin/drivers")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve atualizar status do motorista - Status 200")
    void updateDriverStatus_returns200() throws Exception {
        DriverAdminResponseDTO dto = new DriverAdminResponseDTO(
                UUID.randomUUID(), "João", "joao@email.com", "81988888888",
                "52998224725", "12345678900", LocalDate.of(1990, 1, 1),
                RegistrationStatus.APPROVED, null);
        when(adminService.updateDriverStatus(any(), any())).thenReturn(dto);
        String body = objectMapper.writeValueAsString(
                new DriverStatusUpdateDTO(RegistrationStatus.APPROVED, null));
        mockMvc.perform(put("/api/admin/drivers/" + UUID.randomUUID() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve atualizar dados do motorista - Status 200")
    void updateDriver_returns200() throws Exception {
        DriverAdminResponseDTO dto = new DriverAdminResponseDTO(
                UUID.randomUUID(), "João", "joao@email.com", "81988888888",
                "52998224725", "12345678900", LocalDate.of(1990, 1, 1),
                RegistrationStatus.APPROVED, null);
        when(adminService.updateDriver(any(), any())).thenReturn(dto);
        String body = objectMapper.writeValueAsString(
                new DriverUpdateDTO("João", null, null, null, null, null));
        mockMvc.perform(put("/api/admin/drivers/" + UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve listar clientes - Status 200")
    void listClients_returns200() throws Exception {
        when(adminService.listClients(any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of()));
        mockMvc.perform(get("/api/admin/clients")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve buscar cliente por id - Status 200")
    void getClientById_returns200() throws Exception {
        Passenger passenger = new Passenger("Alice", "52998224725", "81988888888",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));
        when(adminService.getClientById(any())).thenReturn(passenger);
        mockMvc.perform(get("/api/admin/clients/" + UUID.randomUUID()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve criar cliente - Status 200")
    void createClient_returns200() throws Exception {
        Passenger passenger = new Passenger("Alice", "52998224725", "81988888888",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));
        when(adminService.createClient(any())).thenReturn(passenger);

        String body = objectMapper.writeValueAsString(passenger);
        mockMvc.perform(post("/api/admin/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve retornar 400 quando criar cliente lançar exceção")
    void createClient_throws_returns400() throws Exception {
        when(adminService.createClient(any()))
                .thenThrow(new IllegalArgumentException("Email já existe"));

        Passenger passenger = new Passenger("Alice", "52998224725", "81988888888",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));
        String body = objectMapper.writeValueAsString(passenger);
        mockMvc.perform(post("/api/admin/clients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve atualizar cliente - Status 200")
    void updateClient_returns200() throws Exception {
        Passenger passenger = new Passenger("Alice", "52998224725", "81988888888",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));
        when(adminService.updateClient(any(), any())).thenReturn(passenger);

        String body = objectMapper.writeValueAsString(passenger);
        mockMvc.perform(put("/api/admin/clients/" + UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve retornar 400 quando atualizar cliente lançar exceção")
    void updateClient_throws_returns400() throws Exception {
        when(adminService.updateClient(any(), any()))
                .thenThrow(new IllegalArgumentException("Cliente não encontrado"));

        Passenger passenger = new Passenger("Alice", "52998224725", "81988888888",
                "alice@email.com", "senha", LocalDate.of(2000, 1, 1));
        String body = objectMapper.writeValueAsString(passenger);
        mockMvc.perform(put("/api/admin/clients/" + UUID.randomUUID())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Deve buscar pricing - Status 200")
    void getPricing_returns200() throws Exception {
        when(pricingService.getPricing()).thenReturn(new Pricing());
        mockMvc.perform(get("/api/admin/settings/pricing"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve atualizar pricing - Status 200")
    void updatePricing_returns200() throws Exception {
        when(userDetailsMock.getUsername()).thenReturn("admin@email.com");
        when(pricingService.updatePricing(any(), any())).thenReturn(new Pricing());
        String body = objectMapper.writeValueAsString(
                new PricingUpdateDTO(10.0, 1.5, 2.5, 15.0));
        mockMvc.perform(put("/api/admin/settings/pricing")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve listar veículos por motorista - Status 200")
    void listVehiclesByDriver_returns200() throws Exception {
        when(vehicleService.getVehiclesByDriver(any())).thenReturn(List.of());
        mockMvc.perform(get("/api/admin/vehicles/driver/" + UUID.randomUUID()))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve buscar veículo por id - Status 200")
    void getVehicleById_returns200() throws Exception {
        when(vehicleService.getVehicleById(any())).thenReturn(new VehicleResponseDTO());
        mockMvc.perform(get("/api/admin/vehicles/" + UUID.randomUUID()))
                .andExpect(status().isOk());
    }
}