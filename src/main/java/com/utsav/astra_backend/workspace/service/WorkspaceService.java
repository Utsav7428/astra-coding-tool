package com.utsav.astra_backend.workspace.service;

import com.utsav.astra_backend.workspace.dto.*;
import com.utsav.astra_backend.workspace.watcher.WorkspaceWatcherService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

@Service
public class WorkspaceService {

    private final WorkspaceWatcherService watcherService;

    public WorkspaceService(WorkspaceWatcherService watcherService) {
        this.watcherService = watcherService;
    }

    public FileNodeResponse openWorkspace(String path) {

        Path workspace = Paths.get(path);

        if (!Files.exists(workspace)) {
            throw new IllegalArgumentException("Workspace does not exist.");
        }

        if (!Files.isDirectory(workspace)) {
            throw new IllegalArgumentException("Workspace is not a directory.");
        }
        watcherService.startWatching(workspace);
        return buildTree(workspace, workspace);
    }
    private FileNodeResponse buildTree(Path root, Path current) {

        FileNodeResponse.FileNodeResponseBuilder node = FileNodeResponse.builder()
                .name(current.getFileName().toString())
                .path(current.equals(root)
                ? current.toString()
                : root.relativize(current).toString().replace("\\", "/"))
                .directory(Files.isDirectory(current));

        if (!Files.isDirectory(current)) {
            return node.build();
        }

        List<FileNodeResponse> children = new ArrayList<>();

        try (Stream<Path> stream = Files.list(current)) {

            stream.sorted()
                    .filter(this::shouldInclude)
                    .forEach(child -> children.add(buildTree(root, child)));

        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return node.children(children).build();
    }

    private boolean shouldInclude(Path path) {

        String name = path.getFileName().toString();

        return !Set.of(
                ".git",
                "node_modules",
                ".idea",
                ".gradle",
                "target",
                "build",
                "dist"
        ).contains(name);
    }


    public FileNodeResponse refreshWorkspace() {
        throw new UnsupportedOperationException("Not implemented yet.");
    }

    public ReadFileResponse readFile(String path) {

        Path filePath = Paths.get(path);

        if (!Files.exists(filePath)) {
            throw new IllegalArgumentException("File does not exist.");
        }

        if (Files.isDirectory(filePath)) {
            throw new IllegalArgumentException("Cannot read a directory.");
        }

        try {
            String content = Files.readString(filePath);

            return ReadFileResponse.builder()
                    .path(path)
                    .content(content)
                    .build();

        } catch (IOException e) {
            throw new RuntimeException("Failed to read file.", e);
        }
    }

    public void saveFile(SaveFileRequest request) {

        Path filePath = Paths.get(request.getPath());

        if (!Files.exists(filePath)) {
            throw new IllegalArgumentException("File does not exist.");
        }

        if (Files.isDirectory(filePath)) {
            throw new IllegalArgumentException("Cannot write to a directory.");
        }

        try {
            Files.writeString(filePath, request.getContent());
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file.", e);
        }
    }

    public void createFile(CreateFileRequest request) {

        Path target = Paths.get(request.getParentPath(), request.getName());

        if (Files.exists(target)) {
            throw new IllegalArgumentException("File already exists.");
        }

        try {

            if (request.isDirectory()) {
                Files.createDirectories(target);
            } else {

                Files.createDirectories(target.getParent());
                Files.createFile(target);
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to create file.", e);
        }
    }

    public void renameFile(RenameFileRequest request) {

        Path source = Paths.get(request.getPath());

        if (!Files.exists(source)) {
            throw new IllegalArgumentException("File does not exist.");
        }

        Path target = source.resolveSibling(request.getNewName());

        try {
            Files.move(source, target);
        } catch (IOException e) {
            throw new RuntimeException("Failed to rename file.", e);
        }
    }

    public void deleteFile(DeleteFileRequest request) {

        Path path = Paths.get(request.getPath());

        if (!Files.exists(path)) {
            throw new IllegalArgumentException("File does not exist.");
        }

        try {

            Files.walk(path)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try {
                            Files.delete(p);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    });

        } catch (IOException e) {
            throw new RuntimeException("Failed to delete.", e);
        }
    }


}