package com.spendlens;

import com.spendlens.parser.dto.RawTransactionDto;
import com.spendlens.parser.impl.HdfcCsvParser;
import org.junit.jupiter.api.Test;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class HdfcCsvParserTest {

    private final HdfcCsvParser parser = new HdfcCsvParser();

    @Test
    public void testSupportsValidation() {
        assertTrue(parser.supports("HDFC BANK savings statement", "csv"));
        assertTrue(parser.supports("Date,Narration,Chq./Ref.No.,Value Date", "csv"));
        assertFalse(parser.supports("SOME OTHER BANK", "csv"));
        assertFalse(parser.supports("HDFC BANK", "pdf"));
    }

    @Test
    public void testParseValidCsvLines() throws Exception {
        String csvData = "HDFC BANK SAVINGS ACCOUNT STATEMENT\n" +
                "Date,Narration,Chq./Ref.No.,Value Date,Withdrawal Amt.,Deposit Amt.,Closing Balance\n" +
                "01/07/26,UPI-SWIGGY-ORDER,592819382,01/07/26,450.00,,24050.00\n" +
                "02/07/26,INTEREST CREDIT,,02/07/26,,150.00,24200.00\n" +
                "***** END OF STATEMENT *****";

        InputStream stream = new ByteArrayInputStream(csvData.getBytes(StandardCharsets.UTF_8));
        List<RawTransactionDto> txs = parser.parse(stream);

        assertEquals(2, txs.size());

        // Check first transaction (Debit)
        RawTransactionDto tx1 = txs.get(0);
        assertEquals(LocalDate.of(2026, 7, 1), tx1.getTransactionDate());
        assertEquals("UPI-SWIGGY-ORDER", tx1.getDescription());
        assertEquals(new BigDecimal("450.00"), tx1.getAmount());
        assertEquals(new BigDecimal("24050.00"), tx1.getBalance());
        assertEquals("DEBIT", tx1.getTransactionType());
        assertEquals("UPI", tx1.getPaymentMode());

        // Check second transaction (Credit)
        RawTransactionDto tx2 = txs.get(1);
        assertEquals(LocalDate.of(2026, 7, 2), tx2.getTransactionDate());
        assertEquals("INTEREST CREDIT", tx2.getDescription());
        assertEquals(new BigDecimal("150.00"), tx2.getAmount());
        assertEquals(new BigDecimal("24200.00"), tx2.getBalance());
        assertEquals("CREDIT", tx2.getTransactionType());
    }
}
