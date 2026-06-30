package com.imo.adminconfig.repository;

import com.imo.adminconfig.entity.SequencingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SequencingRuleRepo extends JpaRepository<SequencingRule, Long> {

    @Query(value = "SELECT * FROM ORDER_SEQUENCING_RULES WHERE PLANT = ?1", nativeQuery = true)
    List<SequencingRule> findByPlantNative(String plant);

    @Query(value = "SELECT * FROM ORDER_SEQUENCING_RULES", nativeQuery = true)
    List<SequencingRule> findAllNative();
}
