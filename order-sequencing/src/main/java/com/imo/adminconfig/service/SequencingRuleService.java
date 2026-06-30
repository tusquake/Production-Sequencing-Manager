package com.imo.adminconfig.service;

import com.imo.adminconfig.dto.SequencingRuleDto;
import java.util.List;

public interface SequencingRuleService {
    SequencingRuleDto createRule(SequencingRuleDto ruleDto);
    List<SequencingRuleDto> getAllRules();
    List<SequencingRuleDto> getRulesByPlant(String plant);
    SequencingRuleDto getRuleById(Long id);
    SequencingRuleDto updateRule(SequencingRuleDto ruleDto);
    void deleteRule(Long id);
}
