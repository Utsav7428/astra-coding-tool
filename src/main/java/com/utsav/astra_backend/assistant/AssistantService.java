package com.utsav.astra_backend.assistant;

import com.utsav.astra_backend.llm.LlmService;
import com.utsav.astra_backend.search.SearchResult;
import com.utsav.astra_backend.search.SemanticSearchService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssistantService {

    private final SemanticSearchService searchService;
    private final LlmService llmService;

    public AssistantService(
            SemanticSearchService searchService,
            LlmService llmService
    ) {

        this.searchService =
                searchService;

        this.llmService =
                llmService;
    }

    public AssistantResponse ask(
            String question
    ) {

        if (question == null ||
                question.isBlank()) {

            throw new IllegalArgumentException(
                    "Question cannot be empty"
            );
        }

        List<SearchResult> results =
                searchService.search(
                        question,
                        5
                );

        String prompt =
                buildPrompt(
                        question,
                        results
                );

        String answer =
                llmService.generate(prompt);

        return new AssistantResponse(
                answer,
                results
        );
    }

    private String buildPrompt(
            String question,
            List<SearchResult> results
    ) {

        StringBuilder context =
                new StringBuilder();

        for (SearchResult result : results) {

            context.append(
                    "\n--- SOURCE ---\n"
            );

            context.append(
                    "File: "
            );

            context.append(
                    result.symbol()
                            .filePath()
            );

            context.append("\n");

            context.append(
                    "Symbol: "
            );

            context.append(
                    result.symbol()
                            .name()
            );

            context.append("\n");

            context.append(
                    "Type: "
            );

            context.append(
                    result.symbol()
                            .type()
            );

            context.append("\n");

            context.append(
                    "Lines: "
            );

            context.append(
                    result.context()
                            .startLine()
            );

            context.append(
                    "-"
            );

            context.append(
                    result.context()
                            .endLine()
            );

            context.append("\n\n");

            context.append(
                    result.context()
                            .content()
            );

            context.append(
                    "\n--- END SOURCE ---\n"
            );
        }

        return """
                You are ASTRA, a local AI coding assistant.

                Answer the user's question using only the
                provided source-code context.

                If the context does not contain enough
                information to answer the question, say so.

                Do not invent code or behavior that is not
                present in the context.

                Be concise and technical.

                User question:
                %s

                Source-code context:
                %s
                """.formatted(
                question,
                context
        );
    }
}