package com.spendlens.repository;

import com.spendlens.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    
    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId AND t.transactionDate >= :start AND t.transactionDate <= :end ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    @Modifying
    @Query("UPDATE Transaction t SET t.category.id = :categoryId WHERE t.user.id = :userId AND t.normalizedMerchant.id = :merchantId")
    int updateCategoryForMerchantAndUser(
            @Param("userId") UUID userId,
            @Param("merchantId") UUID merchantId,
            @Param("categoryId") UUID categoryId
    );

    boolean existsByUserIdAndTransactionDateAndDescriptionAndAmountAndBalanceAndTransactionType(
            UUID userId,
            LocalDate transactionDate,
            String description,
            java.math.BigDecimal amount,
            java.math.BigDecimal balance,
            String transactionType
    );
}
