package com.imo.adminconfig.controller;

import com.imo.adminconfig.dto.ActivityLogDto;
import com.imo.adminconfig.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/order-sequencing/activity-log")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @Autowired
    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping("/by-plant/{plant}")
    public ResponseEntity<?> getLogsByPlant(@PathVariable String plant) {
        List<ActivityLogDto> result = activityLogService.getLogsByPlant(plant);
        return buildResponse(HttpStatus.OK, "Activity logs retrieved successfully for plant " + plant, result);
    }

    private ResponseEntity<?> buildResponse(HttpStatus status, String message, Object data) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("StatusCode", status.value());
        body.put("Message", message);
        body.put("data", data);
        return new ResponseEntity<>(body, status);
    }
}
