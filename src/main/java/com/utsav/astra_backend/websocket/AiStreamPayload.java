package com.utsav.astra_backend.websocket;

public record AiStreamPayload(
        String requestId,
        String token
) {
}