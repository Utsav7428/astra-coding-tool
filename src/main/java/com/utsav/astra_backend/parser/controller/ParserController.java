package com.utsav.astra_backend.parser.controller;

import com.utsav.astra_backend.parser.ParsedFile;
import com.utsav.astra_backend.parser.TreeSitterService;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/parser")
public class ParserController {

    private final TreeSitterService treeSitterService;

    public ParserController(TreeSitterService treeSitterService) {
        this.treeSitterService = treeSitterService;
    }

    @PostMapping("/parse")
    public ParsedFile parse(@RequestParam String path) {

        return treeSitterService.parse(
                Path.of(path)
        );
    }
}