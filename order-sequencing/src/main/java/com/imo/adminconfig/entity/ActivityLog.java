package com.imo.adminconfig.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ORDER_SEQUENCING_ACTIVITY_LOGS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "TIMESTAMP")
    private LocalDateTime timestamp;

    @Column(name = "ACTIVITY", length = 500)
    private String activity;

    @Column(name = "STATUS_TEXT", length = 100)
    private String statusText;

    @Column(name = "STATUS_STATE", length = 50)
    private String statusState; // Success, Warning, Error

    @Column(name = "PLANT", length = 50)
    private String plant;

    @Column(name = "LOG_TYPE", length = 100)
    private String logType;

    @Column(name = "USER_NAME", length = 150)
    private String userName;

    @Column(name = "USER_EMAIL", length = 250)
    private String userEmail;

    @Column(name = "RULE_NAME", length = 200)
    private String ruleName;

    @Column(name = "VALIDATION_STATUS", length = 50)
    private String validationStatus;

    @Column(name = "VALIDATION_DETAIL", length = 1000)
    private String validationDetail;

    @Column(name = "SIMULATION_ID", length = 100)
    private String simulationId;
}
