package com.utsav.astra_backend.websocket;

public record IndexUpdatedPayload(
        String filePath,
        int symbols
){}
