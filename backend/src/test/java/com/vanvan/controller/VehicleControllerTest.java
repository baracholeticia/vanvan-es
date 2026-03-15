package com.vanvan.controller;

import com.vanvan.config.security.JwtFilter;
import com.vanvan.config.security.JwtService;
import com.vanvan.dto.VehicleResponseDTO;
import com.vanvan.repository.UserRepository;
import com.vanvan.service.VehicleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = VehicleController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtFilter.class
        )
)
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private VehicleService vehicleService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private UserRepository userRepository;

    private VehicleResponseDTO buildResponse() {
        VehicleResponseDTO dto = new VehicleResponseDTO();
        dto.setId(UUID.randomUUID());
        dto.setModelName("Sprinter");
        dto.setLicensePlate("ABC1D23");
        dto.setDocumentPath("vehicles/documents/doc.pdf");
        dto.setDriverId(UUID.randomUUID());
        dto.setDriverName("Motorista");
        return dto;
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void createVehicle_returns201() throws Exception {
        when(vehicleService.createVehicle(any(), any(), any(), any(), any()))
                .thenReturn(buildResponse());

        MockMultipartFile document = new MockMultipartFile(
                "document", "doc.pdf", "application/pdf", "content".getBytes());

        mockMvc.perform(multipart("/api/vehicles")
                        .file(document)
                        .param("driverId", UUID.randomUUID().toString())
                        .param("modelName", "Sprinter")
                        .param("licensePlate", "ABC1D23")
                        .with(csrf()))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void getVehiclesByDriver_returns200() throws Exception {
        when(vehicleService.getVehiclesByDriver(any())).thenReturn(List.of(buildResponse()));

        mockMvc.perform(get("/api/vehicles/driver/" + UUID.randomUUID()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void getVehicleById_returns200() throws Exception {
        when(vehicleService.getVehicleById(any())).thenReturn(buildResponse());

        mockMvc.perform(get("/api/vehicles/" + UUID.randomUUID()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllVehicles_returns200() throws Exception {
        when(vehicleService.getAllVehicles()).thenReturn(List.of(buildResponse()));

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void updateVehicle_returns200() throws Exception {
        when(vehicleService.updateVehicle(any(), any(), any(), any(), any()))
                .thenReturn(buildResponse());

        UUID vehicleId = UUID.randomUUID();
        mockMvc.perform(multipart("/api/vehicles/" + vehicleId)
                        .param("modelName", "Nova Sprinter")
                        .with(request -> { request.setMethod("PUT"); return request; })
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void deleteVehicle_returns204() throws Exception {
        doNothing().when(vehicleService).deleteVehicle(any());

        mockMvc.perform(delete("/api/vehicles/" + UUID.randomUUID())
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void getVehicleDocument_returns200() throws Exception {
        when(vehicleService.getVehicleDocument(any())).thenReturn("pdf".getBytes());

        mockMvc.perform(get("/api/vehicles/" + UUID.randomUUID() + "/document"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void getVehiclePhoto_returns200() throws Exception {
        when(vehicleService.getVehiclePhoto(any())).thenReturn("photo".getBytes());

        mockMvc.perform(get("/api/vehicles/" + UUID.randomUUID() + "/photo"))
                .andExpect(status().isOk());
    }
}