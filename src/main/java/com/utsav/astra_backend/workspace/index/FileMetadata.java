package com.utsav.astra_backend.workspace.index;

import java.nio.file.Path;

public class FileMetadata {

    private Path path;

    private String language;

    private long size;

    private long lastModified;

    private String hash;

    private boolean indexed;

    public FileMetadata() {
    }

    public FileMetadata(
            Path path,
            String language,
            long size,
            long lastModified,
            String hash,
            boolean indexed
    ) {
        this.path = path;
        this.language = language;
        this.size = size;
        this.lastModified = lastModified;
        this.hash = hash;
        this.indexed = indexed;
    }

    public Path getPath() {
        return path;
    }

    public void setPath(Path path) {
        this.path = path;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public long getLastModified() {
        return lastModified;
    }

    public void setLastModified(long lastModified) {
        this.lastModified = lastModified;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public boolean isIndexed() {
        return indexed;
    }

    public void setIndexed(boolean indexed) {
        this.indexed = indexed;
    }
}