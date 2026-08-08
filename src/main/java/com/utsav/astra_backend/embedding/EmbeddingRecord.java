package com.utsav.astra_backend.embedding;

import com.utsav.astra_backend.parser.Symbol;

import java.util.List;

public record EmbeddingRecord(
        String id,
        Symbol symbol,
        String content,
        List<Float> embedding
) {
}