package com.utsav.astra_backend.assistant;

import com.utsav.astra_backend.search.SearchResult;

import java.util.List;

public record AssistantResponse(
        String answer,
        List<SearchResult> sources
) {
}