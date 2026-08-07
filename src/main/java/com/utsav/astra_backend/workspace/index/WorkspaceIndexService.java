package com.utsav.astra_backend.workspace.index;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.util.Collection;

@Service
public class WorkspaceIndexService {

    private final WorkspaceIndex workspaceIndex = new WorkspaceIndex();

    public void indexWorkspace(Path workspace) {

        workspaceIndex.getFiles().clear();

        try {

            Files.walk(workspace)
                    .filter(Files::isRegularFile)
                    .forEach(this::indexFile);

        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        System.out.println("--------------------------------");
        System.out.println("Workspace Indexed");
        System.out.println("Files : " + workspaceIndex.getFiles().size());
        System.out.println("--------------------------------");
    }

    public void indexFile(Path file) {

        try {

            FileMetadata metadata = new FileMetadata(
                    file,
                    LanguageDetector.detect(file),
                    Files.size(file),
                    Files.getLastModifiedTime(file).toMillis(),
                    HashUtil.sha256(file),
                    true
            );

            workspaceIndex.getFiles().put(
                    file.toAbsolutePath().toString(),
                    metadata
            );

        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    public void updateFile(Path file) {

        if (!Files.exists(file)) {
            return;
        }

        indexFile(file);

        System.out.println("Updated : " + file);
    }

    public void removeFile(Path file) {

        workspaceIndex.getFiles()
                .remove(file.toAbsolutePath().toString());

        System.out.println("Removed : " + file);
    }

    public FileMetadata getMetadata(Path file) {

        return workspaceIndex.getFiles()
                .get(file.toAbsolutePath().toString());
    }

    public Collection<FileMetadata> getAllFiles() {

        return workspaceIndex.getFiles().values();
    }

    public int size() {

        return workspaceIndex.getFiles().size();
    }

}