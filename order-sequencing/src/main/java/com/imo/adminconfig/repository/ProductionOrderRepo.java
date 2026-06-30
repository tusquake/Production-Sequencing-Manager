package com.imo.adminconfig.repository;

import com.imo.adminconfig.entity.ProductionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionOrderRepo extends JpaRepository<ProductionOrder, Long> {

    @Query(value = "SELECT * FROM ORDER_SEQUENCING_PRODUCTION_ORDERS WHERE PLANT = ?1", nativeQuery = true)
    List<ProductionOrder> findByPlantNative(String plant);

    Optional<ProductionOrder> findByOrderId(String orderId);
    
    void deleteByPlant(String plant);
}
