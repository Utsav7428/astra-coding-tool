package com.utsav.astra_backend.terminal;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TerminalSessionManager {

    private final Map<String, TerminalSession> sessions =
            new ConcurrentHashMap<>();

    public TerminalSession create(
            Path workingDirectory
    ) {

        try {

            TerminalSession session =
                    new TerminalSession(
                            workingDirectory
                    );

            sessions.put(
                    session.id(),
                    session
            );

            return session;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to create terminal session",
                    e
            );
        }
    }

    public TerminalSession get(
            String sessionId
    ) {

        TerminalSession session =
                sessions.get(sessionId);

        if (session == null) {

            throw new IllegalArgumentException(
                    "Terminal session not found: "
                            + sessionId
            );
        }

        return session;
    }

    public void remove(
            String sessionId
    ) {

        TerminalSession session =
                sessions.remove(sessionId);

        if (session != null) {
            session.stop();
        }
    }

    public List<TerminalSession> getAll() {

        return new ArrayList<>(
                sessions.values()
        );
    }

    public void shutdown() {

        sessions.values()
                .forEach(
                        TerminalSession::stop
                );

        sessions.clear();
    }
}