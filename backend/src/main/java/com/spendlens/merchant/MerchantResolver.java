package com.spendlens.merchant;

import com.spendlens.entity.Category;
import com.spendlens.entity.Merchant;
import com.spendlens.repository.CategoryRepository;
import com.spendlens.repository.MerchantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MerchantResolver {

    private final MerchantRepository merchantRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Resolves a raw transaction narration into a normalized Merchant reference.
     *
     * @param description The raw bank statement description.
     * @return Resolved Merchant.
     */
    public Merchant resolveMerchant(String description) {
        if (description == null || description.isBlank()) {
            return getOrCreateDefaultMerchant("UNKNOWN", "Uncategorized");
        }

        String upperDesc = description.toUpperCase();

        // 1. Scan DB seed merchants for keyword contains matches
        List<Merchant> merchants = merchantRepository.findAll();
        for (Merchant merchant : merchants) {
            if (upperDesc.contains(merchant.getRawName())) {
                return merchant;
            }
        }

        // 2. Extra hardcoded patterns for common sub-branches not in seed DML
        if (upperDesc.contains("INSTAMART")) {
            return findMerchantByName("Swiggy");
        }
        if (upperDesc.contains("BLINKIT") || upperDesc.contains("GROFERS")) {
            return getOrCreateDefaultMerchant("Blinkit", "Food & Dining");
        }

        // 3. Fallback: Generate a clean default merchant based on stripped narration tokens
        String cleanName = cleanDescription(description);
        return getOrCreateDefaultMerchant(cleanName, "Uncategorized");
    }

    /**
     * Checks if the transaction represents an internal account transfer or credit card repayment.
     *
     * @param description Raw narration.
     * @return true if it is an internal own transfer.
     */
    public boolean isInternalTransfer(String description) {
        if (description == null) return false;
        String upper = description.toUpperCase();
        return upper.contains("OWN A/C") || 
               upper.contains("SELF TRANSFER") || 
               upper.contains("SELF ACCOUNT") || 
               upper.contains("OWN ACCOUNT") || 
               upper.contains("CC PAYMENT") || 
               upper.contains("CREDIT CARD REPAY") || 
               upper.contains("LOAN PAYMENT") ||
               upper.contains("INTERNAL TRANSFER");
    }

    private String cleanDescription(String raw) {
        // Strip out dates, transaction IDs, UPI phone numbers, and reference numbers
        String cleaned = raw.replaceAll("(?i)(UPI/\\d+/\\d+/\\w+|POS/\\d+|\\d{10,20})", "")
                .replaceAll("(?i)(IMPS/\\d+/\\w+|NEFT/\\w+|Ref\\..*|Ref\\s+.*)", "")
                .replaceAll("[\\s*\\-_/]+", " ")
                .trim();
        
        if (cleaned.length() > 50) {
            cleaned = cleaned.substring(0, 50).trim();
        }
        
        return cleaned.isEmpty() ? "UNKNOWN" : capitalizeWord(cleaned);
    }

    private String capitalizeWord(String str) {
        String[] words = str.split("\\s");
        StringBuilder capitalizeWord = new StringBuilder();
        for (String w : words) {
            if (w.isEmpty()) continue;
            String first = w.substring(0, 1);
            String afterfirst = w.substring(1).toLowerCase();
            capitalizeWord.append(first.toUpperCase()).append(afterfirst).append(" ");
        }
        return capitalizeWord.toString().trim();
    }

    private Merchant findMerchantByName(String cleanName) {
        return merchantRepository.findAll().stream()
                .filter(m -> m.getCleanName().equalsIgnoreCase(cleanName))
                .findFirst()
                .orElseGet(() -> getOrCreateDefaultMerchant(cleanName, "Food & Dining"));
    }

    private Merchant getOrCreateDefaultMerchant(String name, String defaultCategoryName) {
        return merchantRepository.findByRawName(name.toUpperCase())
                .orElseGet(() -> {
                    Category category = categoryRepository.findByName(defaultCategoryName)
                            .orElseGet(() -> categoryRepository.findByName("Uncategorized")
                                    .orElseThrow(() -> new IllegalStateException("Core categories are not seeded")));

                    Merchant newMerchant = Merchant.builder()
                            .rawName(name.toUpperCase())
                            .cleanName(name)
                            .category(category)
                            .confidenceScore(BigDecimal.valueOf(0.40))
                            .logoUrl("/assets/logos/default-logo.svg")
                            .build();

                    return merchantRepository.save(newMerchant);
                });
    }
}
