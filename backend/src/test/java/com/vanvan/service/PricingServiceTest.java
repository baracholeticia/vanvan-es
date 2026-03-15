package com.vanvan.service;

import com.vanvan.dto.PricingUpdateDTO;
import com.vanvan.model.Pricing;
import com.vanvan.model.PricingAuditLog;
import com.vanvan.repository.PricingAuditLogRepository;
import com.vanvan.repository.PricingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PricingServiceTest {

    private PricingRepository pricingRepository;
    private PricingAuditLogRepository auditLogRepository;
    private PricingService pricingService;

    @BeforeEach
    void setUp() {
        pricingRepository = mock(PricingRepository.class);
        auditLogRepository = mock(PricingAuditLogRepository.class);
        pricingService = new PricingService(pricingRepository, auditLogRepository);
    }

    // getPricing

    @Test
    void getPricing_existingPricing_returnsIt() {
        Pricing existing = new Pricing();
        existing.setMinimumFare(10.0);
        when(pricingRepository.findById("default")).thenReturn(Optional.of(existing));

        Pricing result = pricingService.getPricing();

        assertNotNull(result);
        assertEquals(10.0, result.getMinimumFare());
        verify(pricingRepository, never()).save(any());
    }

    @Test
    void getPricing_notFound_initializesDefault() {
        when(pricingRepository.findById("default")).thenReturn(Optional.empty());
        when(pricingRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Pricing result = pricingService.getPricing();

        assertNotNull(result);
        assertEquals(10.0, result.getMinimumFare());
        assertEquals(1.50, result.getPerKmRate());
        assertEquals(2.50, result.getCancellationFee());
        assertEquals(15.0, result.getCommissionRate());
        verify(pricingRepository).save(any(Pricing.class));
    }

    // updatePricing

    @Test
    void updatePricing_success_updatesAllFields() {
        Pricing current = new Pricing();
        current.setMinimumFare(10.0);
        current.setPerKmRate(1.50);
        current.setCancellationFee(2.50);
        current.setCommissionRate(15.0);

        when(pricingRepository.findById("default")).thenReturn(Optional.of(current));
        when(pricingRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(auditLogRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        PricingUpdateDTO dto = new PricingUpdateDTO(20.0, 2.0, 5.0, 10.0);

        Pricing result = pricingService.updatePricing(dto, "admin@vanvan.com");

        assertEquals(20.0, result.getMinimumFare());
        assertEquals(2.0, result.getPerKmRate());
        assertEquals(5.0, result.getCancellationFee());
        assertEquals(10.0, result.getCommissionRate());
        assertEquals("admin@vanvan.com", result.getUpdatedBy());
        assertNotNull(result.getLastUpdated());
    }

    @Test
    void updatePricing_savesAuditLog() {
        Pricing current = new Pricing();
        current.setMinimumFare(10.0);
        current.setPerKmRate(1.5);
        current.setCancellationFee(2.5);
        current.setCommissionRate(15.0);

        when(pricingRepository.findById("default")).thenReturn(Optional.of(current));
        when(pricingRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(auditLogRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        PricingUpdateDTO dto = new PricingUpdateDTO(25.0, 3.0, 6.0, 12.0);
        pricingService.updatePricing(dto, "admin@test.com");

        verify(auditLogRepository).save(any(PricingAuditLog.class));
    }

    @Test
    void updatePricing_initializesPricingIfNotExists() {
        when(pricingRepository.findById("default")).thenReturn(Optional.empty());
        when(pricingRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(auditLogRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        PricingUpdateDTO dto = new PricingUpdateDTO(30.0, 4.0, 7.0, 20.0);
        Pricing result = pricingService.updatePricing(dto, "admin@test.com");

        assertEquals(30.0, result.getMinimumFare());
        verify(pricingRepository, times(2)).save(any()); // 1 init + 1 update
    }
}