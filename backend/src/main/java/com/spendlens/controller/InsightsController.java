package com.spendlens.controller;

import com.spendlens.entity.Insight;
import com.spendlens.service.InsightsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/insights")
@Tag(name = "Insights Engine", description = "Endpoints for anomaly alerts and Spending DNA profiles")
@RequiredArgsConstructor
public class InsightsController {

    private final InsightsService insightsService;

    @GetMapping
    @Operation(summary = "Get active user heuristics notifications list")
    public ResponseEntity<List<Insight>> getActiveInsights() {
        return ResponseEntity.ok(insightsService.getActiveInsights());
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a specific notification insight alert as read")
    public ResponseEntity<Insight> markAsRead(@PathVariable UUID id) {
        return ResponseEntity.ok(insightsService.markAsRead(id));
    }

    @PostMapping("/scan")
    @Operation(summary = "Manually trigger a heuristic scans routine")
    public ResponseEntity<Void> runScan() {
        insightsService.runHeuristicsScans();
        return ResponseEntity.noContent().build();
    }
}
