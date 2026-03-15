package com.vanvan.controller;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doThrow;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.vanvan.service.AdminService;
import com.vanvan.service.VehicleService;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AdminService adminService;

    @Mock
    private VehicleService vehicleService;

    @InjectMocks
    private AdminController adminController;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
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
}  