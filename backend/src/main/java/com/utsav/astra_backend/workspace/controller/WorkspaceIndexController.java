package com.utsav.astra_backend.workspace.controller;

import com.utsav.astra_backend.workspace.index.FileMetadata;
import com.utsav.astra_backend.workspace.index.WorkspaceIndexService;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;

@RestController
@RequestMapping("/api/index")
public class WorkspaceIndexController {

    private final WorkspaceIndexService indexService;

    public WorkspaceIndexController(WorkspaceIndexService indexService) {
        this.indexService = indexService;
    }

    @GetMapping
    public Collection<FileMetadata> getIndex() {
        return indexService.getAllFiles();
    }

    @GetMapping("/count")
    public int count() {
        return indexService.size();
    }

}