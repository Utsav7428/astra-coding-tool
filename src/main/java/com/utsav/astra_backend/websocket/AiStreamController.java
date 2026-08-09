package com.utsav.astra_backend.websocket;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiStreamController {

    private final AiStreamService aiStreamService;

    public AiStreamController(
            AiStreamService aiStreamService
    ) {
        this.aiStreamService =
                aiStreamService;
    }

    @PostMapping("/stream")
    public Map<String, String> stream(
            @RequestBody Map<String, String> request
    ) {

        String prompt =
                request.get("prompt");

        String requestId =
                aiStreamService.stream(prompt);

        return Map.of(
                "requestId",
                requestId
        );
    }
}