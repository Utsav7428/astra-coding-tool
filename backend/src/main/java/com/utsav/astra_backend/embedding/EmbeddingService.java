package com.utsav.astra_backend.embedding;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmbeddingService {

    private final EmbeddingProvider embeddingProvider;

    public EmbeddingService(
            EmbeddingProvider embeddingProvider
    ) {

        this.embeddingProvider =
                embeddingProvider;
    }

    public List<Float> embed(String text) {

        if (text == null ||
                text.isBlank()) {

            throw new IllegalArgumentException(
                    "Text cannot be empty"
            );
        }

        return embeddingProvider.embed(text);
    }
}