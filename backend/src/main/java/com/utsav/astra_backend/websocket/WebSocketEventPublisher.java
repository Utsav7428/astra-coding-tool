package com.utsav.astra_backend.websocket;

import org.springframework.stereotype.Service;

@Service
public class WebSocketEventPublisher {

    private final WebSocketConnectionManager connectionManager;

    public WebSocketEventPublisher(
            WebSocketConnectionManager connectionManager
    ) {
        this.connectionManager =
                connectionManager;
    }

    public void publish(
            WebSocketEventType type,
            Object payload
    ) {

        WebSocketEvent event =
                WebSocketEvent.of(
                        type,
                        payload
                );

        connectionManager.broadcast(event);
    }
}