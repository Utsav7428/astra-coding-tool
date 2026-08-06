package com.utsav.astra_backend.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SaveFileRequest {

    @NotBlank
    private String path;

    @NotBlank
    private String content;
}