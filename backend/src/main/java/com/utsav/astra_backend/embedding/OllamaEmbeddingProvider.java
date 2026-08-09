package com.utsav.astra_backend.embedding;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class OllamaEmbeddingProvider implements EmbeddingProvider {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    private final String baseUrl;
    private final String model;

    public OllamaEmbeddingProvider(
            ObjectMapper objectMapper,
            @Value("${astra.embedding.ollama.base-url}") String baseUrl,
            @Value("${astra.embedding.ollama.model}") String model
    ) {

        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;

        this.baseUrl = baseUrl;
        this.model = model;
    }

    @Override
    public List<Float> embed(String text) {

        try {

            Map<String, Object> requestBody =
                    Map.of(
                            "model", model,
                            "input", text
                    );

            String json =
                    objectMapper.writeValueAsString(
                            requestBody
                    );

            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(
                                    URI.create(
                                            baseUrl +
                                                    "/api/embed"
                                    )
                            )
                            .header(
                                    "Content-Type",
                                    "application/json"
                            )
                            .POST(
                                    HttpRequest.BodyPublishers
                                            .ofString(json)
                            )
                            .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers
                                    .ofString()
                    );

            if (response.statusCode() < 200 ||
                    response.statusCode() >= 300) {

                throw new RuntimeException(
                        "Ollama embedding request failed. " +
                                "Status: " +
                                response.statusCode() +
                                ", Body: " +
                                response.body()
                );
            }

            JsonNode root =
                    objectMapper.readTree(
                            response.body()
                    );

            JsonNode embeddings =
                    root.get("embeddings");

            if (embeddings == null ||
                    !embeddings.isArray() ||
                    embeddings.isEmpty()) {

                throw new RuntimeException(
                        "Ollama response did not contain embeddings"
                );
            }

            JsonNode vector =
                    embeddings.get(0);

            List<Float> result =
                    new ArrayList<>();

            for (JsonNode value : vector) {

                result.add(
                        (float) value.asDouble()
                );
            }

            return result;

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new RuntimeException(
                    "Ollama embedding request interrupted",
                    e
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate embedding using Ollama",
                    e
            );
        }
    }
}