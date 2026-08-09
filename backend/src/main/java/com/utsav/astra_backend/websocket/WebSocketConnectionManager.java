package com.utsav.astra_backend.websocket;


import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class WebSocketConnectionManager {

    private final Map<String, WebSocketSession> sessions =
            new ConcurrentHashMap<>();

    private final Map<String, String> sessionIds =
            new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper;

    public WebSocketConnectionManager(
            ObjectMapper objectMapper
    ) {
        this.objectMapper = objectMapper;
    }

    public String register(WebSocketSession session) {

        String sessionId =
                UUID.randomUUID().toString();

        sessions.put(
                sessionId,
                session
        );

        sessionIds.put(
                session.getId(),
                sessionId
        );

        return sessionId;
    }

    public void remove(WebSocketSession session) {

        String sessionId =
                sessionIds.remove(
                        session.getId()
                );

        if (sessionId != null) {
            sessions.remove(sessionId);
        }
    }

    public WebSocketSession get(
            String sessionId
    ) {

        return sessions.get(sessionId);
    }

    public int size() {

        return sessions.size();
    }

    public Collection<WebSocketSession> getAll() {

        return sessions.values();
    }

    public void broadcast(
            WebSocketEvent event
    ) {

        try {

            String message =
                    objectMapper.writeValueAsString(event);

            for (WebSocketSession session : getAll()) {

                if (!session.isOpen()) {
                    continue;
                }

                try {

                    session.sendMessage(
                            new TextMessage(message)
                    );

                } catch (IOException e) {

                    log.error(
                            "Failed to send WebSocket event to session {}",
                            session.getId(),
                            e
                    );
                }
            }

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to serialize WebSocket event",
                    e
            );
        }
    }
}