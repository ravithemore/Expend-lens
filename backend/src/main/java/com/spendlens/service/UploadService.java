package com.spendlens.service;

import com.spendlens.dto.UploadStatusDto;
import com.spendlens.entity.Transaction;
import com.spendlens.entity.Upload;
import com.spendlens.entity.User;
import com.spendlens.categorization.CategorizationService;
import com.spendlens.merchant.MerchantResolver;
import com.spendlens.parser.BankParser;
import com.spendlens.parser.ParserFactory;
import com.spendlens.parser.dto.RawTransactionDto;
import com.spendlens.repository.TransactionRepository;
import com.spendlens.repository.UploadRepository;
import com.spendlens.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UploadService {

    private final UploadRepository uploadRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final ParserFactory parserFactory;
    private final MerchantResolver merchantResolver;
    private final CategorizationService categorizationService;

    @Transactional
    public UploadStatusDto processUpload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot parse empty file");
        }
        if (file.getSize() > 20 * 1024 * 1024) {
            throw new IllegalArgumentException("File exceeds maximum allowed size of 20MB");
        }

        // 1. Fetch authenticated user context
        User user = userRepository.findById(com.spendlens.security.SecurityUtils.getAuthenticatedUserId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user context missing."));

        String originalName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalName);

        // 2. Initialize upload record
        Upload upload = Upload.builder()
                .user(user)
                .bankName("DETECTING...")
                .status("PENDING")
                .fileName(originalName != null ? originalName : "statement.csv")
                .fileSize((int) file.getSize())
                .recordCount(0)
                .build();
        upload = uploadRepository.save(upload);

        try (InputStream fileStream = file.getInputStream();
             BufferedInputStream bufferedStream = new BufferedInputStream(fileStream)) {

            // 3. Resolve Bank Parser
            BankParser parser = parserFactory.getParser(bufferedStream, fileExtension);
            upload.setBankName(parser.getBankName());
            upload.setStatus("PARSING");
            upload = uploadRepository.save(upload);

            // 4. Extract Raw DTOs
            List<RawTransactionDto> rawTxs = parser.parse(bufferedStream);

            // 5. Ingest: Normalize & Categorize loop
            List<Transaction> transactionsToSave = new ArrayList<>();
            for (RawTransactionDto rawDto : rawTxs) {
                boolean duplicateExists = transactionRepository.existsByUserIdAndTransactionDateAndDescriptionAndAmountAndBalanceAndTransactionType(
                        user.getId(),
                        rawDto.getTransactionDate(),
                        rawDto.getDescription(),
                        rawDto.getAmount(),
                        rawDto.getBalance(),
                        rawDto.getTransactionType()
                );

                if (duplicateExists) {
                    continue; // Skip duplicate transactions
                }

                Transaction transaction = Transaction.builder()
                        .user(user)
                        .upload(upload)
                        .transactionDate(rawDto.getTransactionDate())
                        .description(rawDto.getDescription())
                        .amount(rawDto.getAmount())
                        .balance(rawDto.getBalance())
                        .transactionType(rawDto.getTransactionType())
                        .paymentMode(rawDto.getPaymentMode())
                        .referenceNumber(rawDto.getReferenceNumber())
                        .isInternalTransfer(merchantResolver.isInternalTransfer(rawDto.getDescription()))
                        .build();

                // Normalizer
                transaction.setNormalizedMerchant(merchantResolver.resolveMerchant(rawDto.getDescription()));
                
                // Categorizer
                categorizationService.categorize(transaction);

                transactionsToSave.add(transaction);
            }

            // 6. Bulk Save
            if (!transactionsToSave.isEmpty()) {
                transactionRepository.saveAll(transactionsToSave);
            }

            // 7. Update status to success
            upload.setStatus("COMPLETED");
            upload.setRecordCount(transactionsToSave.size());
            upload = uploadRepository.save(upload);

        } catch (Exception e) {
            upload.setStatus("FAILED");
            uploadRepository.save(upload);
            throw new RuntimeException("Statement processing failed: " + e.getMessage(), e);
        }

        return mapToDto(upload);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "csv";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    private UploadStatusDto mapToDto(Upload upload) {
        return UploadStatusDto.builder()
                .uploadId(upload.getId())
                .fileName(upload.getFileName())
                .fileSize(upload.getFileSize())
                .status(upload.getStatus())
                .recordCount(upload.getRecordCount())
                .createdAt(upload.getCreatedAt())
                .build();
    }
}
