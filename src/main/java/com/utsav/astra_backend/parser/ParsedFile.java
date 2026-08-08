package com.utsav.astra_backend.parser;

import java.util.List;

public record ParsedFile(
        String path,
        String language,
        String ast,
        List<Symbol> symbols
) {
}