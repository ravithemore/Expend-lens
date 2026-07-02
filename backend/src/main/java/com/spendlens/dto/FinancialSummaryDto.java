package com.spendlens.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialSummaryDto {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netSavings;
    private BigDecimal savingsRate;          // Percentage e.g. 35.50
    private BigDecimal monthlyLimitBudget;    // Combined budget limit for user
    private BigDecimal projectedSpendingVelocity; // Projected total monthly spending based on current pace
    private String topSpendingCategory;
    private String topSpendingMerchant;
}
