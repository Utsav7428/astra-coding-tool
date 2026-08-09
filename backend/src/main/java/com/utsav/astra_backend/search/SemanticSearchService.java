package com.utsav.astra_backend.search;

import com.utsav.astra_backend.context.CodeContextService;
import com.utsav.astra_backend.embedding.EmbeddingRecord;
import com.utsav.astra_backend.embedding.EmbeddingService;
import com.utsav.astra_backend.embedding.VectorStore;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class SemanticSearchService {

    private final EmbeddingService embeddingService;
    private final VectorStore vectorStore;
    private final CodeContextService codeContextService;

    public SemanticSearchService(
            EmbeddingService embeddingService,
            VectorStore vectorStore,
            CodeContextService codeContextService
    ) {
        this.embeddingService = embeddingService;
        this.vectorStore = vectorStore;
        this.codeContextService = codeContextService;
    }

    public List<SearchResult> search(
            String query,
            int limit
    ) {

        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException(
                    "Search query cannot be empty"
            );
        }

        if (limit <= 0) {
            throw new IllegalArgumentException(
                    "Limit must be greater than zero"
            );
        }

        List<Float> queryEmbedding =
                embeddingService.embed(query);

        return vectorStore.getAll()
                .stream()
                .map(record ->
                        createResult(
                                record,
                                queryEmbedding
                        )
                )
                .sorted(
                        Comparator.comparingDouble(
                                SearchResult::score
                        ).reversed()
                )
                .limit(limit)
                .toList();
    }

    private SearchResult createResult(
            EmbeddingRecord record,
            List<Float> queryEmbedding
    ) {

        double score =
                cosineSimilarity(
                        queryEmbedding,
                        record.embedding()
                );

        return new SearchResult(
                record.symbol(),
                score,
                codeContextService.getContext(
                        record.symbol()
                )
        );
    }

    private double cosineSimilarity(
            List<Float> a,
            List<Float> b
    ) {

        if (a == null || b == null) {
            return 0.0;
        }

        if (a.size() != b.size()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double magnitudeA = 0.0;
        double magnitudeB = 0.0;

        for (int i = 0; i < a.size(); i++) {

            double x = a.get(i);
            double y = b.get(i);

            dotProduct += x * y;
            magnitudeA += x * x;
            magnitudeB += y * y;
        }

        if (magnitudeA == 0.0 ||
                magnitudeB == 0.0) {
            return 0.0;
        }

        return dotProduct /
                (Math.sqrt(magnitudeA) *
                        Math.sqrt(magnitudeB));
    }
}