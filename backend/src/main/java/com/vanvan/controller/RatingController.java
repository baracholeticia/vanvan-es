package com.vanvan.controller;

import com.vanvan.dto.DriverAverageRatingDTO;
import com.vanvan.dto.RatingCreateDTO;
import com.vanvan.dto.RatingResponseDTO;
import com.vanvan.dto.RatingStatusUpdateDTO;
import com.vanvan.enums.RatingStatus;
import com.vanvan.model.Driver;
import com.vanvan.model.Passenger;
import com.vanvan.model.User;
import com.vanvan.repository.UserRepository;
import com.vanvan.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<RatingResponseDTO> createRating(
            @RequestBody RatingCreateDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername());
        if (!(user instanceof Passenger passenger)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(ratingService.createRating(dto, passenger));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<RatingResponseDTO>> getAllRatings(
            @RequestParam(required = false) UUID driverId,
            @RequestParam(required = false) RatingStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ratingService.getAllRatings(driverId, status, pageable));
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RatingResponseDTO> moderateRating(
            @PathVariable Long id,
            @RequestBody RatingStatusUpdateDTO dto) {
        return ResponseEntity.ok(ratingService.moderateRating(id, dto));
    }

    @GetMapping("/me/average")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverAverageRatingDTO> getMyAverageRating(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername());
        if (!(user instanceof Driver driver)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(ratingService.getDriverAverageRating(driver));
    }
}
