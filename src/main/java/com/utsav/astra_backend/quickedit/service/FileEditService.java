package com.utsav.astra_backend.quickedit.service;

import com.utsav.astra_backend.workspace.index.WorkspaceIndexService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class FileEditService {

    private final WorkspaceIndexService workspaceIndexService;

    public FileEditService(
            WorkspaceIndexService workspaceIndexService
    ) {
        this.workspaceIndexService =
                workspaceIndexService;
    }

    public void apply(
            String filePath,
            String originalCode,
            String modifiedCode
    ) {

        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException(
                    "File path cannot be empty"
            );
        }

        if (originalCode == null) {
            throw new IllegalArgumentException(
                    "Original code cannot be null"
            );
        }

        if (modifiedCode == null) {
            throw new IllegalArgumentException(
                    "Modified code cannot be null"
            );
        }

        Path path = Path.of(filePath);

        if (!Files.exists(path)) {
            throw new IllegalArgumentException(
                    "File does not exist: " + filePath
            );
        }

        try {

            String currentContent =
                    Files.readString(path);

            if (!currentContent.contains(originalCode)) {
                throw new IllegalStateException(
                        "Original code no longer matches file"
                );
            }

            String updatedContent =
                    currentContent.replaceFirst(
                            java.util.regex.Pattern.quote(
                                    originalCode
                            ),
                            java.util.regex.Matcher.quoteReplacement(
                                    modifiedCode
                            )
                    );

            Files.writeString(
                    path,
                    updatedContent
            );

            workspaceIndexService.updateFile(path);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to apply edit: " + filePath,
                    e
            );
        }
    }
}