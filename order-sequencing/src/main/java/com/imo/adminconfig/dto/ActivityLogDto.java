package com.imo.adminconfig.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogDto {
    private Long id;
    private LocalDateTime timestamp;
    private String activity;
    private String statusText;
    private String statusState;
    private String plant;
    private String logType;
    private String userName;
    private String userEmail;
    private String ruleName;
    private String validationStatus;
    private String validationDetail;
    private String simulationId;
}
