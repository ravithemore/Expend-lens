package com.spendlens.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDto {
    private UUID id;
    private LocalDate transactionDate;
    private String description;
    private BigDecimal amount;
    private BigDecimal balance;
    private String transactionType; // DEBIT, CREDIT
    private String paymentMode;
    private String referenceNumber;
    private String merchantName;
    private String categoryName;
    private String categoryColor;
    private String categoryIcon;
    private boolean isInternalTransfer;
}
