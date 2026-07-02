package com.spendlens.parser.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RawTransactionDto {
    private LocalDate transactionDate;
    private String description;
    private BigDecimal amount;
    private BigDecimal balance;
    private String transactionType; // DEBIT, CREDIT
    private String referenceNumber;
    private String paymentMode; // UPI, CARD, IMPS, NEFT, CASH
}
