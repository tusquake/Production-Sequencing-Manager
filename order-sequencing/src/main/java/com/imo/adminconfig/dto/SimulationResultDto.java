package com.imo.adminconfig.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationResultDto {
    private List<ProductionOrderDto> sequencedOrders;
    private List<ValidationResultDto> validationResults;
    private int complianceVal;
    private String simStatusText;
}
