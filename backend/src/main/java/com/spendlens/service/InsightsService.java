package com.spendlens.service;

import com.spendlens.entity.Insight;
import com.spendlens.entity.Transaction;
import com.spendlens.entity.User;
import com.spendlens.repository.InsightRepository;
import com.spendlens.repository.TransactionRepository;
import com.spendlens.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InsightsService {

    private final InsightRepository insightRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<Insight> getActiveInsights() {
        UUID userId = com.spendlens.security.SecurityUtils.getAuthenticatedUserId();
        List<Insight> list = insightRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (list.isEmpty()) {
            runHeuristicsScans();
            return insightRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return list;
    }

    /**
     * Marks an insight as read.
     */
    @Transactional
    public Insight markAsRead(UUID insightId) {
        Insight insight = insightRepository.findById(insightId)
                .orElseThrow(() -> new IllegalArgumentException("Insight not found"));
        insight.setIsRead(true);
        return insightRepository.save(insight);
    }

    /**
     * Runs rule-based scanning logic to generate Insights database notifications.
     */
    @Transactional
    public void runHeuristicsScans() {
        UUID userId = com.spendlens.security.SecurityUtils.getAuthenticatedUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user context not found"));

        // Load all transactions
        LocalDate now = LocalDate.now();
        LocalDate start = now.minusMonths(6).withDayOfMonth(1);
        List<Transaction> txs = transactionRepository.findByUserIdAndDateRange(userId, start, now);

        if (txs.isEmpty()) {
            return;
        }

        // Clean out stale unread insights
        List<Insight> old = insightRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        insightRepository.deleteAll(old);

        // 1. Subscription Scanner
        detectSubscriptions(txs, user);

        // 2. Spending DNA Profiler
        buildSpendingDna(txs, user);

        // 3. Category Anomaly Spike Warnings
        detectCategorySpikes(txs, user);
    }

    private void detectSubscriptions(List<Transaction> txs, User user) {
        Map<String, List<Transaction>> merchantTxGroups = new HashMap<>();
        for (Transaction t : txs) {
            if (t.getIsInternalTransfer() || !"DEBIT".equalsIgnoreCase(t.getTransactionType()) || t.getNormalizedMerchant() == null) {
                continue;
            }
            String name = t.getNormalizedMerchant().getCleanName();
            merchantTxGroups.computeIfAbsent(name, k -> new ArrayList<>()).add(t);
        }

        for (Map.Entry<String, List<Transaction>> entry : merchantTxGroups.entrySet()) {
            List<Transaction> list = entry.getValue();
            if (list.size() < 2) continue;

            // Sort by date ascending
            list.sort(Comparator.comparing(Transaction::getTransactionDate));

            for (int i = 0; i < list.size() - 1; i++) {
                Transaction t1 = list.get(i);
                Transaction t2 = list.get(i + 1);

                long days = ChronoUnit.DAYS.between(t1.getTransactionDate(), t2.getTransactionDate());
                // Monthly cycle match (25-33 days window)
                if (days >= 25 && days <= 35) {
                    BigDecimal diff = t1.getAmount().subtract(t2.getAmount()).abs();
                    BigDecimal avg = t1.getAmount().add(t2.getAmount()).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                    
                    // Amount within 10% tolerance
                    if (avg.compareTo(BigDecimal.ZERO) > 0 && 
                        diff.divide(avg, 2, RoundingMode.HALF_UP).compareTo(BigDecimal.valueOf(0.10)) <= 0) {
                        
                        Insight subInsight = Insight.builder()
                                .user(user)
                                .insightType("SUBSCRIPTION")
                                .title("Active Subscription: " + entry.getKey())
                                .message(String.format("Detected recurring subscription charge of INR %s for %s occurring every month.", 
                                        t1.getAmount().setScale(2, RoundingMode.HALF_UP), entry.getKey()))
                                .build();
                        insightRepository.save(subInsight);
                        break; // Avoid double alerts for same merchant
                    }
                }
            }
        }
    }

    private void buildSpendingDna(List<Transaction> txs, User user) {
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;
        int investmentCount = 0;

        for (Transaction t : txs) {
            if (t.getIsInternalTransfer()) continue;
            if ("CREDIT".equalsIgnoreCase(t.getTransactionType())) {
                totalIncome = totalIncome.add(t.getAmount());
            } else if ("DEBIT".equalsIgnoreCase(t.getTransactionType())) {
                totalExpenses = totalExpenses.add(t.getAmount());
                if (t.getCategory() != null && "Investments".equalsIgnoreCase(t.getCategory().getName())) {
                    investmentCount++;
                }
            }
        }

        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = totalIncome.subtract(totalExpenses)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalIncome, 2, RoundingMode.HALF_UP);
        }

        String dnaTitle;
        String dnaMessage;

        if (savingsRate.compareTo(BigDecimal.valueOf(35.00)) >= 0) {
            dnaTitle = "Spending DNA: Disciplined Builder";
            dnaMessage = String.format("Outstanding! You maintain a high savings rate of %s%%, channeling surpluses to compound your net worth.", savingsRate);
        } else if (investmentCount >= 2) {
            dnaTitle = "Spending DNA: Future-focused Investor";
            dnaMessage = "You consistently allocate capital toward investment vehicles, prioritizing wealth generation over active consumption.";
        } else if (savingsRate.compareTo(BigDecimal.valueOf(10.00)) < 0 && totalExpenses.compareTo(BigDecimal.valueOf(15000.00)) >= 0) {
            dnaTitle = "Spending DNA: High-Velocity Shopper";
            dnaMessage = "Your monthly reserves are lean due to active debit outlays. Consider setting a categories threshold limit to block impulse items.";
        } else {
            dnaTitle = "Spending DNA: Balanced Minimalist";
            dnaMessage = "You maintain steady budget ratios, balancing current living demands with stable future savings allocations.";
        }

        Insight dnaInsight = Insight.builder()
                .user(user)
                .insightType("SPENDING_DNA")
                .title(dnaTitle)
                .message(dnaMessage)
                .build();
        insightRepository.save(dnaInsight);
    }

    private void detectCategorySpikes(List<Transaction> txs, User user) {
        LocalDate currentMonthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate lastMonthStart = currentMonthStart.minusMonths(1);
        LocalDate lastMonthEnd = currentMonthStart.minusDays(1);

        Map<String, BigDecimal> currentSpends = new HashMap<>();
        Map<String, BigDecimal> lastSpends = new HashMap<>();

        for (Transaction t : txs) {
            if (t.getIsInternalTransfer() || !"DEBIT".equalsIgnoreCase(t.getTransactionType())) {
                continue;
            }
            String catName = (t.getCategory() != null) ? t.getCategory().getName() : "Uncategorized";
            LocalDate date = t.getTransactionDate();

            if (!date.isBefore(currentMonthStart)) {
                currentSpends.put(catName, currentSpends.getOrDefault(catName, BigDecimal.ZERO).add(t.getAmount()));
            } else if (!date.isBefore(lastMonthStart) && !date.isAfter(lastMonthEnd)) {
                lastSpends.put(catName, lastSpends.getOrDefault(catName, BigDecimal.ZERO).add(t.getAmount()));
            }
        }

        for (Map.Entry<String, BigDecimal> entry : currentSpends.entrySet()) {
            String cat = entry.getKey();
            BigDecimal current = entry.getValue();
            BigDecimal last = lastSpends.get(cat);

            if (last != null && last.compareTo(BigDecimal.valueOf(2000.00)) >= 0) { // Limit notifications to major categories
                BigDecimal ratio = current.divide(last, 2, RoundingMode.HALF_UP);
                if (ratio.compareTo(BigDecimal.valueOf(1.20)) >= 0) { // 20% spike threshold
                    BigDecimal percentGrowth = ratio.subtract(BigDecimal.ONE).multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP);
                    
                    Insight spikeInsight = Insight.builder()
                            .user(user)
                            .insightType("ANOMALY")
                            .title("Spending Spike: " + cat)
                            .message(String.format("Your outlays in %s spiked by %s%% compared to last month's averages.", cat, percentGrowth))
                            .build();
                    insightRepository.save(spikeInsight);
                }
            }
        }
    }
}
