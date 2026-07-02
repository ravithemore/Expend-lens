package com.spendlens.parser.impl;

import com.spendlens.parser.BankParser;
import com.spendlens.parser.dto.RawTransactionDto;
import org.springframework.stereotype.Component;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class SbiCsvParser implements BankParser {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("d-MMM-yyyy", Locale.ENGLISH);

    @Override
    public boolean supports(String firstLine, String fileExtension) {
        return "csv".equalsIgnoreCase(fileExtension) && 
                (firstLine.toUpperCase().contains("STATE BANK OF INDIA") || firstLine.toLowerCase().contains("ref no./cheque no."));
    }

    @Override
    public List<RawTransactionDto> parse(InputStream inputStream) throws Exception {
        List<RawTransactionDto> transactions = new ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
        String line;
        boolean headerFound = false;

        while ((line = reader.readLine()) != null) {
            if (line.trim().isEmpty()) {
                continue;
            }

            if (!headerFound) {
                if (line.toLowerCase().contains("txn date") && line.toLowerCase().contains("description")) {
                    headerFound = true;
                }
                continue;
            }

            String[] columns = parseCsvLine(line);
            if (columns.length < 7) {
                continue;
            }

            try {
                String dateStr = columns[0].trim(); // Txn Date
                String valueDateStr = columns[1].trim(); // Value Date
                String description = columns[2].trim(); // Description
                String refNo = columns[3].trim(); // Ref No./Cheque No.
                String debitStr = columns[4].trim(); // Debit
                String creditStr = columns[5].trim(); // Credit
                String balanceStr = columns[6].trim(); // Balance

                BigDecimal amount = BigDecimal.ZERO;
                String type = "DEBIT";

                if (!debitStr.isEmpty() && !debitStr.equals("0") && !debitStr.equals("0.00")) {
                    amount = new BigDecimal(cleanAmountString(debitStr));
                    type = "DEBIT";
                } else if (!creditStr.isEmpty() && !creditStr.equals("0") && !creditStr.equals("0.00")) {
                    amount = new BigDecimal(cleanAmountString(creditStr));
                    type = "CREDIT";
                } else {
                    continue;
                }

                BigDecimal balance = new BigDecimal(cleanAmountString(balanceStr));
                LocalDate txnDate = LocalDate.parse(dateStr, DATE_FORMATTER);

                transactions.add(RawTransactionDto.builder()
                        .transactionDate(txnDate)
                        .description(description)
                        .amount(amount)
                        .balance(balance)
                        .transactionType(type)
                        .referenceNumber(refNo.isEmpty() ? null : refNo)
                        .paymentMode(resolvePaymentMode(description))
                        .build());

            } catch (Exception e) {
                // Skip invalid rows
            }
        }
        return transactions;
    }

    @Override
    public String getBankName() {
        return "State Bank of India";
    }

    private String cleanAmountString(String amt) {
        return amt.replaceAll(",", "").trim();
    }

    private String resolvePaymentMode(String narration) {
        String upper = narration.toUpperCase();
        if (upper.contains("UPI")) return "UPI";
        if (upper.contains("POS") || upper.contains("CARD")) return "CARD";
        if (upper.contains("IMPS")) return "IMPS";
        if (upper.contains("NEFT")) return "NEFT";
        return "CASH";
    }

    private String[] parseCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                tokens.add(sb.toString().trim());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString().trim());
        return tokens.toArray(new String[0]);
    }
}
