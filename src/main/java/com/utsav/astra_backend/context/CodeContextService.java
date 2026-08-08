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
    public String collectContext(
            String filePath,
            int line
    ) {

        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException(
                    "File path cannot be empty"
            );
        }

        if (line < 0) {
            throw new IllegalArgumentException(
                    "Line cannot be negative"
            );
        }

        Path path = Path.of(filePath);

        if (!Files.exists(path)) {
            throw new IllegalArgumentException(
                    "File does not exist: " + filePath
            );
        }

        if (!Files.isRegularFile(path)) {
            throw new IllegalArgumentException(
                    "Path is not a file: " + filePath
            );
        }

        try {

            List<String> lines =
                    Files.readAllLines(path);

            int start =
                    Math.max(
                            0,
                            line - 40
                    );

            int end =
                    Math.min(
                            lines.size(),
                            line + 41
                    );

            StringBuilder context =
                    new StringBuilder();

            for (int i = start; i < end; i++) {

                context
                        .append(lines.get(i))
                        .append(System.lineSeparator());
            }

            return context.toString();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to read file: " + filePath,
                    e
            );
        }
    }
}