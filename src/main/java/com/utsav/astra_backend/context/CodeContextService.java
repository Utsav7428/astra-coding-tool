package com.utsav.astra_backend.context;

import com.utsav.astra_backend.parser.Symbol;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class CodeContextService {

    public CodeContext getContext(Symbol symbol) {

        Path file = Path.of(symbol.filePath());

        if (!Files.exists(file)) {
            throw new IllegalArgumentException(
                    "Source file does not exist: " + file
            );
        }

        try {

            List<String> lines =
                    Files.readAllLines(file);

            int start =
                    Math.max(0, symbol.startLine());

            int end =
                    Math.min(
                            lines.size() - 1,
                            symbol.endLine()
                    );

            if (start > end) {
                return new CodeContext(
                        symbol.filePath(),
                        symbol.startLine(),
                        symbol.endLine(),
                        ""
                );
            }

            String content =
                    String.join(
                            System.lineSeparator(),
                            lines.subList(start, end + 1)
                    );

            return new CodeContext(
                    symbol.filePath(),
                    symbol.startLine(),
                    symbol.endLine(),
                    content
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to read source file: " + file,
                    e
            );
        }
    }
}