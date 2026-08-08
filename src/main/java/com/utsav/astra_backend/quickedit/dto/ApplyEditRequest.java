package com.utsav.astra_backend.quickedit.dto;

public record ApplyEditRequest(
        String filePath,
        String originalCode,
        String modifiedCode
) {
}