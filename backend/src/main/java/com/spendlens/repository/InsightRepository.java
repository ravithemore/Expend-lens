package com.spendlens.repository;

import com.spendlens.entity.Insight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface InsightRepository extends JpaRepository<Insight, UUID> {
    List<Insight> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Insight> findByUserIdAndIsReadOrderByCreatedAtDesc(UUID userId, boolean isRead);
}
