package com.utsav.astra_backend.parser;

import org.springframework.stereotype.Service;
import org.treesitter.TSLanguage;
import org.treesitter.TSNode;
import org.treesitter.TSParser;
import org.treesitter.TSTree;
import org.treesitter.TreeSitterJava;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class TreeSitterService {

    private final TSLanguage javaLanguage;

    public TreeSitterService() {
        this.javaLanguage = new TreeSitterJava();
    }

    public ParsedFile parse(Path file) {

        try {

            String source = Files.readString(file);

            TSParser parser = new TSParser();

            parser.setLanguage(javaLanguage);

            TSTree tree = parser.parseString(
                    null,
                    source
            );

            TSNode root = tree.getRootNode();

            List<Symbol> symbols = new ArrayList<>();

            extractSymbols(
                    root,
                    source,
                    file.toAbsolutePath().toString(),
                    symbols
            );

            return new ParsedFile(
                    file.toAbsolutePath().toString(),
                    "java",
                    root.toString(),
                    symbols
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to parse file: " + file,
                    e
            );
        }
    }

    private void extractSymbols(
            TSNode node,
            String source,
            String filePath,
            List<Symbol> symbols
    ) {

        String nodeType = node.getType();

        switch (nodeType) {

            case "class_declaration":
                addSymbol(
                        node,
                        "class",
                        source,
                        filePath,
                        symbols
                );
                break;

            case "interface_declaration":
                addSymbol(
                        node,
                        "interface",
                        source,
                        filePath,
                        symbols
                );
                break;

            case "constructor_declaration":
                addSymbol(
                        node,
                        "constructor",
                        source,
                        filePath,
                        symbols
                );
                break;

            case "method_declaration":
                addSymbol(
                        node,
                        "method",
                        source,
                        filePath,
                        symbols
                );
                break;

            default:
                break;
        }

        int childCount = node.getNamedChildCount();

        for (int i = 0; i < childCount; i++) {

            TSNode child = node.getNamedChild(i);

            if (child != null && !child.isNull()) {

                extractSymbols(
                        child,
                        source,
                        filePath,
                        symbols
                );
            }
        }
    }

    private void addSymbol(
            TSNode node,
            String symbolType,
            String source,
            String filePath,
            List<Symbol> symbols
    ) {

        TSNode nameNode =
                node.getChildByFieldName("name");

        if (nameNode == null || nameNode.isNull()) {
            return;
        }

        String name =
                extractNodeText(
                        nameNode,
                        source
                );

        var startPoint =
                node.getStartPoint();

        var endPoint =
                node.getEndPoint();

        symbols.add(
                new Symbol(
                        name,
                        symbolType,
                        filePath,
                        startPoint.getRow(),
                        startPoint.getColumn(),
                        endPoint.getRow(),
                        endPoint.getColumn()
                )
        );
    }

    private String extractNodeText(
            TSNode node,
            String source
    ) {

        byte[] bytes =
                source.getBytes(StandardCharsets.UTF_8);

        int start =
                node.getStartByte();

        int end =
                node.getEndByte();

        if (start < 0 ||
                end > bytes.length ||
                start >= end) {

            return "";
        }

        return new String(
                bytes,
                start,
                end - start,
                StandardCharsets.UTF_8
        );
    }
}