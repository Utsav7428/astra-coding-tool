package com.utsav.astra_backend.parser;

public record Symbol(
        String name,
        String type,
        int startLine,
        int startColumn,
        int endLine,
        int endColumn
) {
}