package com.spendlens;

import com.spendlens.entity.Insight;
import com.spendlens.entity.Merchant;
import com.spendlens.entity.Transaction;
import com.spendlens.entity.User;
import com.spendlens.repository.InsightRepository;
import com.spendlens.repository.TransactionRepository;
import com.spendlens.repository.UserRepository;
import com.spendlens.service.InsightsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InsightsServiceTest {

    @Mock
    private InsightRepository insightRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private InsightsService insightsService;

    @Test
    public void testDetectRecurringSubscriptions() {
        User user = User.builder().id(UUID.randomUUID()).email("dev@spendlens.com").build();
        when(userRepository.findById(any())).thenReturn(Optional.of(user));

        Merchant netflix = Merchant.builder().cleanName("Netflix").build();

        // Netflix subscription charges separated by exactly 30 days
        Transaction charge1 = Transaction.builder()
                .amount(BigDecimal.valueOf(199.00))
                .transactionType("DEBIT")
                .isInternalTransfer(false)
                .transactionDate(LocalDate.now().minusDays(30))
                .normalizedMerchant(netflix)
                .build();

        Transaction charge2 = Transaction.builder()
                .amount(BigDecimal.valueOf(199.00))
                .transactionType("DEBIT")
                .isInternalTransfer(false)
                .transactionDate(LocalDate.now())
                .normalizedMerchant(netflix)
                .build();

        List<Transaction> txs = Arrays.asList(charge1, charge2);
        when(transactionRepository.findByUserIdAndDateRange(any(), any(), any())).thenReturn(txs);

        insightsService.runHeuristicsScans();

        // Verify that a SUBSCRIPTION insight is persisted to DB
        verify(insightRepository, atLeastOnce()).save(argThat(insight -> 
            "SUBSCRIPTION".equals(insight.getInsightType()) && insight.getTitle().contains("Netflix")
        ));
    }
}
