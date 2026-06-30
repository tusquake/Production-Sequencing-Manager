package com.imo.adminconfig.service.impl;

import com.imo.adminconfig.dto.ActivityLogDto;
import com.imo.adminconfig.entity.ActivityLog;
import com.imo.adminconfig.repository.ActivityLogRepo;
import com.imo.adminconfig.security.UserContextHelper;
import com.imo.adminconfig.service.ActivityLogService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepo activityLogRepo;
    private final ModelMapper modelMapper;
    private final UserContextHelper userContextHelper;

    @Autowired
    public ActivityLogServiceImpl(ActivityLogRepo activityLogRepo, ModelMapper modelMapper, UserContextHelper userContextHelper) {
        this.activityLogRepo = activityLogRepo;
        this.modelMapper = modelMapper;
        this.userContextHelper = userContextHelper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityLogDto> getLogsByPlant(String plant) {
        List<ActivityLog> logs = activityLogRepo.findByPlantNativeOrderByIdDesc(plant);
        return logs.stream()
                .map(log -> modelMapper.map(log, ActivityLogDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ActivityLogDto logActivity(String plant, String activity, String statusText, String statusState, String logType) {
        ActivityLog log = ActivityLog.builder()
                .timestamp(LocalDateTime.now())
                .activity(activity)
                .statusText(statusText)
                .statusState(statusState)
                .plant(plant)
                .logType(logType)
                .userName(userContextHelper.getUserName())
                .userEmail(userContextHelper.getUserEmail())
                .build();
        ActivityLog saved = activityLogRepo.save(log);
        return modelMapper.map(saved, ActivityLogDto.class);
    }

    @Override
    @Transactional
    public ActivityLogDto logActivity(ActivityLog log) {
        if (log.getTimestamp() == null) {
            log.setTimestamp(LocalDateTime.now());
        }
        if (log.getUserName() == null) {
            log.setUserName(userContextHelper.getUserName());
        }
        if (log.getUserEmail() == null) {
            log.setUserEmail(userContextHelper.getUserEmail());
        }
        ActivityLog saved = activityLogRepo.save(log);
        return modelMapper.map(saved, ActivityLogDto.class);
    }
}
