package com.utsav.astra_backend.embedding;

import com.utsav.astra_backend.parser.Symbol;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class EmbeddingIndexService {

    private final EmbeddingService embeddingService;
    private final VectorStore vectorStore;

    public EmbeddingIndexService(
            EmbeddingService embeddingService,
            VectorStore vectorStore
    ) {

        this.embeddingService =
                embeddingService;

        this.vectorStore =
                vectorStore;
    }

    public void indexSymbols(
            Path file,
            List<Symbol> symbols
    ) {

        if (symbols == null ||
                symbols.isEmpty()) {

            return;
        }

        try {

            String source =
                    Files.readString(file);

            String filePath =
                    file.toAbsolutePath()
                            .toString();

            vectorStore.removeByFile(
                    filePath
            );

            for (Symbol symbol : symbols) {

                String content =
                        buildEmbeddingContent(
                                symbol,
                                source
                        );

                List<Float> embedding =
                        embeddingService.embed(
                                content
                        );

                String id =
                        buildId(symbol);

                EmbeddingRecord record =
                        new EmbeddingRecord(
                                id,
                                symbol,
                                content,
                                embedding
                        );

                vectorStore.put(record);

                System.out.println(
                        "Embedded : " +
                                symbol.type() +
                                " " +
                                symbol.name()
                );
            }

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to read source file: " +
                            file,
                    e
            );
        }
    }

    public void removeFile(
            Path file
    ) {

        vectorStore.removeByFile(
                file.toAbsolutePath()
                        .toString()
        );
    }

    public int size() {

        return vectorStore.size();
    }

    public List<EmbeddingRecord> getAll() {

        return vectorStore.getAll();
    }

    private String buildEmbeddingContent(
            Symbol symbol,
            String source
    ) {

        String sourceCode =
                extractSymbolSource(
                        symbol,
                        source
                );

        return """
                File: %s
                Symbol: %s
                Type: %s

                Source:
                %s
                """.formatted(
                symbol.filePath(),
                symbol.name(),
                symbol.type(),
                sourceCode
        );
    }

    private String extractSymbolSource(
            Symbol symbol,
            String source
    ) {

        String[] lines =
                source.split("\\R", -1);

        int start =
                Math.max(
                        0,
                        symbol.startLine()
                );

        int end =
                Math.min(
                        lines.length - 1,
                        symbol.endLine()
                );

        StringBuilder result =
                new StringBuilder();

        for (int i = start; i <= end; i++) {

            result.append(
                    lines[i]
            );

            if (i < end) {
                result.append('\n');
            }
        }

        return result.toString();
    }

    private String buildId(
            Symbol symbol
    ) {

        return symbol.filePath() +
                ":" +
                symbol.type() +
                ":" +
                symbol.name() +
                ":" +
                symbol.startLine() +
                ":" +
                symbol.startColumn();
    }
    public void clear() {

        vectorStore.clear();
    }
}