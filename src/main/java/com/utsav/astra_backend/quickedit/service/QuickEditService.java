package com.utsav.astra_backend.quickedit.service;

import com.utsav.astra_backend.quickedit.dto.QuickEditRequest;
import com.utsav.astra_backend.quickedit.dto.QuickEditResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@Service
public class QuickEditService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String model;

    public QuickEditService(
            ObjectMapper objectMapper,
            @Value("${astra.llm.base-url}") String llmBaseUrl,
            @Value("${astra.llm.model}") String model
    ) {

        this.objectMapper = objectMapper;

        this.restClient =
                RestClient.builder()
                        .baseUrl(llmBaseUrl)
                        .build();

        this.model = model;
    }

    public QuickEditResponse generateEdit(
            QuickEditRequest request
    ) throws IOException {

        validate(request);

        Path path =
                Path.of(request.filePath());

        String originalFile;

        try {

            originalFile =
                    Files.readString(path);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to read file",
                    e
            );
        }

        List<String> lines =
                Files.readAllLines(path);

        if (request.startLine() >= lines.size() ||
                request.endLine() >= lines.size()) {

            throw new IllegalArgumentException(
                    "Selection is outside file bounds"
            );
        }

        String originalCode =
                extractSelection(
                        lines,
                        request
                );

        String context =
                buildContext(
                        lines,
                        request
                );

        String prompt =
                buildPrompt(
                        request,
                        context,
                        originalCode
                );

        String modifiedCode =
                callOllama(prompt);

        modifiedCode =
                cleanCompletion(modifiedCode);

        if (modifiedCode.isBlank()) {

            throw new IllegalStateException(
                    "Model returned an empty edit"
            );
        }

        String diff =
                createDiff(
                        originalCode,
                        modifiedCode
                );

        return new QuickEditResponse(
                request.filePath(),
                request.startLine(),
                request.startColumn(),
                request.endLine(),
                request.endColumn(),
                originalCode,
                modifiedCode,
                diff
        );
    }

    private String extractSelection(
            List<String> lines,
            QuickEditRequest request
    ) {

        StringBuilder result =
                new StringBuilder();

        for (
                int i = request.startLine();
                i <= request.endLine();
                i++
        ) {

            String line = lines.get(i);

            int startColumn =
                    i == request.startLine()
                            ? request.startColumn()
                            : 0;

            int endColumn =
                    i == request.endLine()
                            ? request.endColumn()
                            : line.length();

            startColumn =
                    Math.min(
                            startColumn,
                            line.length()
                    );

            endColumn =
                    Math.min(
                            endColumn,
                            line.length()
                    );

            if (startColumn > endColumn) {
                throw new IllegalArgumentException(
                        "Invalid selection"
                );
            }

            result.append(
                    line,
                    startColumn,
                    endColumn
            );

            if (i < request.endLine()) {
                result.append(
                        System.lineSeparator()
                );
            }
        }

        return result.toString();
    }

    private String buildContext(
            List<String> lines,
            QuickEditRequest request
    ) {

        int start =
                Math.max(
                        0,
                        request.startLine() - 20
                );

        int end =
                Math.min(
                        lines.size(),
                        request.endLine() + 21
                );

        StringBuilder context =
                new StringBuilder();

        for (int i = start; i < end; i++) {

            context
                    .append(lines.get(i))
                    .append(System.lineSeparator());
        }

        return context.toString();
    }

    private String buildPrompt(
            QuickEditRequest request,
            String context,
            String selectedCode
    ) {

        return """
                You are a code editing engine.

                Modify ONLY the selected code according to the instruction.

                Rules:
                - Return ONLY the replacement code.
                - Do not return markdown.
                - Do not explain anything.
                - Do not modify code outside the selection.
                - Preserve indentation.
                - Preserve the programming language.
                - Preserve existing behavior unless the instruction requires changing it.

                File:
                %s

                Surrounding code:
                %s

                Selected code:
                %s

                Instruction:
                %s

                Replacement code:
                """.formatted(
                request.filePath(),
                context,
                selectedCode,
                request.instruction()
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
                                300
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
                    objectMapper.readTree(response);

            JsonNode generated =
                    json.get("response");

            if (generated == null) {
                return "";
            }

            return generated.asText();

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

    private String createDiff(
            String original,
            String modified
    ) {

        String[] oldLines =
                original.split(
                        "\\R",
                        -1
                );

        String[] newLines =
                modified.split(
                        "\\R",
                        -1
                );

        StringBuilder diff =
                new StringBuilder();

        diff.append("--- original\n");
        diff.append("+++ modified\n");

        for (String line : oldLines) {
            diff.append("- ")
                    .append(line)
                    .append('\n');
        }

        for (String line : newLines) {
            diff.append("+ ")
                    .append(line)
                    .append('\n');
        }

        return diff.toString();
    }

    private void validate(
            QuickEditRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Request cannot be null"
            );
        }

        if (request.filePath() == null ||
                request.filePath().isBlank()) {

            throw new IllegalArgumentException(
                    "File path cannot be empty"
            );
        }

        if (request.startLine() < 0 ||
                request.endLine() < 0) {

            throw new IllegalArgumentException(
                    "Line cannot be negative"
            );
        }

        if (request.startColumn() < 0 ||
                request.endColumn() < 0) {

            throw new IllegalArgumentException(
                    "Column cannot be negative"
            );
        }

        if (request.startLine() > request.endLine()) {

            throw new IllegalArgumentException(
                    "Start line cannot be after end line"
            );
        }

        if (request.instruction() == null ||
                request.instruction().isBlank()) {

            throw new IllegalArgumentException(
                    "Edit instruction cannot be empty"
            );
        }
    }
}