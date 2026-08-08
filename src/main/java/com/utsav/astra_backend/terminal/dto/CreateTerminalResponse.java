package com.utsav.astra_backend.terminal.dto;

public record CreateTerminalResponse(
        String sessionId,
        String workingDirectory
) {
}