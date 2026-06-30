package com.imo.adminconfig.controller;

import com.imo.adminconfig.dto.ProductionOrderDto;
import com.imo.adminconfig.dto.SimulationResultDto;
import com.imo.adminconfig.service.ProductionOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/order-sequencing/production-order")
public class ProductionOrderController {

    private final ProductionOrderService productionOrderService;

    @Autowired
    public ProductionOrderController(ProductionOrderService productionOrderService) {
        this.productionOrderService = productionOrderService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody ProductionOrderDto orderDto) {
        ProductionOrderDto result = productionOrderService.saveOrder(orderDto);
        return buildResponse(HttpStatus.OK, "Production order saved successfully", result);
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> bulkSaveOrders(@RequestBody List<ProductionOrderDto> orderDtos) {
        List<ProductionOrderDto> result = productionOrderService.bulkSave(orderDtos);
        return buildResponse(HttpStatus.OK, "Bulk production orders saved successfully", result);
    }

    @GetMapping("/by-plant/{plant}")
    public ResponseEntity<?> getOrdersByPlant(@PathVariable String plant) {
        List<ProductionOrderDto> result = productionOrderService.getOrdersByPlant(plant);
        return buildResponse(HttpStatus.OK, "Production orders retrieved successfully", result);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        productionOrderService.deleteOrder(id);
        return buildResponse(HttpStatus.OK, "Production order deleted successfully", null);
    }

    @DeleteMapping("/clear/{plant}")
    public ResponseEntity<?> clearOrders(@PathVariable String plant) {
        productionOrderService.clearOrdersByPlant(plant);
        return buildResponse(HttpStatus.OK, "All production orders cleared for plant " + plant, null);
    }

    @PostMapping("/sequence/{plant}")
    public ResponseEntity<?> sequenceOrders(@PathVariable String plant, @RequestBody(required = false) List<String> orderIds) {
        SimulationResultDto result = productionOrderService.sequenceOrders(plant, orderIds);
        return buildResponse(HttpStatus.OK, "Simulation sequencing completed successfully", result);
    }

    @PostMapping("/save-sequence/{plant}")
    public ResponseEntity<?> saveSequence(@PathVariable String plant, @RequestBody List<String> orderIds) {
        productionOrderService.saveSequence(plant, orderIds);
        return buildResponse(HttpStatus.OK, "Sequence arrangement saved successfully", null);
    }

    @PostMapping("/validate-sequence/{plant}")
    public ResponseEntity<?> validateSequence(@PathVariable String plant, @RequestBody List<String> orderIds) {
        SimulationResultDto result = productionOrderService.validateSequence(plant, orderIds);
        return buildResponse(HttpStatus.OK, "Sequence validation completed successfully", result);
    }

    private ResponseEntity<?> buildResponse(HttpStatus status, String message, Object data) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("StatusCode", status.value());
        body.put("Message", message);
        body.put("data", data);
        return new ResponseEntity<>(body, status);
    }
}
