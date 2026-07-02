package com.spendlens.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryBreakdownDto {
    private String categoryName;
    private String color;
    private String icon;
    private BigDecimal amount;
    private BigDecimal percentage; // e.g. 15.40
}
