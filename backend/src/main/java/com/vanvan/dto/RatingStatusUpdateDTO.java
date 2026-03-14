package com.vanvan.dto;

import com.vanvan.enums.RatingStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RatingStatusUpdateDTO {
    private RatingStatus status;
}
