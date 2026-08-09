package com.utsav.astra_backend.websocket;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.UUID;

@Service
public class AiStreamService {

    private final RestClient restClient;
    private final WebSocketEventPublisher eventPublisher;

    private final String model;

    public AiStreamService(
            WebSocketEventPublisher eventPublisher,
            @Value("${astra.llm.base-url}") String baseUrl,
            @Value("${astra.llm.model}") String model
    ) {

        this.eventPublisher =
                eventPublisher;

        this.restClient =
                RestClient.builder()
                        .baseUrl(baseUrl)
                        .build();

        this.model = model;
    }

    public String stream(
            String prompt
    ) {

        if (prompt == null ||
                prompt.isBlank()) {

            throw new IllegalArgumentException(
                    "Prompt cannot be empty"
            );
        }

        String requestId =
                UUID.randomUUID().toString();

        eventPublisher.publish(
                WebSocketEventType.AI_STREAM_START,
                Map.of(
                        "requestId",
                        requestId
                )
        );

        try {

            Map<String, Object> body =
                    Map.of(
                            "model",
                            model,
                            "prompt",
                            prompt,
                            "stream",
                            false,
                            "options",
                            Map.of(
                                    "temperature",
                                    0.2
                            )
                    );

            OllamaResponse response =
                    restClient
                            .post()
                            .uri("/api/generate")
                            .body(body)
                            .retrieve()
                            .body(OllamaResponse.class);

            String answer =
                    response == null ||
                            response.response() == null
                            ? ""
                            : response.response();

            eventPublisher.publish(
                    WebSocketEventType.AI_STREAM_TOKEN,
                    new AiStreamPayload(
                            requestId,
                            answer
                    )
            );

            eventPublisher.publish(
                    WebSocketEventType.AI_STREAM_COMPLETE,
                    Map.of(
                            "requestId",
                            requestId
                    )
            );

            return requestId;

        } catch (Exception e) {

            eventPublisher.publish(
                    WebSocketEventType.AI_STREAM_ERROR,
                    Map.of(
                            "requestId",
                            requestId,
                            "error",
                            e.getMessage() == null
                                    ? "AI request failed"
                                    : e.getMessage()
                    )
            );

            throw new RuntimeException(
                    "AI streaming failed",
                    e
            );
        }
    }

    private record OllamaResponse(
            String response
    ) {
    }
}