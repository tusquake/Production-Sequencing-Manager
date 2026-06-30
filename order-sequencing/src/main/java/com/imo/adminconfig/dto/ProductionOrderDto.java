package com.imo.adminconfig.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionOrderDto {
    private Long id;
    private String orderId;
    private String type;
    private Integer qty;
    private String priority;
    private String status;
    private String material;
    private String due;
    private String plant;
    private String salesOrder;
    private String workCenter;
    private String orderDate;
}
