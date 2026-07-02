package com.spendlens;

import com.spendlens.entity.Category;
import com.spendlens.entity.Merchant;
import com.spendlens.merchant.MerchantResolver;
import com.spendlens.repository.CategoryRepository;
import com.spendlens.repository.MerchantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MerchantResolverTest {

    @Mock
    private MerchantRepository merchantRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private MerchantResolver resolver;

    private Merchant swiggyMerchant;
    private Category foodCategory;

    @BeforeEach
    public void setUp() {
        foodCategory = Category.builder()
                .name("Food & Dining")
                .type("EXPENSE")
                .build();

        swiggyMerchant = Merchant.builder()
                .rawName("SWIGGY")
                .cleanName("Swiggy")
                .category(foodCategory)
                .confidenceScore(BigDecimal.valueOf(1.00))
                .build();
    }

    @Test
    public void testResolveMatchedMerchant() {
        // Mock list contains Swiggy
        when(merchantRepository.findAll()).thenReturn(Collections.singletonList(swiggyMerchant));

        Merchant result = resolver.resolveMerchant("UPI/618290382/SWIGGY-ORDER");
        
        assertNotNull(result);
        assertEquals("Swiggy", result.getCleanName());
        assertEquals("Food & Dining", result.getCategory().getName());
        verify(merchantRepository, never()).save(any());
    }

    @Test
    public void testIsInternalTransfer() {
        assertTrue(resolver.isInternalTransfer("SELF ACCOUNT TRANSFER"));
        assertTrue(resolver.isInternalTransfer("CC PAYMENT HDFC CARD"));
        assertFalse(resolver.isInternalTransfer("UPI/ZOMATO/ORDER"));
    }
}
