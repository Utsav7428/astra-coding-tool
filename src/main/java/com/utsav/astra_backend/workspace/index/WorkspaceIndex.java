package com.utsav.astra_backend.workspace.index;

import com.utsav.astra_backend.parser.Symbol;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WorkspaceIndex {

    private final Map<String, FileMetadata> files =
            new HashMap<>();

    private final Map<String, List<Symbol>> symbolsByFile =
            new HashMap<>();

    public Map<String, FileMetadata> getFiles() {
        return files;
    }

    public void clear() {

        files.clear();
        symbolsByFile.clear();
    }

    public void indexSymbols(
            String filePath,
            List<Symbol> symbols
    ) {

        symbolsByFile.put(
                filePath,
                new ArrayList<>(symbols)
        );
    }

    public void removeSymbols(
            String filePath
    ) {

        symbolsByFile.remove(filePath);
    }

    public List<Symbol> getSymbolsForFile(
            String filePath
    ) {

        return symbolsByFile.getOrDefault(
                filePath,
                Collections.emptyList()
        );
    }

    public List<Symbol> getAllSymbols() {

        return symbolsByFile.values()
                .stream()
                .flatMap(Collection::stream)
                .toList();
    }
}