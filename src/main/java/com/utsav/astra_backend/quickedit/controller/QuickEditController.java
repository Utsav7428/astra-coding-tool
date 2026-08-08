package com.utsav.astra_backend.quickedit.controller;

import com.utsav.astra_backend.quickedit.dto.ApplyEditRequest;
import com.utsav.astra_backend.quickedit.dto.QuickEditRequest;
import com.utsav.astra_backend.quickedit.dto.QuickEditResponse;
import com.utsav.astra_backend.quickedit.service.FileEditService;
import com.utsav.astra_backend.quickedit.service.QuickEditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/quick-edit")
public class QuickEditController {

    private final QuickEditService quickEditService;
    private final FileEditService fileEditService;

    public QuickEditController(
            QuickEditService quickEditService,
            FileEditService fileEditService
    ) {

        this.quickEditService =
                quickEditService;

        this.fileEditService =
                fileEditService;
    }

    @PostMapping
    public ResponseEntity<QuickEditResponse> generateEdit(
            @RequestBody QuickEditRequest request
    ) throws IOException {

        return ResponseEntity.ok(
                quickEditService.generateEdit(
                        request
                )
        );
    }

    @PostMapping("/apply")
    public ResponseEntity<Void> applyEdit(
            @RequestBody ApplyEditRequest request
    ) {

        fileEditService.apply(
                request.filePath(),
                request.originalCode(),
                request.modifiedCode()
        );

        return ResponseEntity.ok().build();
    }
}