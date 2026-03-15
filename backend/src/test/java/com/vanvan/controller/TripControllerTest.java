package com.vanvan.controller;

import com.vanvan.dto.TripDetailsDTO;
import com.vanvan.dto.UpdateTripStatusDTO;
import com.vanvan.enums.TripStatus;
import com.vanvan.service.TripService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TripControllerTest {

    private MockMvc mockMvc;

    @Mock private TripService tripService;

    @InjectMocks
    private TripController tripController;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(tripController)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setMessageConverters(
                        new org.springframework.http.converter.json.GsonHttpMessageConverter(),
                        new org.springframework.http.converter.StringHttpMessageConverter()
                )
                .setControllerAdvice(new com.vanvan.exception.GlobalExceptionHandler())
                .build();
    }

    @Test
    void getTripById_returns200() throws Exception {
        TripDetailsDTO dto = new TripDetailsDTO(
                1L, LocalDate.now(), LocalTime.of(10, 0),
                "Motorista", List.of(), "Caruaru", "Garanhuns",
                1.5, 130.0, 90.0, 195.0, TripStatus.COMPLETED);

        when(tripService.getTripDetails(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/trips/1"))
                .andExpect(status().isOk());
    }

    @Test
    void listTrips_returns200() throws Exception {
        when(tripService.getTripHistory(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/trips/history")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    void updateStatus_returns200() throws Exception {
        TripDetailsDTO dto = new TripDetailsDTO(
                1L, LocalDate.now(), LocalTime.of(10, 0),
                "Motorista", List.of(), "Caruaru", "Garanhuns",
                1.5, 130.0, 90.0, 195.0, TripStatus.IN_PROGRESS);

        when(tripService.updateStatus(any(), any())).thenReturn(dto);

        UpdateTripStatusDTO body = new UpdateTripStatusDTO();
        body.setStatus(TripStatus.IN_PROGRESS);

        mockMvc.perform(patch("/api/trips/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    void getMonitoring_returns200() throws Exception {
        when(tripService.getMonitoringData(any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/trips/monitoring")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }
}