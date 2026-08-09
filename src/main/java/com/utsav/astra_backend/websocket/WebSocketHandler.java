package com.utsav.astra_backend.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private final WebSocketConnectionManager connectionManager;

    public WebSocketHandler(
            WebSocketConnectionManager connectionManager
    ) {
        this.connectionManager =
                connectionManager;
    }

    @Override
    public void afterConnectionEstablished(
            WebSocketSession session
    ) throws Exception {

        String sessionId =
                connectionManager.register(session);

        String message =
                """
                {
                  "type": "connected",
                  "sessionId": "%s"
                }
                """.formatted(sessionId);

        session.sendMessage(
                new TextMessage(message)
        );

        System.out.println(
                "WebSocket connected : " +
                        sessionId
        );
    }

    @Override
    public void afterConnectionClosed(
            WebSocketSession session,
            CloseStatus status
    ) {

        connectionManager.remove(session);

        System.out.println(
                "WebSocket disconnected : " +
                        session.getId()
        );
    }

    @Override
    protected void handleTextMessage(
            WebSocketSession session,
            TextMessage message
    ) {

        System.out.println(
                "WebSocket message : " +
                        message.getPayload()
        );
    }
}