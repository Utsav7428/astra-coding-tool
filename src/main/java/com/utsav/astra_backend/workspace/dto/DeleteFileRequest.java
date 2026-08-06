package com.utsav.astra_backend.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeleteFileRequest {

    @NotBlank
    private String path;
}