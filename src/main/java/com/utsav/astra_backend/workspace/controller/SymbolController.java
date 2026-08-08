package com.utsav.astra_backend.workspace.controller;

import com.utsav.astra_backend.parser.Symbol;
import com.utsav.astra_backend.workspace.index.WorkspaceIndexService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class SymbolController {

    private final WorkspaceIndexService workspaceIndexService;

    public SymbolController(
            WorkspaceIndexService workspaceIndexService
    ) {

        this.workspaceIndexService =
                workspaceIndexService;
    }

    @GetMapping("/symbols")
    public List<Symbol> getAllSymbols() {

        return workspaceIndexService
                .getAllSymbols();
    }

    @GetMapping("/symbols/search")
    public List<Symbol> searchSymbols(
            @RequestParam String q
    ) {

        return workspaceIndexService
                .searchSymbols(q);
    }
}