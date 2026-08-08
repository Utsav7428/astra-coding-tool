package com.utsav.astra_backend.autocomplete.service;


import com.utsav.astra_backend.autocomplete.dto.CompletionRequest;
import com.utsav.astra_backend.autocomplete.dto.CompletionResponse;
import com.utsav.astra_backend.context.CodeContextService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class AutocompleteService {

    private final CodeContextService codeContextService;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    private final String model;

    public AutocompleteService(
            CodeContextService codeContextService,
            ObjectMapper objectMapper,
            @Value("${astra.llm.base-url}") String llmBaseUrl,
            @Value("${astra.llm.model}") String model
    ) {
        this.codeContextService = codeContextService;
        this.objectMapper = objectMapper;

        this.restClient = RestClient.builder()
                .baseUrl(llmBaseUrl)
                .build();

        this.model = model;
    }

    public CompletionResponse complete(
            CompletionRequest request
    ) {

        validate(request);

        String fileContext =
                codeContextService.collectContext(
                        request.filePath(),
                        request.line()
                );

        String prompt =
                buildPrompt(
                        request,
                        fileContext
                );

        String response =
                callOllama(prompt);

        return new CompletionResponse(
                cleanCompletion(response)
        );
    }

    private String buildPrompt(
            CompletionRequest request,
            String fileContext
    ) {

        return """
                You are a code autocomplete engine.

                Complete the code at the cursor.

                Rules:
                - Return only the code that should be inserted.
                - Do not explain the answer.
                - Do not use markdown.
                - Do not repeat existing code.
                - Keep the completion concise.
                - Preserve the existing programming language and style.
                - If no useful completion can be inferred, return an empty response.

                File:
                %s

                Code around cursor:
                %s

                Code immediately before cursor:
                %s

                Code immediately after cursor:
                %s

                Cursor:
                line=%d
                column=%d

                Completion:
                """.formatted(
                request.filePath(),
                fileContext,
                request.prefix(),
                request.suffix(),
                request.line(),
                request.column()
        );
    }

    private String callOllama(
            String prompt
    ) {

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
                                0.1,
                                "num_predict",
                                80
                        )
                );

        String response =
                restClient
                        .post()
                        .uri("/api/generate")
                        .body(body)
                        .retrieve()
                        .body(String.class);

        if (response == null ||
                response.isBlank()) {

            return "";
        }

        try {

            JsonNode json =
                    objectMapper.readTree(
                            response
                    );

            JsonNode generated =
                    json.get("response");

            if (generated == null) {
                return "";
            }

            return generated
                    .asText();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid Ollama response",
                    e
            );
        }
    }

    private String cleanCompletion(
            String completion
    ) {

        if (completion == null) {
            return "";
        }

        String result =
                completion.trim();

        if (result.startsWith("```") &&
                result.endsWith("```")) {

            int firstNewLine =
                    result.indexOf('\n');

            if (firstNewLine > 0) {

                result =
                        result.substring(
                                firstNewLine + 1,
                                result.length() - 3
                        ).trim();
            }
        }

        return result;
    }

    private void validate(
            CompletionRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Completion request cannot be null"
            );
        }

        if (request.filePath() == null ||
                request.filePath().isBlank()) {

            throw new IllegalArgumentException(
                    "File path cannot be empty"
            );
        }

        if (request.line() < 0) {

            throw new IllegalArgumentException(
                    "Line cannot be negative"
            );
        }

        if (request.column() < 0) {

            throw new IllegalArgumentException(
                    "Column cannot be negative"
            );
        }
    }
}