package com.utsav.astra_backend.llm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class OllamaLlmService implements LlmService {

    private final RestClient restClient;
    private final String model;

    public OllamaLlmService(
            @Value("${astra.llm.base-url}") String baseUrl,
            @Value("${astra.llm.model}") String model
    ) {

        this.restClient =
                RestClient.builder()
                        .baseUrl(baseUrl)
                        .build();

        this.model = model;
    }

    @Override
    public String generate(String prompt) {

        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException(
                    "Prompt cannot be empty"
            );
        }

        Map<String, Object> request =
                Map.of(
                        "model", model,
                        "prompt", prompt,
                        "stream", false
                );

        Map<?, ?> response =
                restClient.post()
                        .uri("/api/generate")
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .body(request)
                        .retrieve()
                        .body(Map.class);

        if (response == null) {
            throw new IllegalStateException(
                    "Empty response from Ollama"
            );
        }

        Object result =
                response.get("response");

        if (result == null) {
            throw new IllegalStateException(
                    "Ollama response does not contain response field"
            );
        }

        return result.toString();
    }
}