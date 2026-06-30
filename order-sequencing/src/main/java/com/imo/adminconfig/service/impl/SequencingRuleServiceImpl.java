package com.imo.adminconfig.service.impl;

import com.imo.adminconfig.dto.SequencingRuleDto;
import com.imo.adminconfig.entity.SequencingRule;
import com.imo.adminconfig.repository.SequencingRuleRepo;
import com.imo.adminconfig.service.ActivityLogService;
import com.imo.adminconfig.service.SequencingRuleService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SequencingRuleServiceImpl implements SequencingRuleService {

    private final SequencingRuleRepo sequencingRuleRepo;
    private final ModelMapper modelMapper;
    private final ActivityLogService activityLogService;

    @Autowired
    public SequencingRuleServiceImpl(SequencingRuleRepo sequencingRuleRepo, ModelMapper modelMapper, ActivityLogService activityLogService) {
        this.sequencingRuleRepo = sequencingRuleRepo;
        this.modelMapper = modelMapper;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional
    @CacheEvict(value = {"sequencingRules", "allSequencingRules"}, allEntries = true)
    public SequencingRuleDto createRule(SequencingRuleDto ruleDto) {
        SequencingRule rule = modelMapper.map(ruleDto, SequencingRule.class);
        SequencingRule saved = sequencingRuleRepo.save(rule);
        
        activityLogService.logActivity(
                rule.getPlant(),
                "Created sequencing rule: " + rule.getName(),
                "Success",
                "Success",
                "Rule Configuration"
        );
        
        return modelMapper.map(saved, SequencingRuleDto.class);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "allSequencingRules")
    public List<SequencingRuleDto> getAllRules() {
        List<SequencingRule> rules = sequencingRuleRepo.findAllNative();
        return rules.stream()
                .map(rule -> modelMapper.map(rule, SequencingRuleDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @Cacheable(value = "sequencingRules", key = "#plant")
    public List<SequencingRuleDto> getRulesByPlant(String plant) {
        List<SequencingRule> rules = sequencingRuleRepo.findByPlantNative(plant);
        if (rules.isEmpty()) {
            // Self-Seeding: seed 3 default active rules
            List<SequencingRule> defaultRules = new ArrayList<>();
            
            defaultRules.add(SequencingRule.builder()
                    .name("CBU-KD Mixing Rule")
                    .type("ratio")
                    .isActive(true)
                    .srcType("CBU")
                    .srcCount(3)
                    .tgtType("KD")
                    .tgtCount(1)
                    .desc("For every 3 CBU orders, insert 1 KD order")
                    .plant(plant)
                    .build());

            defaultRules.add(SequencingRule.builder()
                    .name("TVL Restriction Rule")
                    .type("restriction")
                    .isActive(true)
                    .restrictType("TVL")
                    .cannotFollow("KD")
                    .desc("TVL orders cannot directly follow KD orders")
                    .plant(plant)
                    .build());

            defaultRules.add(SequencingRule.builder()
                    .name("High Priority First")
                    .type("priority")
                    .isActive(true)
                    .priorityOrder("High → Medium → Low")
                    .desc("High priority orders are sequenced before medium and low")
                    .plant(plant)
                    .build());

            rules = sequencingRuleRepo.saveAll(defaultRules);
            
            activityLogService.logActivity(
                    plant,
                    "Self-seeded default active rules for plant: " + plant,
                    "Success",
                    "Success",
                    "System Initialization"
            );
        }
        return rules.stream()
                .map(rule -> modelMapper.map(rule, SequencingRuleDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SequencingRuleDto getRuleById(Long id) {
        SequencingRule rule = sequencingRuleRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sequencing rule not found with ID: " + id));
        return modelMapper.map(rule, SequencingRuleDto.class);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"sequencingRules", "allSequencingRules"}, allEntries = true)
    public SequencingRuleDto updateRule(SequencingRuleDto ruleDto) {
        if (ruleDto.getId() == null) {
            throw new IllegalArgumentException("Rule ID is required for update");
        }
        SequencingRule existing = sequencingRuleRepo.findById(ruleDto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Sequencing rule not found with ID: " + ruleDto.getId()));
        
        existing.setName(ruleDto.getName());
        existing.setType(ruleDto.getType());
        existing.setIsActive(ruleDto.getIsActive());
        existing.setSrcType(ruleDto.getSrcType());
        existing.setSrcCount(ruleDto.getSrcCount());
        existing.setTgtType(ruleDto.getTgtType());
        existing.setTgtCount(ruleDto.getTgtCount());
        existing.setRestrictType(ruleDto.getRestrictType());
        existing.setCannotFollow(ruleDto.getCannotFollow());
        existing.setPriorityOrder(ruleDto.getPriorityOrder());
        existing.setDesc(ruleDto.getDesc());
        existing.setPlant(ruleDto.getPlant());
        
        SequencingRule updated = sequencingRuleRepo.save(existing);
        
        activityLogService.logActivity(
                updated.getPlant(),
                "Updated sequencing rule: " + updated.getName() + " (Active: " + updated.getIsActive() + ")",
                "Success",
                "Success",
                "Rule Configuration"
        );
        
        return modelMapper.map(updated, SequencingRuleDto.class);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"sequencingRules", "allSequencingRules"}, allEntries = true)
    public void deleteRule(Long id) {
        SequencingRule rule = sequencingRuleRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sequencing rule not found with ID: " + id));
        sequencingRuleRepo.delete(rule);
        
        activityLogService.logActivity(
                rule.getPlant(),
                "Deleted sequencing rule: " + rule.getName(),
                "Success",
                "Success",
                "Rule Configuration"
        );
    }
}
