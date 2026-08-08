package com.utsav.astra_backend.workspace.index;

import com.utsav.astra_backend.parser.ParsedFile;
import com.utsav.astra_backend.parser.Symbol;
import com.utsav.astra_backend.parser.TreeSitterService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.List;

@Service
public class WorkspaceIndexService {

    private final WorkspaceIndex workspaceIndex =
            new WorkspaceIndex();

    private final TreeSitterService treeSitterService;

    public WorkspaceIndexService(
            TreeSitterService treeSitterService
    ) {

        this.treeSitterService =
                treeSitterService;
    }

    public void indexWorkspace(Path workspace) {

        workspaceIndex.clear();

        try {

            Files.walk(workspace)
                    .filter(Files::isRegularFile)
                    .forEach(this::indexFile);

        } catch (IOException e) {

            throw new RuntimeException(e);
        }

        System.out.println("--------------------------------");
        System.out.println("Workspace Indexed");
        System.out.println(
                "Files : " +
                        workspaceIndex.getFiles().size()
        );
        System.out.println(
                "Symbols : " +
                        workspaceIndex.getAllSymbols().size()
        );
        System.out.println("--------------------------------");
    }

    public void indexFile(Path file) {

        try {

            String filePath =
                    file.toAbsolutePath().toString();

            FileMetadata metadata =
                    new FileMetadata(
                            file,
                            LanguageDetector.detect(file),
                            Files.size(file),
                            Files.getLastModifiedTime(file)
                                    .toMillis(),
                            HashUtil.sha256(file),
                            true
                    );

            workspaceIndex
                    .getFiles()
                    .put(
                            filePath,
                            metadata
                    );

            if (isJavaFile(file)) {

                ParsedFile parsedFile =
                        treeSitterService.parse(file);

                workspaceIndex.indexSymbols(
                        filePath,
                        parsedFile.symbols()
                );

            } else {

                workspaceIndex.removeSymbols(
                        filePath
                );
            }

        } catch (Exception e) {

            e.printStackTrace();
        }
    }

    public void updateFile(Path file) {

        if (!Files.exists(file)) {
            return;
        }

        indexFile(file);

        System.out.println(
                "Updated : " + file
        );
    }

    public void removeFile(Path file) {

        String filePath =
                file.toAbsolutePath().toString();

        workspaceIndex
                .getFiles()
                .remove(filePath);

        workspaceIndex
                .removeSymbols(filePath);

        System.out.println(
                "Removed : " + file
        );
    }

    public FileMetadata getMetadata(Path file) {

        return workspaceIndex
                .getFiles()
                .get(
                        file.toAbsolutePath()
                                .toString()
                );
    }

    public Collection<FileMetadata> getAllFiles() {

        return workspaceIndex
                .getFiles()
                .values();
    }

    public List<Symbol> getSymbols(
            Path file
    ) {

        return workspaceIndex
                .getSymbolsForFile(
                        file.toAbsolutePath()
                                .toString()
                );
    }

    public List<Symbol> getAllSymbols() {

        return workspaceIndex
                .getAllSymbols();
    }

    public List<Symbol> searchSymbols(
            String query
    ) {

        String normalizedQuery =
                query.toLowerCase();

        return getAllSymbols()
                .stream()
                .filter(symbol ->
                        symbol.name()
                                .toLowerCase()
                                .contains(
                                        normalizedQuery
                                )
                )
                .toList();
    }

    public int size() {

        return workspaceIndex
                .getFiles()
                .size();
    }

    private boolean isJavaFile(Path file) {

        return file.toString()
                .toLowerCase()
                .endsWith(".java");
    }
}