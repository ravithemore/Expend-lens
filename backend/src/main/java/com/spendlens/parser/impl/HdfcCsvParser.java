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

@Component
public class HdfcCsvParser implements BankParser {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yy");

    @Override
    public boolean supports(String firstLine, String fileExtension) {
        return "csv".equalsIgnoreCase(fileExtension) && 
                (firstLine.toUpperCase().contains("HDFC BANK") || firstLine.toUpperCase().contains("NARRATION"));
    }

    @Override
    public List<RawTransactionDto> parse(InputStream inputStream) throws Exception {
        List<RawTransactionDto> transactions = new ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
        String line;
        boolean headerFound = false;

        while ((line = reader.readLine()) != null) {
            // Skip empty lines
            if (line.trim().isEmpty()) {
                continue;
            }

            // Identify the HDFC CSV header row
            if (!headerFound) {
                if (line.toLowerCase().contains("date") && line.toLowerCase().contains("narration")) {
                    headerFound = true;
                }
                continue;
            }

            // End of transactions list marker
            if (line.toLowerCase().contains("statement summary") || line.startsWith("*****")) {
                break;
            }

            String[] columns = parseCsvLine(line);
            if (columns.length < 7) {
                continue;
            }

            try {
                String dateStr = columns[0].trim();
                String narration = columns[1].trim();
                String refNo = columns[2].trim();
                String withdrawalStr = columns[4].trim();
                String depositStr = columns[5].trim();
                String balanceStr = columns[6].trim();

                BigDecimal amount = BigDecimal.ZERO;
                String type = "DEBIT";

                if (!withdrawalStr.isEmpty() && !withdrawalStr.equals("0") && !withdrawalStr.equals("0.00")) {
                    amount = new BigDecimal(cleanAmountString(withdrawalStr));
                    type = "DEBIT";
                } else if (!depositStr.isEmpty() && !depositStr.equals("0") && !depositStr.equals("0.00")) {
                    amount = new BigDecimal(cleanAmountString(depositStr));
                    type = "CREDIT";
                } else {
                    continue; // Skip lines with zero amount
                }

                BigDecimal balance = new BigDecimal(cleanAmountString(balanceStr));
                LocalDate txnDate = LocalDate.parse(dateStr, DATE_FORMATTER);

                transactions.add(RawTransactionDto.builder()
                        .transactionDate(txnDate)
                        .description(narration)
                        .amount(amount)
                        .balance(balance)
                        .transactionType(type)
                        .referenceNumber(refNo)
                        .paymentMode(resolvePaymentMode(narration, refNo))
                        .build());

            } catch (Exception e) {
                // Ignore parsing errors for individual lines (e.g. trailer summary rows)
            }
        }
        return transactions;
    }

    @Override
    public String getBankName() {
        return "HDFC Bank";
    }

    private String cleanAmountString(String amt) {
        return amt.replaceAll(",", "").trim();
    }

    private String resolvePaymentMode(String narration, String ref) {
        String upper = narration.toUpperCase();
        if (upper.contains("UPI")) return "UPI";
        if (upper.contains("POS") || upper.contains("CARD")) return "CARD";
        if (upper.contains("IMPS")) return "IMPS";
        if (upper.contains("NEFT")) return "NEFT";
        return "CASH";
    }

    // Helper method to split CSV lines, supporting values with commas enclosed in double quotes
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
                sb.setLength(0); // clear buffer
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString().trim());
        return tokens.toArray(new String[0]);
    }
}
