package com.utsav.astra_backend.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateFileRequest {

    @NotBlank
    private String parentPath;

    @NotBlank
    private String name;

    private boolean directory;
}