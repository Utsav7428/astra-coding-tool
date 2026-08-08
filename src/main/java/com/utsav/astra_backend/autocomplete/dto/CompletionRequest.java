package com.utsav.astra_backend.autocomplete.dto;

public record CompletionRequest(
        String filePath,
        int line,
        int column,
        String prefix,
        String suffix
) {
}