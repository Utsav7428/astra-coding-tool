package com.utsav.astra_backend.workspace.controller;

import com.utsav.astra_backend.workspace.dto.CreateFileRequest;
import com.utsav.astra_backend.workspace.dto.DeleteFileRequest;
import com.utsav.astra_backend.workspace.dto.ReadFileResponse;
import com.utsav.astra_backend.workspace.dto.RenameFileRequest;
import com.utsav.astra_backend.workspace.dto.SaveFileRequest;
import com.utsav.astra_backend.workspace.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final WorkspaceService workspaceService;

    @GetMapping
    public ResponseEntity<ReadFileResponse> readFile(
            @RequestParam String path
    ) {
        return ResponseEntity.ok(workspaceService.readFile(path));
    }

    @PutMapping
    public ResponseEntity<Void> saveFile(
            @Valid @RequestBody SaveFileRequest request
    ) {
        workspaceService.saveFile(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Void> createFile(
            @Valid @RequestBody CreateFileRequest request
    ) {
        workspaceService.createFile(request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/rename")
    public ResponseEntity<Void> renameFile(
            @Valid @RequestBody RenameFileRequest request
    ) {
        workspaceService.renameFile(request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteFile(
            @Valid @RequestBody DeleteFileRequest request
    ) {
        workspaceService.deleteFile(request);
        return ResponseEntity.noContent().build();
    }
}