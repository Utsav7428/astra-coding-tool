package com.utsav.astra_backend.assistant;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private final AssistantService assistantService;

    public AssistantController(
            AssistantService assistantService
    ) {

        this.assistantService =
                assistantService;
    }

    @PostMapping("/ask")
    public AssistantResponse ask(
            @RequestBody AssistantRequest request
    ) {

        return assistantService.ask(
                request.question()
        );
    }
}