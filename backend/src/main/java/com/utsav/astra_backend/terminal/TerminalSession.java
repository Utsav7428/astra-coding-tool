package com.utsav.astra_backend.terminal;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TerminalSession {

    private final String id;

    private final Process process;

    private final BufferedWriter stdin;

    private final Path workingDirectory;

    private final ExecutorService outputExecutor =
            Executors.newFixedThreadPool(2);

    private volatile TerminalState state =
            TerminalState.RUNNING;

    public TerminalSession(
            Path workingDirectory
    ) throws IOException {

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

        this.id =
                UUID.randomUUID().toString();

        this.workingDirectory =
                workingDirectory.toAbsolutePath()
                        .normalize();

        this.process =
                new ProcessBuilder(
                        "cmd.exe",
                        "/Q"
                )
                        .directory(
                                this.workingDirectory.toFile()
                        )
                        .redirectErrorStream(false)
                        .start();

        this.stdin =
                new BufferedWriter(
                        new OutputStreamWriter(
                                process.getOutputStream(),
                                StandardCharsets.UTF_8
                        )
                );

        startOutputReaders();
    }

    public String id() {
        return id;
    }

    public Path workingDirectory() {
        return workingDirectory;
    }

    public TerminalState state() {
        return state;
    }

    public synchronized void execute(
            String command
    ) {

        if (state != TerminalState.RUNNING) {
            throw new IllegalStateException(
                    "Terminal session is stopped"
            );
        }

        if (command == null ||
                command.isBlank()) {

            throw new IllegalArgumentException(
                    "Command cannot be empty"
            );
        }

        try {

            stdin.write(command);
            stdin.newLine();
            stdin.flush();

        } catch (IOException e) {

            state = TerminalState.STOPPED;

            throw new RuntimeException(
                    "Failed to execute command",
                    e
            );
        }
    }

    private void startOutputReaders() {

        outputExecutor.submit(
                () -> readOutput(
                        process.getInputStream(),
                        false
                )
        );

        outputExecutor.submit(
                () -> readOutput(
                        process.getErrorStream(),
                        true
                )
        );
    }

    private void readOutput(
            java.io.InputStream stream,
            boolean error
    ) {

        try (
                BufferedReader reader =
                        new BufferedReader(
                                new InputStreamReader(
                                        stream,
                                        StandardCharsets.UTF_8
                                )
                        )
        ) {

            String line;

            while (
                    state == TerminalState.RUNNING &&
                            (line = reader.readLine()) != null
            ) {

                if (error) {

                    System.err.println(
                            "[Terminal " +
                                    id +
                                    "] " +
                                    line
                    );

                } else {

                    System.out.println(
                            "[Terminal " +
                                    id +
                                    "] " +
                                    line
                    );
                }
            }

        } catch (IOException e) {

            if (state == TerminalState.RUNNING) {

                System.err.println(
                        "Terminal output reader failed: "
                                + e.getMessage()
                );
            }
        }
    }

    public synchronized void stop() {

        if (state == TerminalState.STOPPED) {
            return;
        }

        state = TerminalState.STOPPED;

        try {
            stdin.close();
        } catch (IOException ignored) {
        }

        process.destroy();

        if (process.isAlive()) {
            process.destroyForcibly();
        }

        outputExecutor.shutdownNow();
    }
}