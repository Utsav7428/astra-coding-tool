package com.utsav.astra_backend.workspace.dto;

import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class FileNodeResponse {

    private String name;

    private String path;

    private boolean directory;

    @Builder.Default
    private List<FileNodeResponse> children = new ArrayList<>();
}