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
                    symbols
            );

            System.out.println("--------------------------------");
            System.out.println("Parsed : " + file);
            System.out.println("Root   : " + root.getType());
            System.out.println("Symbols: " + symbols.size());
            System.out.println("--------------------------------");

            for (Symbol symbol : symbols) {

                System.out.println(
                        symbol.type() +
                                " : " +
                                symbol.name()
                );
            }

            return new ParsedFile(
                    file.toAbsolutePath().toString(),
                    "java",
                    root.toString()
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
            List<Symbol> symbols
    ) {

        String type = node.getType();

        switch (type) {

            case "class_declaration" ->
                    addSymbol(
                            node,
                            "class",
                            source,
                            symbols
                    );

            case "interface_declaration" ->
                    addSymbol(
                            node,
                            "interface",
                            source,
                            symbols
                    );

            case "method_declaration" ->
                    addSymbol(
                            node,
                            "method",
                            source,
                            symbols
                    );

            case "constructor_declaration" ->
                    addSymbol(
                            node,
                            "constructor",
                            source,
                            symbols
                    );

            default -> {
                // Nothing to extract
            }
        }

        int childCount = node.getNamedChildCount();

        for (int i = 0; i < childCount; i++) {

            TSNode child = node.getNamedChild(i);

            if (child != null && !child.isNull()) {

                extractSymbols(
                        child,
                        source,
                        symbols
                );
            }
        }
    }

    private void addSymbol(
            TSNode node,
            String symbolType,
            String source,
            List<Symbol> symbols
    ) {

        TSNode nameNode =
                node.getChildByFieldName("name");

        if (nameNode == null || nameNode.isNull()) {
            return;
        }

        String name = extractNodeText(
                nameNode,
                source
        );

        var start = node.getStartPoint();
        var end = node.getEndPoint();

        symbols.add(
                new Symbol(
                        name,
                        symbolType,
                        start.getRow(),
                        start.getColumn(),
                        end.getRow(),
                        end.getColumn()
                )
        );
    }

    private String extractNodeText(
            TSNode node,
            String source
    ) {

        byte[] bytes =
                source.getBytes(StandardCharsets.UTF_8);

        int start = node.getStartByte();
        int end = node.getEndByte();

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