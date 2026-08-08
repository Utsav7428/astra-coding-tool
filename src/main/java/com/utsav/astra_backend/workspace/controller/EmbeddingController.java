package com.utsav.astra_backend.workspace.controller;

import com.utsav.astra_backend.embedding.EmbeddingIndexService;
import com.utsav.astra_backend.embedding.EmbeddingRecord;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/embeddings")
public class EmbeddingController {

    private final EmbeddingIndexService embeddingIndexService;

    public EmbeddingController(
            EmbeddingIndexService embeddingIndexService
    ) {

        this.embeddingIndexService =
                embeddingIndexService;
    }

    @GetMapping("/count")
    public Map<String, Integer> count() {

        return Map.of(
                "vectors",
                embeddingIndexService.size()
        );
    }

    @GetMapping("/chunks")
    public List<EmbeddingRecord> chunks() {

        return embeddingIndexService.getAll();
    }
}