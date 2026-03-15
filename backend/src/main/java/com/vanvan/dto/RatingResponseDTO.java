package com.vanvan.dto;

import com.vanvan.enums.RatingStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RatingResponseDTO {
    private Long id;
    private Long tripId;
    private UUID driverId;
    private String driverName;
    private UUID passengerId;
    private String passengerName;
    private Integer score;
    private String comment;
    private RatingStatus status;
    private LocalDateTime createdAt;
}
