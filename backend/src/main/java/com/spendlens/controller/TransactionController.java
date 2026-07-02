package com.spendlens.controller;

import com.spendlens.dto.TransactionDto;
import com.spendlens.entity.Transaction;
import com.spendlens.repository.TransactionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/transactions")
@Tag(name = "Transactions Ledger", description = "Query flat transactions lists")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;
    @GetMapping
    @Operation(summary = "Get list of all user transactions for current months range")
    public ResponseEntity<List<TransactionDto>> getTransactions() {
        LocalDate start = LocalDate.now().minusMonths(6).withDayOfMonth(1);
        LocalDate end = LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);
        
        List<Transaction> list = transactionRepository.findByUserIdAndDateRange(
                com.spendlens.security.SecurityUtils.getAuthenticatedUserId(), 
                start, 
                end
        );
        
        List<TransactionDto> dtos = list.stream().map(t -> TransactionDto.builder()
                .id(t.getId())
                .transactionDate(t.getTransactionDate())
                .description(t.getDescription())
                .amount(t.getAmount())
                .balance(t.getBalance())
                .transactionType(t.getTransactionType())
                .paymentMode(t.getPaymentMode())
                .referenceNumber(t.getReferenceNumber())
                .merchantName(t.getNormalizedMerchant() != null ? t.getNormalizedMerchant().getCleanName() : "Unknown")
                .categoryName(t.getCategory() != null ? t.getCategory().getName() : "Uncategorized")
                .categoryColor(t.getCategory() != null ? t.getCategory().getColor() : "#cac4d4")
                .categoryIcon(t.getCategory() != null ? t.getCategory().getIcon() : "help")
                .isInternalTransfer(t.getIsInternalTransfer())
                .build()
        ).collect(Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }
}
