package com.spendlens.service;

import com.spendlens.dto.FinancialSummaryDto;
import com.spendlens.entity.Transaction;
import com.spendlens.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final AnalyticsService analyticsService;
    private final TemplateEngine templateEngine;

    public byte[] generateMonthlyReportPdf() throws Exception {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);

        // 1. Fetch metrics & transaction ledgers
        FinancialSummaryDto summary = analyticsService.getSummary(start, end);
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateRange(
                com.spendlens.security.SecurityUtils.getAuthenticatedUserId(), 
                start, 
                end
        );

        // 2. Prepare Thymeleaf Context variables
        Context context = new Context();
        context.setVariable("summary", summary);
        context.setVariable("transactions", transactions);
        context.setVariable("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm:ss")));
        context.setVariable("monthYear", LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM yyyy")));

        // 3. Render HTML template to String
        String htmlContent = templateEngine.process("pdf/wealth-report", context);

        // 4. Generate PDF using Flying Saucer ITextRenderer
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);
            return outputStream.toByteArray();
        }
    }
}
