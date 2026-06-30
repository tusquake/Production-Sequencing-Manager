package com.imo.adminconfig.controller;

import com.imo.adminconfig.dto.SequencingRuleDto;
import com.imo.adminconfig.service.SequencingRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/order-sequencing/sequencing-rule")
public class SequencingRuleController {

    private final SequencingRuleService sequencingRuleService;

    @Autowired
    public SequencingRuleController(SequencingRuleService sequencingRuleService) {
        this.sequencingRuleService = sequencingRuleService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createRule(@RequestBody SequencingRuleDto ruleDto) {
        SequencingRuleDto result = sequencingRuleService.createRule(ruleDto);
        return buildResponse(HttpStatus.OK, "Sequencing rule created successfully", result);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllRules() {
        List<SequencingRuleDto> result = sequencingRuleService.getAllRules();
        return buildResponse(HttpStatus.OK, "All sequencing rules retrieved successfully", result);
    }

    @GetMapping("/by-plant/{plant}")
    public ResponseEntity<?> getRulesByPlant(@PathVariable String plant) {
        List<SequencingRuleDto> result = sequencingRuleService.getRulesByPlant(plant);
        return buildResponse(HttpStatus.OK, "Sequencing rules retrieved successfully for plant " + plant, result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRuleById(@PathVariable Long id) {
        SequencingRuleDto result = sequencingRuleService.getRuleById(id);
        return buildResponse(HttpStatus.OK, "Sequencing rule retrieved successfully", result);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateRule(@RequestBody SequencingRuleDto ruleDto) {
        SequencingRuleDto result = sequencingRuleService.updateRule(ruleDto);
        return buildResponse(HttpStatus.OK, "Sequencing rule updated successfully", result);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteRule(@PathVariable Long id) {
        sequencingRuleService.deleteRule(id);
        return buildResponse(HttpStatus.OK, "Sequencing rule deleted successfully", null);
    }

    private ResponseEntity<?> buildResponse(HttpStatus status, String message, Object data) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("StatusCode", status.value());
        body.put("Message", message);
        body.put("data", data);
        return new ResponseEntity<>(body, status);
    }
}
