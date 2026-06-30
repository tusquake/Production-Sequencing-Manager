package com.imo.adminconfig.service.impl;

import com.imo.adminconfig.dto.ProductionOrderDto;
import com.imo.adminconfig.dto.SimulationResultDto;
import com.imo.adminconfig.dto.ValidationResultDto;
import com.imo.adminconfig.dto.SequencingRuleDto;
import com.imo.adminconfig.entity.ActivityLog;
import com.imo.adminconfig.entity.ProductionOrder;
import com.imo.adminconfig.repository.ProductionOrderRepo;
import com.imo.adminconfig.service.ActivityLogService;
import com.imo.adminconfig.service.ProductionOrderService;
import com.imo.adminconfig.service.SequencingRuleService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductionOrderServiceImpl implements ProductionOrderService {

    private final ProductionOrderRepo productionOrderRepo;
    private final ModelMapper modelMapper;
    private final SequencingRuleService sequencingRuleService;
    private final ActivityLogService activityLogService;

    @Autowired
    public ProductionOrderServiceImpl(ProductionOrderRepo productionOrderRepo,
                                     ModelMapper modelMapper,
                                     SequencingRuleService sequencingRuleService,
                                     ActivityLogService activityLogService) {
        this.productionOrderRepo = productionOrderRepo;
        this.modelMapper = modelMapper;
        this.sequencingRuleService = sequencingRuleService;
        this.activityLogService = activityLogService;
    }

    @Override
    @Transactional
    @CacheEvict(value = "productionOrders", allEntries = true)
    public ProductionOrderDto saveOrder(ProductionOrderDto orderDto) {
        ProductionOrder order = modelMapper.map(orderDto, ProductionOrder.class);
        
        // Check if exists by orderId
        Optional<ProductionOrder> existingOpt = productionOrderRepo.findByOrderId(order.getOrderId());
        if (existingOpt.isPresent()) {
            ProductionOrder existing = existingOpt.get();
            existing.setType(order.getType());
            existing.setQty(order.getQty());
            existing.setPriority(order.getPriority());
            existing.setStatus(order.getStatus());
            existing.setMaterial(order.getMaterial());
            existing.setDue(order.getDue());
            existing.setPlant(order.getPlant());
            order = productionOrderRepo.save(existing);
        } else {
            order = productionOrderRepo.save(order);
        }

        activityLogService.logActivity(
                order.getPlant(),
                "Saved production order: " + order.getOrderId(),
                "Success",
                "Success",
                "Order Management"
        );

        return modelMapper.map(order, ProductionOrderDto.class);
    }

    @Override
    @Transactional
    @CacheEvict(value = "productionOrders", allEntries = true)
    public List<ProductionOrderDto> bulkSave(List<ProductionOrderDto> orderDtos) {
        List<ProductionOrderDto> savedDtos = new ArrayList<>();
        for (ProductionOrderDto dto : orderDtos) {
            savedDtos.add(saveOrder(dto));
        }

        if (!orderDtos.isEmpty()) {
            activityLogService.logActivity(
                    orderDtos.get(0).getPlant(),
                    "Bulk saved " + orderDtos.size() + " production orders",
                    "Success",
                    "Success",
                    "Order Management"
            );
        }
        return savedDtos;
    }

    @Override
    @Transactional
    @Cacheable(value = "productionOrders", key = "#plant")
    public List<ProductionOrderDto> getOrdersByPlant(String plant) {
        List<ProductionOrder> orders = productionOrderRepo.findByPlantNative(plant);
        if (orders.isEmpty()) {
            // Self-seeding: automatically generate 50 default mock orders
            List<ProductionOrder> seededOrders = new ArrayList<>();
            String[] types = {"CBU", "KD", "TVL"};
            String[] priorities = {"High", "Medium", "Low"};
            String[] statuses = {"Pending", "In Progress", "Done"};

            for (int i = 1; i <= 50; i++) {
                String type = types[(i - 1) % types.length];
                String priority = priorities[(i - 1) % priorities.length];
                String status = statuses[(i - 1) % statuses.length];
                String orderId = String.format("ORD-%s-%03d", plant, i);
                
                seededOrders.add(ProductionOrder.builder()
                        .orderId(orderId)
                        .type(type)
                        .qty(10 + (i * 3) % 90)
                        .priority(priority)
                        .status(status)
                        .material(type + "-MAT-" + (100 + i))
                        .due("2026-07-" + String.format("%02d", (1 + (i % 28))))
                        .plant(plant)
                        .build());
            }

            orders = productionOrderRepo.saveAll(seededOrders);

            activityLogService.logActivity(
                    plant,
                    "Self-seeded 50 default production orders for plant: " + plant,
                    "Success",
                    "Success",
                    "System Initialization"
            );
        }

        return orders.stream()
                .map(order -> modelMapper.map(order, ProductionOrderDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "productionOrders", allEntries = true)
    public void deleteOrder(Long id) {
        ProductionOrder order = productionOrderRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Production order not found with ID: " + id));
        productionOrderRepo.delete(order);

        activityLogService.logActivity(
                order.getPlant(),
                "Deleted production order: " + order.getOrderId(),
                "Success",
                "Success",
                "Order Management"
        );
    }

    @Override
    @Transactional
    @CacheEvict(value = "productionOrders", allEntries = true)
    public void clearOrdersByPlant(String plant) {
        productionOrderRepo.deleteByPlant(plant);
        activityLogService.logActivity(
                plant,
                "Cleared all production orders",
                "Success",
                "Success",
                "Order Management"
        );
    }

    @Override
    @Transactional
    public SimulationResultDto sequenceOrders(String plant, List<String> orderIds) {
        // 1. Fetch all orders (matching plant filter)
        List<ProductionOrder> allOrders = productionOrderRepo.findByPlantNative(plant);
        
        // Filter by requested IDs if provided
        List<ProductionOrder> targetOrders;
        if (orderIds != null && !orderIds.isEmpty()) {
            Set<String> idSet = new HashSet<>(orderIds);
            targetOrders = allOrders.stream()
                    .filter(o -> idSet.contains(o.getOrderId()) || idSet.contains(o.getId().toString()))
                    .collect(Collectors.toList());
        } else {
            targetOrders = allOrders;
        }

        // If still empty (e.g. database has no orders and self-seeding is triggered through getOrdersByPlant)
        if (targetOrders.isEmpty()) {
            getOrdersByPlant(plant); // triggers self-seeding
            targetOrders = productionOrderRepo.findByPlantNative(plant);
        }

        // 2. Fetch active rules for the plant
        List<SequencingRuleDto> activeRules = sequencingRuleService.getRulesByPlant(plant).stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsActive()))
                .collect(Collectors.toList());

        // 3. Group the orders by type: CBU, KD, and TVL
        List<ProductionOrder> cbuList = targetOrders.stream().filter(o -> "CBU".equalsIgnoreCase(o.getType())).collect(Collectors.toList());
        List<ProductionOrder> kdList = targetOrders.stream().filter(o -> "KD".equalsIgnoreCase(o.getType())).collect(Collectors.toList());
        List<ProductionOrder> tvlList = targetOrders.stream().filter(o -> "TVL".equalsIgnoreCase(o.getType())).collect(Collectors.toList());

        // 4. Sort each sub-group by priority in descending order using custom comparator
        cbuList.sort(Comparator.comparingInt(o -> getPriorityWeight(o.getPriority())));
        kdList.sort(Comparator.comparingInt(o -> getPriorityWeight(o.getPriority())));
        tvlList.sort(Comparator.comparingInt(o -> getPriorityWeight(o.getPriority())));

        // 5. Fetch the active Ratio Rule. If none is active, default to ratio of 3 CBU to 1 KD.
        int srcCount = 3;
        int tgtCount = 1;
        for (SequencingRuleDto rule : activeRules) {
            if ("ratio".equalsIgnoreCase(rule.getType())) {
                if (rule.getSrcCount() != null) srcCount = rule.getSrcCount();
                if (rule.getTgtCount() != null) tgtCount = rule.getTgtCount();
                break;
            }
        }

        // 6. Mix the sorted orders into a single list seq
        List<ProductionOrder> seq = new ArrayList<>();
        List<ProductionOrder> cbuTemp = new ArrayList<>(cbuList);
        List<ProductionOrder> kdTemp = new ArrayList<>(kdList);
        List<ProductionOrder> tvlTemp = new ArrayList<>(tvlList);

        while (!cbuTemp.isEmpty() || !kdTemp.isEmpty() || !tvlTemp.isEmpty()) {
            // Take up to srcCount from CBU
            for (int i = 0; i < srcCount && !cbuTemp.isEmpty(); i++) {
                seq.add(cbuTemp.remove(0));
            }
            
            // Take up to tgtCount from KD
            for (int i = 0; i < tgtCount && !kdTemp.isEmpty(); i++) {
                seq.add(kdTemp.remove(0));
            }
            
            // If last added order type is not KD, take 1 order from TVL
            if (!seq.isEmpty()) {
                String lastType = seq.get(seq.size() - 1).getType();
                if (!"KD".equalsIgnoreCase(lastType) && !tvlTemp.isEmpty()) {
                    seq.add(tvlTemp.remove(0));
                }
            } else if (!tvlTemp.isEmpty()) {
                seq.add(tvlTemp.remove(0));
            }
            
            // If CBU and KD are exhausted, append all remaining TVL orders
            if (cbuTemp.isEmpty() && kdTemp.isEmpty()) {
                while (!tvlTemp.isEmpty()) {
                    seq.add(tvlTemp.remove(0));
                }
            }
        }

        // Map list to DTO
        List<ProductionOrderDto> seqDtos = seq.stream()
                .map(o -> modelMapper.map(o, ProductionOrderDto.class))
                .collect(Collectors.toList());

        // Validate sequence
        String simulationId = UUID.randomUUID().toString();
        List<ValidationResultDto> validationResults = validateSequenceInternal(seqDtos, activeRules, plant, simulationId);

        // Calculate compliance score
        long passedRulesCount = validationResults.stream().filter(ValidationResultDto::isPass).count();
        int totalActiveRules = activeRules.size();
        int complianceVal = totalActiveRules > 0 ? (int) Math.round(((double) passedRulesCount / totalActiveRules) * 100) : 100;

        String simStatusText = String.format("Simulation complete. Compliance: %d%%. Rules passed: %d/%d", 
                complianceVal, passedRulesCount, totalActiveRules);

        // Log overall simulation run in ActivityLog
        activityLogService.logActivity(ActivityLog.builder()
                .timestamp(LocalDateTime.now())
                .activity("Executed order sequencing simulation for plant " + plant)
                .statusText(simStatusText)
                .statusState(complianceVal >= 80 ? "Success" : "Warning")
                .plant(plant)
                .logType("Simulation")
                .simulationId(simulationId)
                .build());

        return SimulationResultDto.builder()
                .sequencedOrders(seqDtos)
                .validationResults(validationResults)
                .complianceVal(complianceVal)
                .simStatusText(simStatusText)
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(value = "productionOrders", allEntries = true)
    public void saveSequence(String plant, List<String> orderIds) {
        activityLogService.logActivity(
                plant,
                "Registered and saved final sequence arrangement for " + orderIds.size() + " orders",
                "Success",
                "Success",
                "Sequence Management"
        );
    }

    @Override
    @Transactional
    public SimulationResultDto validateSequence(String plant, List<String> orderIds) {
        // Fetch orders based on orderIds
        List<ProductionOrder> allOrders = productionOrderRepo.findByPlantNative(plant);
        Map<String, ProductionOrder> orderMap = allOrders.stream()
                .collect(Collectors.toMap(ProductionOrder::getOrderId, o -> o, (o1, o2) -> o1));
        
        List<ProductionOrderDto> seqDtos = orderIds.stream()
                .map(orderMap::get)
                .filter(Objects::nonNull)
                .map(o -> modelMapper.map(o, ProductionOrderDto.class))
                .collect(Collectors.toList());

        // Fetch active rules
        List<SequencingRuleDto> activeRules = sequencingRuleService.getRulesByPlant(plant).stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsActive()))
                .collect(Collectors.toList());

        String simulationId = UUID.randomUUID().toString();
        List<ValidationResultDto> validationResults = validateSequenceInternal(seqDtos, activeRules, plant, simulationId);

        long passedRulesCount = validationResults.stream().filter(ValidationResultDto::isPass).count();
        int totalActiveRules = activeRules.size();
        int complianceVal = totalActiveRules > 0 ? (int) Math.round(((double) passedRulesCount / totalActiveRules) * 100) : 100;

        String simStatusText = String.format("Manual arrangement validation complete. Compliance: %d%%.", complianceVal);

        activityLogService.logActivity(ActivityLog.builder()
                .timestamp(LocalDateTime.now())
                .activity("Validated manual sequence arrangement for plant " + plant)
                .statusText(simStatusText)
                .statusState(complianceVal >= 80 ? "Success" : "Warning")
                .plant(plant)
                .logType("Validation")
                .simulationId(simulationId)
                .build());

        return SimulationResultDto.builder()
                .sequencedOrders(seqDtos)
                .validationResults(validationResults)
                .complianceVal(complianceVal)
                .simStatusText(simStatusText)
                .build();
    }

    private List<ValidationResultDto> validateSequenceInternal(List<ProductionOrderDto> seqDtos, 
                                                                List<SequencingRuleDto> activeRules, 
                                                                String plant, 
                                                                String simulationId) {
        List<ValidationResultDto> results = new ArrayList<>();

        for (SequencingRuleDto rule : activeRules) {
            ValidationResultDto result = null;
            if ("ratio".equalsIgnoreCase(rule.getType())) {
                result = checkRatioRule(seqDtos, rule);
            } else if ("restriction".equalsIgnoreCase(rule.getType())) {
                result = checkRestrictionRule(seqDtos, rule);
            } else if ("priority".equalsIgnoreCase(rule.getType())) {
                result = checkPriorityRule(seqDtos, rule);
            }

            if (result != null) {
                results.add(result);
                
                // If warning or failed, log detailed entry in activity log
                if (!result.isPass() || result.isWarn()) {
                    activityLogService.logActivity(ActivityLog.builder()
                            .timestamp(LocalDateTime.now())
                            .activity((result.isWarn() ? "Warning" : "Failure") + " on rule: " + rule.getName())
                            .statusText(result.isPass() ? "Warning" : "Error")
                            .statusState(result.isPass() ? "Warning" : "Error")
                            .plant(plant)
                            .logType("Rule Violation")
                            .ruleName(rule.getName())
                            .validationStatus(result.isPass() ? "WARNING" : "FAIL")
                            .validationDetail(result.getDetail())
                            .simulationId(simulationId)
                            .build());
                }
            }
        }
        return results;
    }

    private ValidationResultDto checkRatioRule(List<ProductionOrderDto> seq, SequencingRuleDto rule) {
        String srcType = rule.getSrcType() != null ? rule.getSrcType() : "CBU";
        String tgtType = rule.getTgtType() != null ? rule.getTgtType() : "KD";
        int srcLimit = rule.getSrcCount() != null ? rule.getSrcCount() : 3;

        int continuousSrc = 0;
        int violations = 0;
        for (ProductionOrderDto order : seq) {
            if (srcType.equalsIgnoreCase(order.getType())) {
                continuousSrc++;
                if (continuousSrc > srcLimit) {
                    violations++;
                }
            } else if (tgtType.equalsIgnoreCase(order.getType())) {
                continuousSrc = 0;
            }
        }

        boolean pass = violations == 0;
        return ValidationResultDto.builder()
                .pass(pass)
                .warn(false)
                .name(rule.getName())
                .detail(pass ? "All ratio constraints satisfied." 
                             : String.format("Ratio rule violated %d time(s). Continuous %s limit of %d exceeded without %s interruption.", 
                                     violations, srcType, srcLimit, tgtType))
                .build();
    }

    private ValidationResultDto checkRestrictionRule(List<ProductionOrderDto> seq, SequencingRuleDto rule) {
        String restrictType = rule.getRestrictType() != null ? rule.getRestrictType() : "TVL";
        String cannotFollow = rule.getCannotFollow() != null ? rule.getCannotFollow() : "KD";

        int violations = 0;
        for (int i = 1; i < seq.size(); i++) {
            ProductionOrderDto current = seq.get(i);
            ProductionOrderDto previous = seq.get(i - 1);
            if (restrictType.equalsIgnoreCase(current.getType()) && cannotFollow.equalsIgnoreCase(previous.getType())) {
                violations++;
            }
        }

        boolean pass = violations == 0;
        return ValidationResultDto.builder()
                .pass(pass)
                .warn(false)
                .name(rule.getName())
                .detail(pass ? "All restriction constraints satisfied." 
                             : String.format("Restriction rule violated %d time(s). %s was placed immediately after %s.", 
                                     violations, restrictType, cannotFollow))
                .build();
    }

    private ValidationResultDto checkPriorityRule(List<ProductionOrderDto> seq, SequencingRuleDto rule) {
        int inversions = 0;
        for (int i = 1; i < seq.size(); i++) {
            ProductionOrderDto current = seq.get(i);
            ProductionOrderDto previous = seq.get(i - 1);
            if (current.getType() != null && current.getType().equalsIgnoreCase(previous.getType())) {
                int prevWeight = getPriorityWeight(previous.getPriority());
                int currWeight = getPriorityWeight(current.getPriority());
                if (prevWeight > currWeight) {
                    inversions++;
                }
            }
        }

        boolean pass = inversions == 0;
        return ValidationResultDto.builder()
                .pass(pass)
                .warn(inversions > 0)
                .name(rule.getName())
                .detail(pass ? "All priority sequencing constraints satisfied." 
                             : String.format("Priority rule has %d inversion(s). Lower priority orders placed before higher priority ones of type CBU/KD/TVL.", 
                                     inversions))
                .build();
    }

    private int getPriorityWeight(String priority) {
        if (priority == null) return 2;
        switch (priority.trim().toUpperCase()) {
            case "HIGH": return 0;
            case "MEDIUM": return 1;
            case "LOW": return 2;
            default: return 2;
        }
    }
}
