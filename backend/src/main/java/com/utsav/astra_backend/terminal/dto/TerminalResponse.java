package com.utsav.astra_backend.terminal.dto;

public record TerminalResponse(
        String sessionId,
        String state,
        String workingDirectory
) {
}