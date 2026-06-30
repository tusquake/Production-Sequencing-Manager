package com.imo.adminconfig.repository;

import com.imo.adminconfig.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ActivityLogRepo extends JpaRepository<ActivityLog, Long> {

    @Query(value = "SELECT * FROM ORDER_SEQUENCING_ACTIVITY_LOGS WHERE PLANT = ?1 ORDER BY ID DESC", nativeQuery = true)
    List<ActivityLog> findByPlantNativeOrderByIdDesc(String plant);
}
