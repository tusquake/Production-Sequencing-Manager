package com.imo.adminconfig.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ORDER_SEQUENCING_PRODUCTION_ORDERS")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ORDER_ID", length = 50, unique = true, nullable = false)
    private String orderId;

    @Column(name = "TYPE", length = 30)
    private String type;

    @Column(name = "QTY")
    private Integer qty;

    @Column(name = "PRIORITY", length = 30)
    private String priority;

    @Column(name = "STATUS", length = 30)
    private String status;

    @Column(name = "MATERIAL", length = 100)
    private String material;

    @Column(name = "DUE_DATE", length = 50)
    private String due;

    @Column(name = "PLANT", length = 20)
    private String plant;
}
