package com.spendlens.parser;

import com.spendlens.exception.UnsupportedBankFormatException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ParserFactory {

    private final List<BankParser> parsers;

    /**
     * Resolves the matching bank parser for an uploaded file stream.
     *
     * @param inputStream The statement stream.
     * @param fileExtension The statement format extension.
     * @return Resolved BankParser.
     */
    public BankParser getParser(InputStream inputStream, String fileExtension) throws Exception {
        if (!inputStream.markSupported()) {
            throw new IllegalArgumentException("InputStream must support marking to preview headers");
        }

        inputStream.mark(2048); // Mark position to reset later
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
        String firstLine = reader.readLine();
        inputStream.reset(); // Reset cursor position back to the beginning

        if (firstLine == null || firstLine.isBlank()) {
            throw new IllegalArgumentException("Cannot parse empty file");
        }

        return parsers.stream()
                .filter(parser -> parser.supports(firstLine, fileExtension))
                .findFirst()
                .orElseThrow(() -> new UnsupportedBankFormatException(
                        "Unsupported statement layout. Detect signature failed. First line: " + firstLine
                ));
    }
}
