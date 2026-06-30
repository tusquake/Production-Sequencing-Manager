package com.imo.adminconfig.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SequencingRuleDto {
    private Long id;
    private String name;
    private String type;
    private Boolean isActive;
    private String srcType;
    private Integer srcCount;
    private String tgtType;
    private Integer tgtCount;
    private String restrictType;
    private String cannotFollow;
    private String priorityOrder;
    private String desc;
    private String plant;
}
