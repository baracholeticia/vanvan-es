package com.vanvan.service;

import com.vanvan.dto.DriverAverageRatingDTO;
import com.vanvan.dto.RatingCreateDTO;
import com.vanvan.dto.RatingResponseDTO;
import com.vanvan.dto.RatingStatusUpdateDTO;
import com.vanvan.enums.RatingStatus;
import com.vanvan.enums.TripStatus;
import com.vanvan.exception.TripNotFoundException;
import com.vanvan.model.Driver;
import com.vanvan.model.Passenger;
import com.vanvan.model.Rating;
import com.vanvan.model.Trip;
import com.vanvan.repository.RatingRepository;
import com.vanvan.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final TripRepository tripRepository;

    @Transactional
    public RatingResponseDTO createRating(RatingCreateDTO dto, Passenger passenger) {
        Trip trip = tripRepository.findById(dto.getTripId())
                .orElseThrow(() -> new TripNotFoundException(dto.getTripId().toString()));

        // Validations
        if (trip.getStatus() != TripStatus.COMPLETED) {
            throw new IllegalArgumentException("Só é possível avaliar viagens finalizadas.");
        }
        
        boolean isPassengerInTrip = trip.getPassengers().stream()
                .anyMatch(p -> p.getId().equals(passenger.getId()));
        
        if (!isPassengerInTrip) {
            throw new IllegalArgumentException("O passageiro não fez parte desta viagem.");
        }

        if (ratingRepository.existsByTripIdAndPassengerId(trip.getId(), passenger.getId())) {
            throw new IllegalArgumentException("Você já avaliou esta viagem.");
        }

        if (dto.getScore() < 1 || dto.getScore() > 5) {
            throw new IllegalArgumentException("A nota deve estar entre 1 e 5.");
        }

        Rating rating = new Rating();
        rating.setTrip(trip);
        rating.setPassenger(passenger);
        rating.setDriver(trip.getDriver());
        rating.setScore(dto.getScore());
        rating.setComment(dto.getComment());
        rating.setStatus(RatingStatus.VISIBLE);
        rating.setCreatedAt(LocalDateTime.now());

        rating = ratingRepository.save(rating);

        return toResponseDTO(rating);
    }

    public Page<RatingResponseDTO> getAllRatings(UUID driverId, RatingStatus status, Pageable pageable) {
        return ratingRepository.findAllWithFilters(driverId, status, pageable)
                .map(this::toResponseDTO);
    }

    public DriverAverageRatingDTO getDriverAverageRating(Driver driver) {
        Double avg = ratingRepository.getAverageScoreByDriverId(driver.getId());
        Long count = ratingRepository.countRatingsByDriverId(driver.getId());
        
        return new DriverAverageRatingDTO(avg != null ? avg : 0.0, count != null ? count : 0L);
    }

    @Transactional
    public RatingResponseDTO moderateRating(Long id, RatingStatusUpdateDTO dto) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Avaliação não encontrada"));
        
        rating.setStatus(dto.getStatus());
        rating = ratingRepository.save(rating);
        
        return toResponseDTO(rating);
    }

    private RatingResponseDTO toResponseDTO(Rating rating) {
        return new RatingResponseDTO(
                rating.getId(),
                rating.getTrip().getId(),
                rating.getDriver().getId(),
                rating.getDriver().getName(),
                rating.getPassenger().getId(),
                rating.getPassenger().getName(),
                rating.getScore(),
                rating.getComment(),
                rating.getStatus(),
                rating.getCreatedAt()
        );
    }
}
