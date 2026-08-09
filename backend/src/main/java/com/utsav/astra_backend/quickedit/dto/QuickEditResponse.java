package com.utsav.astra_backend.quickedit.dto;

public record QuickEditResponse(
        String filePath,
        int startLine,
        int startColumn,
        int endLine,
        int endColumn,
        String originalCode,
        String modifiedCode,
        String diff
) {
}