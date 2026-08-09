package com.utsav.astra_backend.search;

import com.utsav.astra_backend.context.CodeContext;
import com.utsav.astra_backend.parser.Symbol;

public record SearchResult(
        Symbol symbol,
        double score,
        CodeContext context
) {
}