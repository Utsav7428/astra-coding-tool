package com.utsav.astra_backend.workspace.controller;

import com.utsav.astra_backend.workspace.dto.FileNodeResponse;
import com.utsav.astra_backend.workspace.dto.OpenWorkspaceRequest;
import com.utsav.astra_backend.workspace.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping("/open")
    public ResponseEntity<FileNodeResponse> openWorkspace(
            @Valid @RequestBody OpenWorkspaceRequest request
    ) {
        FileNodeResponse response = workspaceService.openWorkspace(request.getPath());
        return ResponseEntity.ok(response);
    }
}