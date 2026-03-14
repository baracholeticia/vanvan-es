package com.vanvan.service;

import com.vanvan.dto.DriverAverageRatingDTO;
import com.vanvan.dto.RatingCreateDTO;
import com.vanvan.dto.RatingResponseDTO;
import com.vanvan.dto.RatingStatusUpdateDTO;
import com.vanvan.enums.RatingStatus;
import com.vanvan.enums.TripStatus;
import com.vanvan.exception.TripNotFoundException;
import com.vanvan.model.*;
import com.vanvan.repository.RatingRepository;
import com.vanvan.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RatingServiceTest {

    private RatingRepository ratingRepository;
    private TripRepository tripRepository;
    private RatingService ratingService;

    private Passenger passenger;
    private Driver driver;
    private Trip trip;

    @BeforeEach
    void setUp() {
        ratingRepository = mock(RatingRepository.class);
        tripRepository = mock(TripRepository.class);
        ratingService = new RatingService(ratingRepository, tripRepository);

        driver = new Driver();
        driver.setName("Motorista");

        passenger = new Passenger("Alice", "12345678900", "11999999999",
                "alice@email.com", "senha123", LocalDate.of(2000, 1, 1));

        trip = new Trip();
        trip.setId(1L);
        trip.setDriver(driver);
        trip.setPassengers(List.of(passenger));
        trip.setStatus(TripStatus.COMPLETED);
    }

    // createRating

    @Test
    void createRating_success() {
        RatingCreateDTO dto = new RatingCreateDTO(trip.getId(), 5, "Ótimo motorista!");

        when(tripRepository.findById(trip.getId())).thenReturn(Optional.of(trip));
        when(ratingRepository.existsByTripIdAndPassengerId(trip.getId(), passenger.getId())).thenReturn(false);

        Rating savedRating = new Rating();
        savedRating.setId(1L);
        savedRating.setTrip(trip);
        savedRating.setDriver(driver);
        savedRating.setPassenger(passenger);
        savedRating.setScore(5);
        savedRating.setComment("Ótimo motorista!");
        savedRating.setStatus(RatingStatus.VISIBLE);
        savedRating.setCreatedAt(LocalDateTime.now());

        when(ratingRepository.save(any(Rating.class))).thenReturn(savedRating);

        RatingResponseDTO result = ratingService.createRating(dto, passenger);

        assertNotNull(result);
        assertEquals(5, result.getScore());
        assertEquals("Ótimo motorista!", result.getComment());
        assertEquals(RatingStatus.VISIBLE, result.getStatus());
    }

    @Test
    void createRating_tripNotFound_throws() {
        RatingCreateDTO dto = new RatingCreateDTO(99L, 5, "ok");
        when(tripRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(TripNotFoundException.class, () -> ratingService.createRating(dto, passenger));
    }

    @Test
    void createRating_tripNotCompleted_throws() {
        trip.setStatus(TripStatus.IN_PROGRESS);
        RatingCreateDTO dto = new RatingCreateDTO(trip.getId(), 4, "ok");
        when(tripRepository.findById(trip.getId())).thenReturn(Optional.of(trip));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> ratingService.createRating(dto, passenger));
        assertTrue(ex.getMessage().contains("finalizadas"));
    }

    @Test
    void createRating_passengerNotInTrip_throws() {
        Passenger outro = new Passenger("Bob", "99999999999", "11988888888",
                "bob@email.com", "senha", LocalDate.of(1995, 1, 1));

        RatingCreateDTO dto = new RatingCreateDTO(trip.getId(), 3, "ok");
        when(tripRepository.findById(trip.getId())).thenReturn(Optional.of(trip));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> ratingService.createRating(dto, outro));
        assertTrue(ex.getMessage().contains("não fez parte"));
    }

    @Test
    void createRating_alreadyRated_throws() {
        RatingCreateDTO dto = new RatingCreateDTO(trip.getId(), 4, "ok");
        when(tripRepository.findById(trip.getId())).thenReturn(Optional.of(trip));
        when(ratingRepository.existsByTripIdAndPassengerId(trip.getId(), passenger.getId())).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> ratingService.createRating(dto, passenger));
        assertTrue(ex.getMessage().contains("já avaliou"));
    }

    @Test
    void createRating_scoreTooLow_throws() {
        RatingCreateDTO dto = new RatingCreateDTO(trip.getId(), 0, "ok");
        when(tripRepository.findById(trip.getId())).thenReturn(Optional.of(trip));
        when(ratingRepository.existsByTripIdAndPassengerId(any(), any())).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> ratingService.createRating(dto, passenger));
        assertTrue(ex.getMessage().contains("entre 1 e 5"));
    }

    @Test
    void createRating_scoreTooHigh_throws() {
        RatingCreateDTO dto = new RatingCreateDTO(trip.getId(), 6, "ok");
        when(tripRepository.findById(trip.getId())).thenReturn(Optional.of(trip));
        when(ratingRepository.existsByTripIdAndPassengerId(any(), any())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> ratingService.createRating(dto, passenger));
    }

    // getAllRatings

    @Test
    void getAllRatings_returnsPage() {
        Rating rating = buildRating();
        Page<Rating> page = new PageImpl<>(List.of(rating));

        when(ratingRepository.findAllWithFilters(any(), any(), any())).thenReturn(page);

        Page<RatingResponseDTO> result = ratingService.getAllRatings(null, null, Pageable.unpaged());

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void getAllRatings_filteredByDriver() {
        Rating rating = buildRating();
        Page<Rating> page = new PageImpl<>(List.of(rating));
        UUID driverId = UUID.randomUUID();

        when(ratingRepository.findAllWithFilters(eq(driverId), any(), any())).thenReturn(page);

        Page<RatingResponseDTO> result = ratingService.getAllRatings(driverId, null, Pageable.unpaged());
        assertEquals(1, result.getTotalElements());
    }

    // getDriverAverageRating

    @Test
    void getDriverAverageRating_withData() {
        when(ratingRepository.getAverageScoreByDriverId(driver.getId())).thenReturn(4.5);
        when(ratingRepository.countRatingsByDriverId(driver.getId())).thenReturn(10L);

        DriverAverageRatingDTO result = ratingService.getDriverAverageRating(driver);

        assertEquals(4.5, result.getAverageScore());
        assertEquals(10L, result.getTotalRatings());
    }

    @Test
    void getDriverAverageRating_noData_returnsZeros() {
        when(ratingRepository.getAverageScoreByDriverId(driver.getId())).thenReturn(null);
        when(ratingRepository.countRatingsByDriverId(driver.getId())).thenReturn(null);

        DriverAverageRatingDTO result = ratingService.getDriverAverageRating(driver);

        assertEquals(0.0, result.getAverageScore());
        assertEquals(0L, result.getTotalRatings());
    }

    // moderateRating

    @Test
    void moderateRating_success() {
        Rating rating = buildRating();
        RatingStatusUpdateDTO dto = new RatingStatusUpdateDTO(RatingStatus.HIDDEN);

        when(ratingRepository.findById(1L)).thenReturn(Optional.of(rating));
        when(ratingRepository.save(any())).thenReturn(rating);

        RatingResponseDTO result = ratingService.moderateRating(1L, dto);

        assertNotNull(result);
        verify(ratingRepository).save(rating);
    }

    @Test
    void moderateRating_notFound_throws() {
        when(ratingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> ratingService.moderateRating(99L, new RatingStatusUpdateDTO(RatingStatus.HIDDEN)));
    }

    // helper

    private Rating buildRating() {
        Rating rating = new Rating();
        rating.setId(1L);
        rating.setTrip(trip);
        rating.setDriver(driver);
        rating.setPassenger(passenger);
        rating.setScore(4);
        rating.setComment("Bom");
        rating.setStatus(RatingStatus.VISIBLE);
        rating.setCreatedAt(LocalDateTime.now());
        return rating;
    }
}