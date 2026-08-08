package com.utsav.astra_backend.terminal;

import com.utsav.astra_backend.terminal.dto.CreateTerminalRequest;
import com.utsav.astra_backend.terminal.dto.CreateTerminalResponse;
import com.utsav.astra_backend.terminal.dto.ExecuteCommandRequest;
import com.utsav.astra_backend.terminal.dto.TerminalResponse;
import jakarta.annotation.PreDestroy;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/terminal/sessions")
public class TerminalController {

    private final TerminalSessionManager sessionManager;

    public TerminalController(
            TerminalSessionManager sessionManager
    ) {

        this.sessionManager =
                sessionManager;
    }

    @PostMapping
    public CreateTerminalResponse create(
            @RequestBody
            CreateTerminalRequest request
    ) {

        if (request == null ||
                request.workingDirectory() == null ||
                request.workingDirectory().isBlank()) {

            throw new IllegalArgumentException(
                    "Working directory is required"
            );
        }

        Path workingDirectory =
                Path.of(
                                request.workingDirectory()
                        )
                        .toAbsolutePath()
                        .normalize();

        if (!Files.exists(workingDirectory)) {

            throw new IllegalArgumentException(
                    "Working directory does not exist: "
                            + workingDirectory
            );
        }

        if (!Files.isDirectory(workingDirectory)) {

            throw new IllegalArgumentException(
                    "Working path is not a directory: "
                            + workingDirectory
            );
        }

        TerminalSession session =
                sessionManager.create(
                        workingDirectory
                );

        return new CreateTerminalResponse(
                session.id(),
                session.workingDirectory()
                        .toString()
        );
    }

    @PostMapping("/{sessionId}/execute")
    public ResponseEntity<Void> execute(
            @PathVariable
            String sessionId,

            @RequestBody
            ExecuteCommandRequest request
    ) {

        if (request == null ||
                request.command() == null ||
                request.command().isBlank()) {

            throw new IllegalArgumentException(
                    "Command cannot be empty"
            );
        }

        TerminalSession session =
                sessionManager.get(
                        sessionId
                );

        session.execute(
                request.command()
        );

        return ResponseEntity.accepted()
                .build();
    }

    @GetMapping("/{sessionId}")
    public TerminalResponse get(
            @PathVariable
            String sessionId
    ) {

        TerminalSession session =
                sessionManager.get(
                        sessionId
                );

        return new TerminalResponse(
                session.id(),
                session.state().name(),
                session.workingDirectory()
                        .toString()
        );
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> stop(
            @PathVariable
            String sessionId
    ) {

        sessionManager.remove(
                sessionId
        );

        return ResponseEntity.noContent()
                .build();
    }

    @PreDestroy
    public void shutdown() {

        sessionManager.shutdown();
    }
}