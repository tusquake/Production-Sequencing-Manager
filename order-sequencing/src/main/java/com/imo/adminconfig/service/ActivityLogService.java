package com.imo.adminconfig.service;

import com.imo.adminconfig.dto.ActivityLogDto;
import com.imo.adminconfig.entity.ActivityLog;
import java.util.List;

public interface ActivityLogService {
    List<ActivityLogDto> getLogsByPlant(String plant);
    ActivityLogDto logActivity(String plant, String activity, String statusText, String statusState, String logType);
    ActivityLogDto logActivity(ActivityLog log);
}
