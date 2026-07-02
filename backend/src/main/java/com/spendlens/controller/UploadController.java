package com.spendlens.controller;

import com.spendlens.dto.UploadStatusDto;
import com.spendlens.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/uploads")
@Tag(name = "Statement Upload", description = "Inward files ingestion endpoint")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a bank statement CSV", description = "Accepts HDFC, ICICI, SBI or Axis CSV file statements")
    public ResponseEntity<UploadStatusDto> uploadStatement(
            @RequestPart("file") 
            @Parameter(description = "Multipart file statement payload", required = true)
            MultipartFile file
    ) {
        UploadStatusDto statusDto = uploadService.processUpload(file);
        return ResponseEntity.accepted().body(statusDto);
    }
}
