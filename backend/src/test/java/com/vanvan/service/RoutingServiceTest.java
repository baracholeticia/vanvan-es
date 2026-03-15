package com.vanvan.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vanvan.exception.UnknownErrorException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class RoutingServiceTest {

    private RestTemplate restTemplate;
    private RoutingService routingService;

    private final double[] origin = {-8.8884, -36.4932};      // Garanhuns
    private final double[] destination = {-8.2838, -35.9731}; // Caruaru

    @BeforeEach
    void setUp() {
        restTemplate = mock(RestTemplate.class);
        routingService = new RoutingService(restTemplate, new ObjectMapper());
    }

    @Test
    void calculateRoute_success() {
        String json = """
                {
                  "code": "Ok",
                  "routes": [
                    {
                      "distance": 130000.0,
                      "duration": 5400.0
                    }
                  ]
                }
                """;
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(json);

        RoutingService.RouteResult result = routingService.calculateRoute(origin, destination);

        assertNotNull(result);
        assertEquals(130.0, result.distanceKm(), 0.01);
        assertEquals(90.0, result.durationMinutes(), 0.01);
    }

    @Test
    void calculateRoute_osrmReturnsErrorCode_throws() {
        String json = """
                {
                  "code": "NoRoute",
                  "routes": []
                }
                """;
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(json);

        assertThrows(UnknownErrorException.class,
                () -> routingService.calculateRoute(origin, destination));
    }

    @Test
    void calculateRoute_restTemplateThrows_throws() {
        when(restTemplate.getForObject(anyString(), eq(String.class)))
                .thenThrow(new RuntimeException("timeout"));

        assertThrows(UnknownErrorException.class,
                () -> routingService.calculateRoute(origin, destination));
    }

    @Test
    void calculateRoute_invalidJson_throws() {
        when(restTemplate.getForObject(anyString(), eq(String.class)))
                .thenReturn("isso nao e json {{{");

        assertThrows(UnknownErrorException.class,
                () -> routingService.calculateRoute(origin, destination));
    }

    @Test
    void calculateRoute_zeroDistance_returnsZero() {
        String json = """
                {
                  "code": "Ok",
                  "routes": [
                    {
                      "distance": 0.0,
                      "duration": 0.0
                    }
                  ]
                }
                """;
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(json);

        RoutingService.RouteResult result = routingService.calculateRoute(origin, origin);

        assertEquals(0.0, result.distanceKm(), 0.001);
        assertEquals(0.0, result.durationMinutes(), 0.001);
    }

    @Test
    void calculateRoute_longDistance_convertsCorrectly() {
        String json = """
                {
                  "code": "Ok",
                  "routes": [
                    {
                      "distance": 2500000.0,
                      "duration": 86400.0
                    }
                  ]
                }
                """;
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(json);

        RoutingService.RouteResult result = routingService.calculateRoute(origin, destination);

        assertEquals(2500.0, result.distanceKm(), 0.01);
        assertEquals(1440.0, result.durationMinutes(), 0.01);
    }
}