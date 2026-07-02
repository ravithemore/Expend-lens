package com.spendlens.parser;

import com.spendlens.parser.dto.RawTransactionDto;
import java.io.InputStream;
import java.util.List;

public interface BankParser {
    
    /**
     * Identifies if this parser supports the statement format by reading the header or metadata.
     *
     * @param firstLine The first line of the file (headers preview).
     * @param fileExtension The uploaded file format (e.g. "csv").
     * @return true if the parser can process the statement.
     */
    boolean supports(String firstLine, String fileExtension);

    /**
     * Parses the statement stream into a collection of RawTransactionDto payloads.
     *
     * @param inputStream The statement file's input stream.
     * @return A list of parsed records.
     * @throws Exception If parsing fails.
     */
    List<RawTransactionDto> parse(InputStream inputStream) throws Exception;

    /**
     * Returns the name of the bank associated with this parser.
     */
    String getBankName();
}
