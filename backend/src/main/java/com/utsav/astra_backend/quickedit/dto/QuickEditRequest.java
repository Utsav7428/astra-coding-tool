package com.utsav.astra_backend.quickedit.dto;

public record QuickEditRequest(
        String filePath,
        int startLine,
        int startColumn,
        int endLine,
        int endColumn,
        String instruction
) {
}