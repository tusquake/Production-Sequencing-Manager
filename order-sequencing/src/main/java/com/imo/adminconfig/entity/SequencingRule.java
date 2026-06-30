package com.imo.adminconfig.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ORDER_SEQUENCING_RULES")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SequencingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NAME", length = 100, nullable = false)
    private String name;

    @Column(name = "TYPE", length = 30)
    private String type; // ratio, restriction, priority

    @Column(name = "IS_ACTIVE")
    private Boolean isActive;

    @Column(name = "SRC_TYPE", length = 10)
    private String srcType;

    @Column(name = "SRC_COUNT")
    private Integer srcCount;

    @Column(name = "TGT_TYPE", length = 10)
    private String tgtType;

    @Column(name = "TGT_COUNT")
    private Integer tgtCount;

    @Column(name = "RESTRICT_TYPE", length = 10)
    private String restrictType;

    @Column(name = "CANNOT_FOLLOW", length = 10)
    private String cannotFollow;

    @Column(name = "PRIORITY_ORDER", length = 50)
    private String priorityOrder;

    @Column(name = "RULE_DESC", length = 255)
    private String desc;

    @Column(name = "PLANT", length = 20)
    private String plant;
}
