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
public class AxisCsvParser implements BankParser {

    private static final DateTimeFormatter DATE_FORMATTER_DASH = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter DATE_FORMATTER_SLASH = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public boolean supports(String firstLine, String fileExtension) {
        return "csv".equalsIgnoreCase(fileExtension) && 
                (firstLine.toUpperCase().contains("AXIS BANK") || firstLine.toLowerCase().contains("particulars"));
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
                if (line.toLowerCase().contains("particulars") && line.toLowerCase().contains("balance")) {
                    headerFound = true;
                }
                continue;
            }

            String[] columns = parseCsvLine(line);
            if (columns.length < 6) {
                continue;
            }

            try {
                String dateStr = columns[0].trim(); // Tran Date
                String chqNo = columns[1].trim(); // CHQNO
                String particulars = columns[2].trim(); // Particulars
                String debitStr = columns[3].trim(); // Debit
                String creditStr = columns[4].trim(); // Credit
                String balanceStr = columns[5].trim(); // Balance

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
                LocalDate txnDate = parseDate(dateStr);

                transactions.add(RawTransactionDto.builder()
                        .transactionDate(txnDate)
                        .description(particulars)
                        .amount(amount)
                        .balance(balance)
                        .transactionType(type)
                        .referenceNumber(chqNo.isEmpty() || chqNo.equals("-") ? null : chqNo)
                        .paymentMode(resolvePaymentMode(particulars))
                        .build());

            } catch (Exception e) {
                // Skip invalid rows
            }
        }
        return transactions;
    }

    @Override
    public String getBankName() {
        return "Axis Bank";
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr.contains("/")) {
            return LocalDate.parse(dateStr, DATE_FORMATTER_SLASH);
        } else {
            return LocalDate.parse(dateStr, DATE_FORMATTER_DASH);
        }
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
