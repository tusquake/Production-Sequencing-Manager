package com.imo.adminconfig.service;

import com.imo.adminconfig.dto.ProductionOrderDto;
import com.imo.adminconfig.dto.SimulationResultDto;
import java.util.List;

public interface ProductionOrderService {
    ProductionOrderDto saveOrder(ProductionOrderDto orderDto);
    List<ProductionOrderDto> bulkSave(List<ProductionOrderDto> orderDtos);
    List<ProductionOrderDto> getOrdersByPlant(String plant);
    void deleteOrder(Long id);
    void clearOrdersByPlant(String plant);
    SimulationResultDto sequenceOrders(String plant, List<String> orderIds);
    void saveSequence(String plant, List<String> orderIds);
    SimulationResultDto validateSequence(String plant, List<String> orderIds);
}
