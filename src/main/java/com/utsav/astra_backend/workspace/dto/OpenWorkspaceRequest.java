package com.utsav.astra_backend.workspace.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OpenWorkspaceRequest {

    @NotBlank(message = "Workspace path cannot be blank")
    private String path;
}