package com.utsav.astra_backend.search;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SemanticSearchService searchService;

    public SearchController(
            SemanticSearchService searchService
    ) {
        this.searchService = searchService;
    }

    @GetMapping
    public List<SearchResult> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit
    ) {

        return searchService.search(
                query,
                limit
        );
    }
}