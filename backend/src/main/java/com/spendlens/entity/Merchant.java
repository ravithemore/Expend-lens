package com.spendlens.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "merchants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Merchant {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "raw_name", unique = true, nullable = false)
    private String rawName;

    @Column(name = "clean_name", nullable = false)
    private String cleanName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(length = 255)
    private String website;

    @Column(name = "confidence_score", nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal confidenceScore = BigDecimal.valueOf(1.00);
}
