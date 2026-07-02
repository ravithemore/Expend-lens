package com.spendlens.controller;

import com.spendlens.dto.CategoryBreakdownDto;
import com.spendlens.dto.FinancialSummaryDto;
import com.spendlens.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Analytics Engine", description = "Endpoints for finance totals, spending speed, and breakdowns")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    @Operation(summary = "Get high-level summary cards parameters")
    public ResponseEntity<FinancialSummaryDto> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(analyticsService.getSummary(startDate, endDate));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get breakdown metrics of category ratios")
    public ResponseEntity<List<CategoryBreakdownDto>> getCategoryBreakdowns(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(analyticsService.getCategoryBreakdowns(startDate, endDate));
    }
}
