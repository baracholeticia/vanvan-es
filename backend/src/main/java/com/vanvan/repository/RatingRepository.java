package com.vanvan.repository;

import com.vanvan.enums.RatingStatus;
import com.vanvan.model.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    boolean existsByTripIdAndPassengerId(Long tripId, UUID passengerId);

    Page<Rating> findByDriverIdAndStatus(UUID driverId, RatingStatus status, Pageable pageable);

    @Query("SELECT r FROM Rating r WHERE (:driverId IS NULL OR r.driver.id = :driverId) AND (:status IS NULL OR r.status = :status)")
    Page<Rating> findAllWithFilters(@Param("driverId") UUID driverId, @Param("status") RatingStatus status, Pageable pageable);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.driver.id = :driverId AND r.status = 'VISIBLE'")
    Double getAverageScoreByDriverId(@Param("driverId") UUID driverId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.driver.id = :driverId AND r.status = 'VISIBLE'")
    Long countRatingsByDriverId(@Param("driverId") UUID driverId);
}
