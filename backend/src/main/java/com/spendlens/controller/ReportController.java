package com.spendlens.controller;

import com.spendlens.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Report Engine", description = "Endpoints for downloading wealth PDFs and ledgers")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/pdf")
    @Operation(summary = "Download printable PDF monthly report statement")
    public ResponseEntity<byte[]> downloadMonthlyReportPdf() {
        try {
            byte[] pdfBytes = reportService.generateMonthlyReportPdf();
            
            String fileName = String.format("SpendLens_Wealth_Report_%s.pdf", 
                    LocalDate.now().format(DateTimeFormatter.ofPattern("MMM_yyyy")));

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
