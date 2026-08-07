package com.utsav.astra_backend.parser;

public record ParsedFile(
        String path,
        String language,
        String tree
) {
}