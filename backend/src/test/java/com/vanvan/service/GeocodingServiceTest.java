package com.vanvan.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vanvan.exception.InvalidValueException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class GeocodingServiceTest {

    private RestTemplate restTemplate;
    private GeocodingService geocodingService;

    @BeforeEach
    void setUp() {
        restTemplate = mock(RestTemplate.class);
        geocodingService = new GeocodingService(restTemplate, new ObjectMapper());
    }

    @Test
    void getCoordinates_success() {
        String json = "[{\"lat\":\"-8.8884\",\"lon\":\"-36.4932\"}]";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(json);

        double[] result = geocodingService.getCoordinates("Garanhuns, PE");

        assertNotNull(result);
        assertEquals(2, result.length);
        assertEquals(-8.8884, result[0], 0.001);
        assertEquals(-36.4932, result[1], 0.001);
    }

    @Test
    void getCoordinates_emptyResult_throwsInvalidValue() {
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn("[]");

        assertThrows(InvalidValueException.class,
                () -> geocodingService.getCoordinates("CidadeInexistente"));
    }

    @Test
    void getCoordinates_nullResponse_throwsInvalidValue() {
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(null);

        assertThrows(InvalidValueException.class,
                () -> geocodingService.getCoordinates("Garanhuns"));
    }

    @Test
    void getCoordinates_restTemplateThrows_throwsInvalidValue() {
        when(restTemplate.getForObject(anyString(), eq(String.class)))
                .thenThrow(new RuntimeException("conexão recusada"));

        assertThrows(InvalidValueException.class,
                () -> geocodingService.getCoordinates("Garanhuns"));
    }

    @Test
    void getCoordinates_multipleResults_returnsFirst() {
        String json = """
                [
                  {"lat":"-8.8884","lon":"-36.4932"},
                  {"lat":"-8.9000","lon":"-36.5000"}
                ]
                """;
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(json);

        double[] result = geocodingService.getCoordinates("Garanhuns");

        assertEquals(-8.8884, result[0], 0.001);
        assertEquals(-36.4932, result[1], 0.001);
    }

    @Test
    void getCoordinates_invalidJson_throwsInvalidValue() {
        when(restTemplate.getForObject(anyString(), eq(String.class)))
                .thenReturn("isso nao e json valido {{{");

        assertThrows(InvalidValueException.class,
                () -> geocodingService.getCoordinates("Garanhuns"));
    }
}