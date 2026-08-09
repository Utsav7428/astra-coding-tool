package com.utsav.astra_backend.websocket;

public record WebSocketEvent(
        WebSocketEventType type,
        long timestamp,
        Object payload
) {

    public static WebSocketEvent of(
            WebSocketEventType type,
            Object payload
    ) {

        return new WebSocketEvent(
                type,
                System.currentTimeMillis(),
                payload
        );
    }
}