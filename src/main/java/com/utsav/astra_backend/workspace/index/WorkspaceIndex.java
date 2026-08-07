package com.utsav.astra_backend.workspace.index;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class WorkspaceIndex {

    private final Map<String, FileMetadata> files =
            new ConcurrentHashMap<>();

    public Map<String, FileMetadata> getFiles() {
        return files;
    }

}