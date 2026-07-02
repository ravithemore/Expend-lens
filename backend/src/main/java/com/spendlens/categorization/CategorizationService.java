package com.spendlens.categorization;

import com.spendlens.entity.Category;
import com.spendlens.entity.Merchant;
import com.spendlens.entity.Transaction;
import com.spendlens.repository.CategoryRepository;
import com.spendlens.repository.MerchantRepository;
import com.spendlens.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategorizationService {

    private final CategoryRepository categoryRepository;
    private final MerchantRepository merchantRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Determines and assigns the correct Category entity to a Transaction.
     *
     * @param transaction The active transaction.
     */
    public void categorize(Transaction transaction) {
        // Step 1: Check internal transfer flag
        if (transaction.getIsInternalTransfer()) {
            transaction.setCategory(getCategoryByName("Transfers"));
            return;
        }

        // Step 2: Check normalized merchant default category configuration
        if (transaction.getNormalizedMerchant() != null && 
            transaction.getNormalizedMerchant().getCategory() != null) {
            
            // If merchant has a real category (not Uncategorized), use it
            Category mCategory = transaction.getNormalizedMerchant().getCategory();
            if (!mCategory.getName().equals("Uncategorized")) {
                transaction.setCategory(mCategory);
                return;
            }
        }

        // Step 3: Scan transaction description for keywords fallback
        Category resolvedCategory = scanDescriptionKeywords(transaction.getDescription())
                .orElseGet(() -> getCategoryByName("Uncategorized"));

        transaction.setCategory(resolvedCategory);

        // Update merchant mapping if it was previously Uncategorized
        if (transaction.getNormalizedMerchant() != null && 
            transaction.getNormalizedMerchant().getCategory().getName().equals("Uncategorized") &&
            !resolvedCategory.getName().equals("Uncategorized")) {
            
            Merchant merchant = transaction.getNormalizedMerchant();
            merchant.setCategory(resolvedCategory);
            merchantRepository.save(merchant);
        }
    }

    /**
     * Manually overrides a transaction's category and propagates the change historically.
     *
     * @param userId The user ID.
     * @param transactionId The specific transaction to override.
     * @param newCategoryId The target category UUID.
     * @param applyToHistory If true, cascades the change to all transactions of the same merchant.
     * @return The updated transaction.
     */
    @Transactional
    public Transaction overrideCategory(UUID userId, UUID transactionId, UUID newCategoryId, boolean applyToHistory) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (!transaction.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized override request");
        }

        Category newCategory = categoryRepository.findById(newCategoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // 1. Update the specific transaction
        transaction.setCategory(newCategory);
        Transaction savedTransaction = transactionRepository.save(transaction);

        // 2. If historical propagation is selected and a merchant is linked
        if (applyToHistory && transaction.getNormalizedMerchant() != null) {
            Merchant merchant = transaction.getNormalizedMerchant();
            
            // Update the merchant's default category
            merchant.setCategory(newCategory);
            merchantRepository.save(merchant);

            // Update all transactions of this merchant historically
            transactionRepository.updateCategoryForMerchantAndUser(userId, merchant.getId(), newCategory.getId());
        }

        return savedTransaction;
    }

    private Optional<Category> scanDescriptionKeywords(String description) {
        if (description == null) return Optional.empty();
        String upper = description.toUpperCase();

        if (upper.contains("MUTUAL") || upper.contains("SIP") || upper.contains("SECURITIES") || 
            upper.contains("GROWW") || upper.contains("ZERODHA")) {
            return Optional.of(getCategoryByName("Investments"));
        }
        if (upper.contains("RENT") || upper.contains("HOUSE") || upper.contains("MAINTENANCE") || upper.contains("ELECTRICITY")) {
            return Optional.of(getCategoryByName("Utilities & Bills"));
        }
        if (upper.contains("ZOMATO") || upper.contains("SWIGGY") || upper.contains("RESTAURANT") || upper.contains("CAFE") || upper.contains("TEA")) {
            return Optional.of(getCategoryByName("Food & Dining"));
        }
        if (upper.contains("CASHBACK") || upper.contains("REFUND") || upper.contains("DIVIDEND")) {
            return Optional.of(getCategoryByName("Income"));
        }

        return Optional.empty();
    }

    private Category getCategoryByName(String name) {
        return categoryRepository.findByName(name)
                .orElseThrow(() -> new IllegalStateException("Core category '" + name + "' is not seeded"));
    }
}
