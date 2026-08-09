package com.utsav.astra_backend.workspace.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReadFileResponse {

    private String path;

    private String content;
}