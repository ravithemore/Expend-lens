package com.spendlens;

import com.spendlens.dto.FinancialSummaryDto;
import com.spendlens.entity.Category;
import com.spendlens.entity.Transaction;
import com.spendlens.repository.TransactionRepository;
import com.spendlens.service.AnalyticsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AnalyticsServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private List<Transaction> mockTransactions;

    @BeforeEach
    public void setUp() {
        Category food = Category.builder().name("Food & Dining").color("#674bb5").icon("restaurant").build();

        Transaction debit1 = Transaction.builder()
                .amount(BigDecimal.valueOf(5000.00))
                .transactionType("DEBIT")
                .isInternalTransfer(false)
                .transactionDate(LocalDate.now())
                .category(food)
                .build();

        Transaction credit1 = Transaction.builder()
                .amount(BigDecimal.valueOf(15000.00))
                .transactionType("CREDIT")
                .isInternalTransfer(false)
                .transactionDate(LocalDate.now())
                .build();

        // Own account self transfer (should be ignored in inflow/outflow totals)
        Transaction transfer = Transaction.builder()
                .amount(BigDecimal.valueOf(2000.00))
                .transactionType("DEBIT")
                .isInternalTransfer(true)
                .transactionDate(LocalDate.now())
                .build();

        mockTransactions = Arrays.asList(debit1, credit1, transfer);
    }

    @Test
    public void testGetSummaryCalculations() {
        when(transactionRepository.findByUserIdAndDateRange(any(), any(), any()))
                .thenReturn(mockTransactions);

        FinancialSummaryDto summary = analyticsService.getSummary(null, null);

        assertNotNull(summary);
        assertEquals(BigDecimal.valueOf(15000.00), summary.getTotalIncome());
        assertEquals(BigDecimal.valueOf(5000.00), summary.getTotalExpenses());
        assertEquals(BigDecimal.valueOf(10000.00), summary.getNetSavings());
        assertEquals(BigDecimal.valueOf(66.67), summary.getSavingsRate());
    }
}
