package com.spendlens.dto;

import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadStatusDto {
    private UUID uploadId;
    private String fileName;
    private Integer fileSize;
    private String status;
    private Integer recordCount;
    private Instant createdAt;
}
