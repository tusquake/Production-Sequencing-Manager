package com.imo.adminconfig.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidationResultDto {
    private boolean pass;
    private boolean warn;
    private String name;
    private String detail;
}
