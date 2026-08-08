package com.utsav.astra_backend.context;

public record CodeContext(
        String filePath,
        int startLine,
        int endLine,
        String content
) {
}