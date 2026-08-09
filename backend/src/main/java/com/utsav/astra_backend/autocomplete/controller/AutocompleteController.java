package com.utsav.astra_backend.autocomplete.controller;

import com.utsav.astra_backend.autocomplete.dto.CompletionRequest;
import com.utsav.astra_backend.autocomplete.dto.CompletionResponse;
import com.utsav.astra_backend.autocomplete.service.AutocompleteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/autocomplete")
public class AutocompleteController {

    private final AutocompleteService autocompleteService;

    public AutocompleteController(
            AutocompleteService autocompleteService
    ) {

        this.autocompleteService =
                autocompleteService;
    }

    @PostMapping
    public ResponseEntity<CompletionResponse> complete(
            @RequestBody CompletionRequest request
    ) {

        CompletionResponse response =
                autocompleteService.complete(
                        request
                );

        return ResponseEntity.ok(
                response
        );
    }
}