package com.spendlens.service;

import com.spendlens.dto.CategoryBreakdownDto;
import com.spendlens.dto.FinancialSummaryDto;
import com.spendlens.entity.Transaction;
import com.spendlens.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    public FinancialSummaryDto getSummary(LocalDate start, LocalDate end) {
        LocalDate startDate = (start != null) ? start : LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = (end != null) ? end : LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());

        List<Transaction> txs = transactionRepository.findByUserIdAndDateRange(
                com.spendlens.security.SecurityUtils.getAuthenticatedUserId(), 
                startDate, 
                endDate
        );

        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expenses = BigDecimal.ZERO;

        for (Transaction t : txs) {
            if (t.getIsInternalTransfer()) {
                continue;
            }
            if ("CREDIT".equalsIgnoreCase(t.getTransactionType())) {
                income = income.add(t.getAmount());
            } else if ("DEBIT".equalsIgnoreCase(t.getTransactionType())) {
                expenses = expenses.add(t.getAmount());
            }
        }

        BigDecimal netSavings = income.subtract(expenses);
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (income.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netSavings.multiply(BigDecimal.valueOf(100))
                    .divide(income, 2, RoundingMode.HALF_UP);
        }

        // Calculate Spending Velocity
        BigDecimal velocity = calculateVelocity(expenses, startDate, endDate);

        // Resolve top category & top merchant
        String topCategory = resolveTopCategory(txs);
        String topMerchant = resolveTopMerchant(txs);

        return FinancialSummaryDto.builder()
                .totalIncome(income)
                .totalExpenses(expenses)
                .netSavings(netSavings)
                .savingsRate(savingsRate)
                .monthlyLimitBudget(BigDecimal.valueOf(50000.00)) // Standard fallback
                .projectedSpendingVelocity(velocity)
                .topSpendingCategory(topCategory)
                .topSpendingMerchant(topMerchant)
                .build();
    }

    /**
     * Compiles category breakdowns for list elements.
     */
    public List<CategoryBreakdownDto> getCategoryBreakdowns(LocalDate start, LocalDate end) {
        LocalDate startDate = (start != null) ? start : LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = (end != null) ? end : LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);

        List<Transaction> txs = transactionRepository.findByUserIdAndDateRange(
                com.spendlens.security.SecurityUtils.getAuthenticatedUserId(), 
                startDate, 
                endDate
        );

        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> categorySums = new HashMap<>();
        Map<String, String> colors = new HashMap<>();
        Map<String, String> icons = new HashMap<>();

        for (Transaction t : txs) {
            if (t.getIsInternalTransfer() || !"DEBIT".equalsIgnoreCase(t.getTransactionType())) {
                continue;
            }
            String catName = (t.getCategory() != null) ? t.getCategory().getName() : "Uncategorized";
            BigDecimal amt = t.getAmount();

            totalExpense = totalExpense.add(amt);
            categorySums.put(catName, categorySums.getOrDefault(catName, BigDecimal.ZERO).add(amt));
            
            if (t.getCategory() != null) {
                colors.put(catName, t.getCategory().getColor());
                icons.put(catName, t.getCategory().getIcon());
            }
        }

        List<CategoryBreakdownDto> breakdowns = new ArrayList<>();
        BigDecimal finalTotal = totalExpense;

        for (Map.Entry<String, BigDecimal> entry : categorySums.entrySet()) {
            BigDecimal percentage = BigDecimal.ZERO;
            if (finalTotal.compareTo(BigDecimal.ZERO) > 0) {
                percentage = entry.getValue().multiply(BigDecimal.valueOf(100))
                        .divide(finalTotal, 2, RoundingMode.HALF_UP);
            }

            breakdowns.add(CategoryBreakdownDto.builder()
                    .categoryName(entry.getKey())
                    .amount(entry.getValue())
                    .percentage(percentage)
                    .color(colors.getOrDefault(entry.getKey(), "#cac4d4"))
                    .icon(icons.getOrDefault(entry.getKey(), "help"))
                    .build());
        }

        breakdowns.sort(Comparator.comparing(CategoryBreakdownDto::getAmount).reversed());
        return breakdowns;
    }

    private BigDecimal calculateVelocity(BigDecimal expenses, LocalDate start, LocalDate end) {
        LocalDate today = LocalDate.now();
        if (today.isBefore(start) || today.isAfter(end)) {
            return expenses; // Past or future months: no velocity projection needed
        }

        long daysElapsed = ChronoUnit.DAYS.between(start, today) + 1;
        long totalDays = ChronoUnit.DAYS.between(start, end) + 1;

        if (daysElapsed <= 0) {
            return expenses;
        }

        BigDecimal dailyRate = expenses.divide(BigDecimal.valueOf(daysElapsed), 4, RoundingMode.HALF_UP);
        return dailyRate.multiply(BigDecimal.valueOf(totalDays)).setScale(2, RoundingMode.HALF_UP);
    }

    private String resolveTopCategory(List<Transaction> txs) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (Transaction t : txs) {
            if (t.getIsInternalTransfer() || !"DEBIT".equalsIgnoreCase(t.getTransactionType())) {
                continue;
            }
            String catName = (t.getCategory() != null) ? t.getCategory().getName() : "Uncategorized";
            map.put(catName, map.getOrDefault(catName, BigDecimal.ZERO).add(t.getAmount()));
        }

        return map.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
    }

    private String resolveTopMerchant(List<Transaction> txs) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (Transaction t : txs) {
            if (t.getIsInternalTransfer() || !"DEBIT".equalsIgnoreCase(t.getTransactionType())) {
                continue;
            }
            String name = (t.getNormalizedMerchant() != null) ? t.getNormalizedMerchant().getCleanName() : "Unknown";
            if ("Unknown".equalsIgnoreCase(name)) continue;
            map.put(name, map.getOrDefault(name, BigDecimal.ZERO).add(t.getAmount()));
        }

        return map.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
    }
}
